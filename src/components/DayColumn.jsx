import React from 'react';
import CalendarTaskItem from './CalendarTaskItem';

const DayColumn = ({ day, tasks, isToday, onTaskClick }) => {
    const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = day.getDate();

    // Limiting visible tasks
    const maxTasks = 4;
    const visibleTasks = tasks.slice(0, maxTasks);
    const moreCount = tasks.length - maxTasks;

    return (
        <div className={`calendar-day-column ${isToday ? 'is-today' : ''}`}>
            <div className="calendar-day-header">
                <span className="day-name">{dayName}</span>
                <span className="day-number">{dayNumber}</span>
            </div>
            <div className="calendar-day-tasks">
                {visibleTasks.length > 0 ? (
                    visibleTasks.map((task, idx) => (
                        <CalendarTaskItem key={task.task_id || idx} task={task} onClick={onTaskClick} />
                    ))
                ) : (
                    <div className="calendar-empty-day">Free</div>
                )}
                {moreCount > 0 && <div className="calendar-more-tasks">+{moreCount} more</div>}
            </div>
        </div>
    );
};

export default DayColumn;
