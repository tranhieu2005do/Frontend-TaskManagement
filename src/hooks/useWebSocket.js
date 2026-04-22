import { useContext } from 'react';
import { WebSocketContext } from '../context/WebSocketContext';

/**
 * useWebSocket
 * 
 * Custom hook to easily interact with the global WebSocket connection.
 */
const useWebSocket = () => {
    const context = useContext(WebSocketContext);

    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }

    return context;
};

export default useWebSocket;
