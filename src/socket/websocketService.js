import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Global WebSocket Service (Singleton)
 * 
 * Manages a single STOMP over SockJS connection for the entire application.
 * Handles automatic reconnection, subscription management, and queuing.
 */
class WebSocketService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionPromise = null;
        this.subscribers = new Map(); // topic -> Set of callbacks
        this.subscriptions = new Map(); // topic -> STOMP subscription object
        this.onConnectCallbacks = [];
    }

    /**
     * Initialize and connect the WebSocket client.
     * @param {string} token - JWT authentication token
     */
    connect(token) {
        if (this.client && (this.client.active || this.client.connected)) {
            console.log('[WebSocketService] Already connected or connecting');
            return;
        }

        console.log('[WebSocketService] Initiating connection...');

        this.client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL || ''}/ws`),
            connectHeaders: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                // Uncomment for verbose debugging
                // console.debug('[WebSocketService STOMP]', str);
            },
            onConnect: () => {
                console.log('[WebSocketService] Connected');
                this.isConnected = true;

                // Process any queued connection callbacks
                this.onConnectCallbacks.forEach(cb => cb());
                this.onConnectCallbacks = [];

                // Re-subscribe to all active topics (if any)
                // This handles cases where connection drops and recovers
                this.subscribers.forEach((callbacks, topic) => {
                    this._subscribeToTopic(topic);
                });
            },
            onDisconnect: () => {
                console.log('[WebSocketService] Disconnected');
                this.isConnected = false;
                this.subscriptions.clear();
            },
            onStompError: (frame) => {
                console.error('[WebSocketService] STOMP Error:', frame.headers['message']);
            },
            onWebSocketError: (event) => {
                console.error('[WebSocketService] WebSocket Error:', event);
            }
        });

        this.client.activate();
    }

    /**
     * Disconnect the WebSocket client.
     */
    disconnect() {
        if (this.client) {
            console.log('[WebSocketService] Deactivating client...');
            this.client.deactivate();
            this.client = null;
            this.isConnected = false;
            this.subscriptions.clear();
            this.subscribers.clear();
        }
    }

    /**
     * Subscribe to a topic.
     * @param {string} topic - The destination topic (e.g., /topic/notifications)
     * @param {function} callback - Function called with the parsed message body
     * @returns {function} Unsubscribe function
     */
    subscribe(topic, callback) {
        if (!topic || !callback) return () => { };

        console.log(`[WebSocketService] Adding subscriber for: ${topic}`);

        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
        }
        this.subscribers.get(topic).add(callback);

        // If already connected, perform actual STOMP subscription
        if (this.isConnected) {
            this._subscribeToTopic(topic);
        } else {
            // Subscription will happen automatically in onConnect
        }

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(topic);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.subscribers.delete(topic);
                    this._unsubscribeFromTopic(topic);
                }
            }
        };
    }

    /**
     * Internal helper to perform actual STOMP subscription.
     */
    _subscribeToTopic(topic) {
        if (this.subscriptions.has(topic)) return;

        const subscription = this.client.subscribe(topic, (message) => {
            if (!message?.body) return;
            try {
                const data = JSON.parse(message.body);
                const callbacks = this.subscribers.get(topic);
                if (callbacks) {
                    callbacks.forEach(cb => cb(data));
                }
            } catch (err) {
                console.error(`[WebSocketService] Parse error on ${topic}:`, err);
            }
        });

        this.subscriptions.set(topic, subscription);
        console.log(`[WebSocketService] STOMP subscription active for: ${topic}`);
    }

    /**
     * Internal helper to perform actual STOMP unsubscription.
     */
    _unsubscribeFromTopic(topic) {
        const subscription = this.subscriptions.get(topic);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(topic);
            console.log(`[WebSocketService] STOMP subscription removed for: ${topic}`);
        }
    }

    /**
     * Publish a message to a destination.
     * @param {string} destination - The target destination (e.g., /app/chat)
     * @param {object} payload - The message payload (will be JSON stringified)
     */
    publish(destination, payload) {
        if (!this.isConnected || !this.client) {
            console.warn('[WebSocketService] Cannot publish: not connected');
            return;
        }

        this.client.publish({
            destination,
            body: JSON.stringify(payload)
        });
    }
}

const serviceInstance = new WebSocketService();
export default serviceInstance;
