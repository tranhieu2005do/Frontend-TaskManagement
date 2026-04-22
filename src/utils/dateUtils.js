/**
 * Returns the Date object for the Monday of the week containing the given date.
 */
export const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
};

/**
 * Returns an array of 7 Date objects representing the current week (Monday to Sunday).
 */
export const getCurrentWeek = (startDate = new Date()) => {
    const days = [];
    const start = getStartOfWeek(startDate);
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
    }
    return days;
};

/**
 * Formats a date for the calendar header (e.g., "Mon 25").
 */
export const formatDayTitle = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]} ${date.getDate()}`;
};

/**
 * Checks if two Date objects represent the same calendar day.
 */
export const isSameDay = (date1, date2) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

/**
 * Groups tasks by their due date if it falls within the given week.
 */
export const groupTasksByDate = (tasks, weekDays) => {
    const grouped = {};

    weekDays.forEach(day => {
        const dateStr = day.toISOString().split('T')[0];
        grouped[dateStr] = tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            return isSameDay(taskDate, day);
        });
    });

    return grouped;
};

/**
 * Returns a relative time string (e.g., "2 mins ago", "1 hour ago", "Yesterday", or "15:30").
 */
export const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        // If it's today, show time
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
