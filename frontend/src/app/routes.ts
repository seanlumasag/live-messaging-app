import { createBrowserRouter, redirect } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Chat } from './pages/Chat';
import { Settings } from './pages/Settings';

// Simple auth check
const checkAuth = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return redirect('/auth');
  }
  return null;
};

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/auth',
    Component: Auth,
  },
  {
    path: '/chat',
    Component: Chat,
    loader: checkAuth,
  },
  {
    path: '/settings',
    Component: Settings,
    loader: checkAuth,
  },
  {
    path: '*',
    Component: Landing,
  },
]);
