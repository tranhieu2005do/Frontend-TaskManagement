import React from 'react';

const QuickActions = ({ actions }) => {
  return (
    <div className="quick-actions">
      {actions.map((action) => (
        <button key={action.label} onClick={action.onClick} className="action-chip">
          {action.icon} {action.label}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
