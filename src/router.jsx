import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import FacebookCallback from './pages/FacebookCallback';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import TeamList from './pages/TeamList';
import Notifications from './pages/Notifications';
import MyTasksPage from './pages/MyTasks';
import CreateTeam from './pages/CreateTeam';
import GroupChat from './pages/GroupChat';
import TaskDetailsPage from './pages/TaskDetailsPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/oauth2/callback/google',
    element: <GoogleCallback />,
  },
  {
    path: '/facebook/callback',
    element: <FacebookCallback />,
  },
  {
    path: '/group-chat',
    element: <GroupChat />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/notifications',
    element: <Notifications />,
  },
  {
    path: '/tasks',
    element: <MyTasksPage />,
  },
  {
    path: '/my-tasks',
    element: <MyTasksPage />,
  },
  {
    path: '/mytasks/:taskId',
    element: <TaskDetailsPage />,
  },
  {
    path: '/teams/:id',
    element: <Dashboard />, // Placeholder - will be replaced with TeamDetail component
  },
  {
    path: '/teams',
    element: <TeamList />,
  },
  {
    path: '/create-team',
    element: <CreateTeam />,
  },
  {
    path: '/create-task',
    element: <Dashboard />, // Placeholder - will be replaced with CreateTask component
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
