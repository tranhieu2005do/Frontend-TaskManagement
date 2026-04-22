import React from 'react';
import '../styles/dashboard.css';

const TeamCard = ({ title, description, onClick }) => {
  return (
    <div className="team-card" onClick={onClick}>
      <div className="team-card-header">
        <h3>{title}</h3>
        <span className="team-icon">👥</span>
      </div>
      <p className="team-description">{description}</p>
      <div className="team-card-footer">
        <button className="btn-view">View Team →</button>
      </div>
    </div>
  );
};

export default TeamCard;
