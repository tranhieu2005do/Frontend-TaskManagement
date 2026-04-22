import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { NotificationProvider } from './context/NotificationContext';
import { GroupChatProvider } from './context/GroupChatContext';
import { WebSocketProvider } from './context/WebSocketContext';
import './index.css';
import './api/axiosInterceptor';

import { ToastProvider } from './context/ToastContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <WebSocketProvider>
        <NotificationProvider>
          <GroupChatProvider>
            <RouterProvider router={router} />
          </GroupChatProvider>
        </NotificationProvider>
      </WebSocketProvider>
    </ToastProvider>
  </React.StrictMode>
);
