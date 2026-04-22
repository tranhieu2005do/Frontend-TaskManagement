import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TeamCard from '../components/TeamCard';
import TaskItem from '../components/TaskItem';
import StatCard from '../components/StatCard';
import QuickActions from '../components/QuickActions';
import WeeklyCalendar from '../components/WeeklyCalendar';
import TaskDetailModal from '../components/TaskDetailModal';
import { getTeams } from '../api/teamApi';
import { getUnfinishedTasks } from '../api/taskApi';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const [username, setUsername] = useState('');
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const totalTasks = tasks.length;
  const totalTeams = teams.length;
  const overdueTasks = tasks.filter((item) => item.status === 'OVERDUE' || (item.due_date && new Date(item.due_date) < new Date())).length;
  const completedToday = tasks.filter((item) => item.status === 'DONE' && new Date(item.updated_at).toLocaleDateString() === new Date().toLocaleDateString()).length;

  const quickActions = [
    { label: `Today (${totalTasks})`, onClick: () => { } },
    { label: `Overdue (${overdueTasks})`, onClick: () => { } },
    { label: `Completed (${completedToday})`, onClick: () => { } },
    // { icon: '➕', label: 'Add Task', onClick: () => navigate('/create-task') },
  ];

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (!storedUsername) {
      navigate('/login');
      return;
    }

    const cleanUsername = (storedUsername || '').replace(/"/g, '');
    setUsername(cleanUsername);

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [teamList, taskList] = await Promise.all([
          getTeams(),
          getUnfinishedTasks(),
        ]);

        setTeams(Array.isArray(teamList) ? teamList : []);
        setTasks(Array.isArray(taskList) ? taskList : []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleTeamClick = (teamId) => {
    navigate(`/teams`);
  };

  const handleCreateTeam = () => {
    navigate('/create-team');
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="greeting">
            <h1>Good day, {username}</h1>
            <p className="date">Today: {today}</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={handleCreateTeam}>
              + Create Team
            </button>
            {/* <button className="btn-icon">🔔 3</button> */}
          </div>
        </div>

        <div className="stats-grid">
          <StatCard value={totalTasks} label="Total Tasks" />
          <StatCard value={totalTeams} label="Teams" />
          <StatCard value={overdueTasks} label="Overdue" color="#eb5a46" />
          <StatCard value={completedToday} label="Done Today" color="#2f8a3c" />
        </div>

        <QuickActions actions={quickActions} />

        {error && <div className="dashboard-error">{error}</div>}

        {loading ? (
          <div className="dashboard-loading">Loading dashboard...</div>
        ) : (
          <>
            {/* Weekly Schedule Section */}
            <WeeklyCalendar tasks={tasks} onTaskClick={handleTaskClick} />

            <div className="section">
              <div className="section-header">
                <h2 className="section-title">My Teams</h2>
              </div>
              <div className="card-grid">
                {teams.slice(0, 3).map((team, index) => {
                  const teamId = team.team_name || team.title || String(index);
                  return (
                    <TeamCard
                      key={teamId}
                      title={team.title}
                      description={team.description}
                      onClick={() => handleTeamClick(teamId)}
                    />
                  );
                })}
              </div>
              {teams.length > 3 && (
                <div className="view-all-row">
                  <button className="view-all-btn" onClick={() => navigate('/teams')}>
                    View All →
                  </button>
                </div>
              )}
              {teams.length === 0 && <p className="empty-state">No teams available</p>}
            </div>

            <div className="section">
              <div className="section-header">
                <h2 className="section-title">My Tasks</h2>
              </div>
              <div className="card-grid">
                {tasks.slice(0, 3).map((task, index) => (
                  <div key={task.task_id || `${task.title}-${index}`} onClick={() => handleTaskClick(task)}>
                    <TaskItem
                      title={task.title}
                      teamName={task.team_name}
                      dueDate={task.due_date}
                    />
                  </div>
                ))}
              </div>
              {tasks.length > 3 && (
                <div className="view-all-row">
                  <button className="view-all-btn" onClick={() => navigate('/tasks')}>
                    View All →
                  </button>
                </div>
              )}
              {tasks.length === 0 && <p className="empty-state">No tasks assigned yet</p>}
            </div>
          </>
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          isOpen={isModalOpen}
          task={selectedTask}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
