import React from 'react';

const StatCard = ({ icon, value, label, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ color: color || '#0079BF' }}>
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default StatCard;
