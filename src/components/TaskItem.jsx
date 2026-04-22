import React from 'react';
import '../styles/dashboard.css';

const TaskItem = ({ title, teamName, dueDate }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;
  const today = new Date().toISOString().split('T')[0];
  const isToday = dueDate === today;
  const daysUntilDue = dueDate
    ? Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const getDeadlineStatus = () => {
    if (!dueDate) return 'No due date';
    if (isOverdue) return 'Overdue';
    if (isToday) return 'Due Today';
    if (daysUntilDue !== null && daysUntilDue <= 3) return `${daysUntilDue}d left`;
    return formatDate(dueDate);
  };

  const isUrgent = daysUntilDue !== null && daysUntilDue <= 3;

  return (
    <div
      className={`task-item ${isUrgent ? 'urgent' : ''} ${
        isOverdue ? 'overdue' : ''
      }`}
    >
      <div className="task-header">
        <h4>{title}</h4>
        {(isUrgent || isOverdue) && (
          <span className="task-badge">
            {isOverdue ? ' Overdue' : ' Urgent'}
          </span>
        )}
      </div>
      <div className="task-meta">
        <span className="task-team"> {teamName}</span>
        <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
           {getDeadlineStatus()}
        </span>
      </div>
    </div>
  );
};

export default TaskItem;
