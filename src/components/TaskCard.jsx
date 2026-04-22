import React, { useState } from 'react';
import './TaskCard.css';

const TaskCard = ({ task, onUpdate, onViewDetails, isNew }) => {
  const [hover, setHover] = useState(false);

  // Calculate urgency (less than 24h)
  const isUrgent = () => {
    if (!task.due_date || task.status === 'done') return false;
    const diff = new Date(task.due_date) - new Date();
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  const isOverdue = task.due_date ? new Date(task.due_date) < new Date() && task.status !== 'done' && task.status !== 'over_due' : false;

  const getStatusLabel = () => {
    switch (task.status) {
      case 'done': return 'Done';
      case 'over_due': return 'Overdue';
      case 'in_progress': return 'In Progress';
      case 'review': return 'Review';
      case 'todo':
      default: return 'To Do';
    }
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return 'No deadline';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleQuickAction = (e, nextStatus) => {
    e.stopPropagation();
    onUpdate(task.task_id || task.id, { status: nextStatus });
  };

  return (
    <div
      className={`task-kanban-card ${isNew ? 'task-card-new' : ''} ${isOverdue ? 'overdue' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onViewDetails(task)}
    >
      <div className="task-card-tag-row">
        <span className={`task-status-badge ${task.status}`}>
          {getStatusLabel()}
        </span>
        {task.priority && (
          <span className={`task-priority-badge ${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        )}
      </div>

      <h3 className="task-card-title">{task.title}</h3>

      <p className="task-card-description">
        {task.description || 'No description provided.'}
      </p>

      <div className="task-card-meta-main">
        <div className={`task-card-due ${isUrgent() ? 'urgent' : ''} ${isOverdue ? 'overdue' : ''}`}>
          <span className="meta-icon">📅</span>
          <span>{formatDueDate(task.due_date)}</span>
        </div>

        <div className="task-card-creator" title={`Created by ${task.created_by_name || 'System'}`}>
          <div className="creator-avatar">
            {(task.created_by_name || 'S')[0].toUpperCase()}
          </div>
        </div>
      </div>

      {hover && (
        <div className="task-card-quick-actions">
          {task.status === 'todo' && (
            <button className="btn-quick start" onClick={(e) => handleQuickAction(e, 'in_progress')}>
               Start
            </button>
          )}
          {task.status === 'in_progress' && (
            <button className="btn-quick review" onClick={(e) => handleQuickAction(e, 'review')}>
               Review
            </button>
          )}
          {(task.status === 'review' || task.status === 'todo' || task.status === 'in_progress' || task.status === 'over_due') && (
            <button className="btn-quick done" onClick={(e) => handleQuickAction(e, 'done')}>
               Done
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
