import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import websocketService from '../socket/websocketService';

export const WebSocketContext = createContext({
    isConnected: false,
    subscribe: () => () => { },
    publish: () => { },
});

/**
 * WebSocketProvider
 * 
 * Context provider that manages the global WebSocket connection lifecycle.
 * It connects automatically if a token is found in sessionStorage.
 */
export const WebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);

    // Monitor connection state from the service
    useEffect(() => {
        // Poll for connection state or use a more reactive approach if needed
        // For simplicity, we'll just use the service's internal state
        const interval = setInterval(() => {
            setIsConnected(websocketService.isConnected);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Handle initial connection and cleanup
    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            websocketService.connect(token);
        }

        // We don't disconnect on unmount here because this is the global provider
        // Disconnect should be handled explicitly on logout or app close
        return () => {
            // websocketService.disconnect();
        };
    }, []);

    const subscribe = useCallback((topic, callback) => {
        return websocketService.subscribe(topic, callback);
    }, []);

    const publish = useCallback((topic, body) => {
        websocketService.publish(topic, body);
    }, []);

    return (
        <WebSocketContext.Provider value={{ isConnected, subscribe, publish }}>
            {children}
        </WebSocketContext.Provider>
    );
};
