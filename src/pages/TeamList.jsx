import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getTeams, getTeamMembers, getTeamTasks} from '../api/teamApi';
import { createTask } from '../api/taskApi';
import { addMemberToTeam } from '../api/teamMemberApi';
import '../styles/dashboard.css';
import '../styles/teamModal.css';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('members'); // 'members' or 'tasks'
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Create Task Modal States
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [createTaskLoading, setCreateTaskLoading] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    owner: []
  });

  // Add Member Modal States
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [email, setemail] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError('');
      try {
        const teamList = await getTeams();
        setTeams(teamList);
      } catch (err) {
        console.error('Fetch teams error:', err);
        setError('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleTeamClick = async (team) => {
    console.log("Click")
    setSelectedTeam(team);
    setModalOpen(true);
    setActiveTab('members'); // Reset to members tab
    setModalLoading(true);

    try {
      const [membersData, tasksData] = await Promise.all([
        getTeamMembers(team.team_id),
        getTeamTasks(team.team_id),
      ]);
      console.log("Get tasks response: ", tasksData);
      console.log("Get members response: ", membersData);
      setMembers(membersData);
      setTasks(tasksData);
    } catch (err) {
      console.error('Fetch team details error:', err);
      setError('Failed to load team details');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTeam(null);
    setMembers([]);
    setTasks([]);
    setActiveTab('members');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Open Create Task Modal
  const openCreateTaskModal = () => {
    setCreateTaskModalOpen(true);
    setActiveTab('tasks'); // Switch to tasks tab
  };

  // Close Create Task Modal
  const closeCreateTaskModal = () => {
    setCreateTaskModalOpen(false);
    setTaskFormData({
      title: '',
      description: '',
      dueDate: '',
      owner: []
    });
  };

  // Handle form input changes
  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle owner selection
  const handleOwnerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setTaskFormData(prev => ({
      ...prev,
      owner: selectedOptions
    }));
  };

  // Submit Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateTaskLoading(true);

    try {
      const taskData = {
        team_id: selectedTeam.team_id,
        title: taskFormData.title,
        description: taskFormData.description,
        due_date: taskFormData.dueDate,
        owner: taskFormData.owner
      };

      const newTask = await createTask(taskData);
      console.log("New task response:", newTask.data);
      console.log(tasks);
      // Optimistic local update (avoid stale view and reduce extra API hit)
      setTasks((prev) => [newTask.data, ...prev]);
      
      // Close modal and reset form
      closeCreateTaskModal();
      setError('');
    } catch (err) {
      console.error('Create task error:', err);
      setError('Failed to create task');
    } finally {
      setCreateTaskLoading(false);
    }
  };

  // Open Add Member Modal
  const openAddMemberModal = () => {
    setAddMemberModalOpen(true);
    setActiveTab('members'); // Switch to members tab
  };

  // Close Add Member Modal
  const closeAddMemberModal = () => {
    setAddMemberModalOpen(false);
    setemail('');
    setError('');
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    setemail(e.target.value);
  };

  // Submit Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddMemberLoading(true);

    try {
      await addMemberToTeam(selectedTeam.team_id, email);
    
      // Refresh members list
      const membersData = await getTeamMembers(selectedTeam.team_id);
      setMembers(membersData);
      
      // Close modal and reset form
      closeAddMemberModal();
      setError('');
    } catch (err) {
      console.error('Add member error:', err);
      setError('Failed to add member. Please check the email and try again.');
    } finally {
      setAddMemberLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="profile-header">
          <h1>My Teams</h1>
          <p>View and manage your teams</p>
        </div>

        {error && <div className="dashboard-error">{error}</div>}

        {loading ? (
          <div className="dashboard-loading">Loading teams...</div>
        ) : (
          <div className="teams-grid">
            {teams.length > 0 ? (
              teams.map((team) => (
                <div
                  key={team.team_id}
                  className="team-card"
                  onClick={() => handleTeamClick(team)}
                >
                  <div className="team-card-header">
                    <h3>{team.team_name}</h3>
                  </div>
                  <p className="team-description">{team.description}</p>
                  <div className="team-card-body">
                    <div className="team-stat">
                      <span className="stat-value">{team.number_of_members}</span>
                      <span className="stat-label">Members</span>
                    </div>
                    <div className="team-stat">
                      <span className="stat-value">{team.number_of_tasks}</span>
                      <span className="stat-label">Tasks</span>
                    </div>
                  </div>
                  <div className="team-card-footer">
                    <span className="created-by">Created by: {team.created_by}</span>
                    <button className="btn-view">View Details →</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No teams found</p>
            )}
          </div>
        )}

        {modalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content team-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedTeam?.team_name}</h2>
                <div className="modal-header-actions">
                  <button className="btn-add-member" onClick={openAddMemberModal}>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add Member
                  </button>
                  <button className="btn-create-task" onClick={openCreateTaskModal}>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Task
                  </button>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
              </div>

              <div className="modal-tabs">
                <button
                  className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
                  onClick={() => setActiveTab('members')}
                >
                  <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Thành viên
                  <span className="tab-count">{members.length}</span>
                </button>
                <button
                  className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tasks')}
                >
                  <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Tasks
                  <span className="tab-count">{tasks.length}</span>
                </button>
              </div>

              {modalLoading ? (
                <div className="modal-loading">
                  <div className="loading-spinner"></div>
                  <p>Đang tải thông tin team...</p>
                </div>
              ) : (
                <div className="modal-body">
                  {activeTab === 'members' && (
                    <div className="tab-content">
                      {members.length > 0 ? (
                        <div className="members-list">
                          {members.map((member) => (
                            <div key={member.user_id} className="member-item">
                              <div className="member-avatar">
                                {member.user_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="member-info">
                                <span className="member-name">{member.user_name}</span>
                                <span className="member-role">{member.role}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state-content">
                          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p>Chưa có thành viên nào</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'tasks' && (
                    <div className="tab-content">
                      {tasks.length > 0 ? (
                        <div className="tasks-list">
                          {tasks.map((task) => (
                            <div key={task.task_id} className="task-item">
                              <div className="task-header">
                                <h4>{task.title}</h4>
                                <span className={`task-status status-${task.status.toLowerCase().replace('_', '-')}`}>
                                  {task.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="task-description">{task.description}</p>
                              <div className="task-meta">
                                <div className="meta-item">
                                  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span>{task.created_by}</span>
                                </div>
                                <div className="meta-item">
                                  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{formatDate(task.due_date)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state-content">
                          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          <p>Chưa có task nào</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Create Task Modal */}
            {createTaskModalOpen && (
              <div className="nested-modal-overlay" onClick={closeCreateTaskModal}>
                <div className="nested-modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="nested-modal-header">
                    <h3>Tạo Task Mới</h3>
                    <button className="modal-close" onClick={closeCreateTaskModal}>×</button>
                  </div>

                  <form onSubmit={handleCreateTask} className="task-form">
                    <div className="form-group">
                      <label htmlFor="title">Tiêu đề <span className="required">*</span></label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={taskFormData.title}
                        onChange={handleTaskFormChange}
                        placeholder="Nhập tiêu đề task"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Mô tả <span className="required">*</span></label>
                      <textarea
                        id="description"
                        name="description"
                        value={taskFormData.description}
                        onChange={handleTaskFormChange}
                        placeholder="Nhập mô tả chi tiết task"
                        rows="4"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="dueDate">Ngày hết hạn <span className="required">*</span></label>
                      <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={taskFormData.dueDate}
                        onChange={handleTaskFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="owner">Người thực hiện <span className="required">*</span></label>
                      <select
                        id="owner"
                        name="owner"
                        multiple
                        value={taskFormData.owner}
                        onChange={handleOwnerChange}
                        className="multi-select"
                        required
                      >
                        {members.map((member, index) => (
                          <option key={index} value={member.email || member.user_name}>
                            {member.user_name} ({member.role})
                          </option>
                        ))}
                      </select>
                      <small className="form-hint">Giữ Ctrl (hoặc Cmd) để chọn nhiều người</small>
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={closeCreateTaskModal}
                        disabled={createTaskLoading}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="btn-submit"
                        disabled={createTaskLoading}
                      >
                        {createTaskLoading ? (
                          <>
                            <span className="btn-spinner"></span>
                            Đang tạo...
                          </>
                        ) : (
                          'Tạo Task'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Add Member Modal */}
            {addMemberModalOpen && (
              <div className="nested-modal-overlay" onClick={closeAddMemberModal}>
                <div className="nested-modal-content add-member-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="nested-modal-header">
                    <h3>Thêm Thành Viên</h3>
                    <button className="modal-close" onClick={closeAddMemberModal}>×</button>
                  </div>

                  <form onSubmit={handleAddMember} className="member-form">
                    <div className="form-group">
                      <label htmlFor="email">
                        Email thành viên <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="example@email.com"
                        required
                      />
                      <small className="form-hint">
                        Nhập email của người dùng bạn muốn thêm vào team
                      </small>
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={closeAddMemberModal}
                        disabled={addMemberLoading}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="btn-submit"
                        disabled={addMemberLoading}
                      >
                        {addMemberLoading ? (
                          <>
                            <span className="btn-spinner"></span>
                            Đang thêm...
                          </>
                        ) : (
                          'Thêm Thành Viên'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamList;