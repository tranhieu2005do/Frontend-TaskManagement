import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import { getTasks, updateTask, getElasticSearchTasks } from '../api/tasksApi';
import websocketService from '../socket/websocketService';
import '../styles/dashboard.css';
import '../styles/MyTasks.css';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' }
];

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [newlyAddedTaskIds, setNewlyAddedTaskIds] = useState(new Set());
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (sortBy === 'dueDate') params.sortBy = 'due_date';
      else if (sortBy === 'priority') params.sortBy = 'priority';

      const data = await getTasks(params);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load tasks.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  const handleSearchSubmit = async () => {
    const keyword = searchTerm.trim();
    if (!keyword) {
      setIsSearching(false);
      setSearchResults([]);
      fetchData();
      return;
    }

    setIsSearching(true);
    setLoading(true);
    setError('');
    try {
      const data = await getElasticSearchTasks({ keyword });
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to search tasks.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time updates via WebSocket
  useEffect(() => {
    const userId = sessionStorage.getItem('user_id');
    const unsubscribe = websocketService.subscribe(`/topic/notification-tasks/${userId}`, (notification) => {
      if (notification) {
        // Trigger flash effect for this task
        const taskId = notification.id || notification.task_id;
        if (taskId) {
          setNewlyAddedTaskIds(prev => new Set(prev).add(taskId));
          setTimeout(() => {
            setNewlyAddedTaskIds(prev => {
              const next = new Set(prev);
              next.delete(taskId);
              return next;
            });
          }, 3000);
        }
        fetchData(); // Refresh list to get latest data
      }
    });
    return () => unsubscribe();
  }, [fetchData]);

  const onUpdateTask = async (taskId, payload) => {
    try {
      const apiPayload = { ...payload, version: tasks.find(task => task.task_id === taskId).version };
      if (payload.status) {
        apiPayload.new_status = payload.status;
        delete apiPayload.status;
      }
      await updateTask(taskId, apiPayload);
      console.log("apiPayload", apiPayload);
      // Update local state for immediate feedback
      setTasks(prev => prev.map(task => {
        const id = task.task_id || task.id;
        if (id === taskId) {
          return { ...task, status: payload.status || task.status };
        }
        return task;
      }));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const tasksByColumn = useMemo(() => {
    const groups = {};
    COLUMNS.forEach(col => groups[col.id] = []);

    tasks.forEach(task => {
      let status = task.status || 'todo';
      if (status === 'over_due') status = 'todo'; // Map overdue to todo for kanban columns
      if (groups[status]) {
        groups[status].push(task);
      }
    });
    return groups;
  }, [tasks]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="greeting">
            <h1>My Tasks</h1>
            <p className="date">Horizontal Board • {new Intl.DateTimeFormat('en-GB').format(new Date())}</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="search-container">
              <span className="search-icon-overlay">🔍</span>
              <input
                type="text"
                className="search-input-field"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              onClick={handleSearchSubmit}
              style={{ padding: '0 16px', borderRadius: '4px', border: 'none', background: '#0052cc', color: 'white', cursor: 'pointer', height: '36px', fontWeight: '500' }}
            >
              Search
            </button>
          </div>
        </div>

        <div className="tasks-header-controls">
          <div className="filter-group">
            <span style={{ fontSize: '13px', color: '#5e6c84', fontWeight: '600' }}>Sort By:</span>
            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading">Loading...</div>
        ) : error ? (
          <div className="dashboard-error">{error}</div>
        ) : isSearching ? (
          <div className="search-results-container" style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#172b4d' }}>Search Results ({searchResults.length})</h2>
            {searchResults.length === 0 ? (
              <div className="tasks-row-empty" style={{ marginTop: '20px', textAlign: 'center', padding: '40px', background: '#f4f5f7', borderRadius: '8px' }}>
                No tasks found
              </div>
            ) : (
              <div className="tasks-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {searchResults.map(task => (
                  <div key={task.task_id || task.id} style={{ flex: '0 0 calc(25% - 12px)', minWidth: '280px' }}>
                    <TaskCard
                      task={task}
                      isNew={newlyAddedTaskIds.has(task.task_id || task.id)}
                      onUpdate={onUpdateTask}
                      onViewDetails={(t) => {
                        navigate(`/mytasks/${t.task_id || t.id}`);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="tasks-rows-container">
            {COLUMNS.map(column => (
              <section key={column.id} className={`tasks-row-section ${column.id}`}>
                <div className="tasks-row-header">
                  <h3 className="tasks-row-title">{column.title}</h3>
                  <span className="tasks-row-count">{tasksByColumn[column.id].length}</span>
                </div>

                <div className="tasks-horizontal-scroll">
                  {tasksByColumn[column.id].length === 0 ? (
                    <div className="tasks-row-empty">
                      No tasks in this section
                    </div>
                  ) : (
                    tasksByColumn[column.id].map(task => (
                      <TaskCard
                        key={task.task_id || task.id}
                        task={task}
                        isNew={newlyAddedTaskIds.has(task.task_id || task.id)}
                        onUpdate={onUpdateTask}
                        onViewDetails={(t) => {
                          navigate(`/mytasks/${t.task_id || t.id}`);
                        }}
                      />
                    ))
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyTasksPage;