import React from 'react';
import DayColumn from './DayColumn';
import { getCurrentWeek, isSameDay, groupTasksByDate } from '../utils/dateUtils';

const WeeklyCalendar = ({ tasks, onTaskClick }) => {
    const today = new Date();
    const weekDays = getCurrentWeek(today);
    const groupedTasks = groupTasksByDate(tasks, weekDays);

    return (
        <div className="weekly-calendar-container">
            <div className="weekly-calendar-header">
                <h3>Weekly Schedule</h3>
            </div>
            <div className="weekly-calendar-grid">
                {weekDays.map((day, index) => {
                    const dateStr = day.toISOString().split('T')[0];
                    return (
                        <DayColumn
                            key={index}
                            day={day}
                            tasks={groupedTasks[dateStr] || []}
                            isToday={isSameDay(day, today)}
                            onTaskClick={onTaskClick}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyCalendar;
