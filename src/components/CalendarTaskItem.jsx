import React from 'react';

const CalendarTaskItem = ({ task, onClick }) => {
    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DONE': return '#2f8a3c';
            case 'IN_PROGRESS': return '#0079bf';
            case 'TODO': return '#5e6c84';
            default: return '#5e6c84';
        }
    };

    return (
        <div className="calendar-task-item" onClick={() => onClick(task)}>
            <div className="calendar-task-header">
                <span className="calendar-task-title">{task.title}</span>
                {task.due_date && <span className="calendar-task-time">{formatTime(task.due_date)}</span>}
            </div>
            <div className="calendar-task-status" style={{ backgroundColor: getStatusColor(task.status) }}>
                {task.status}
            </div>
        </div>
    );
};

export default CalendarTaskItem;
