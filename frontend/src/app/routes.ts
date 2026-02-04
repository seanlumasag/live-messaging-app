import { createBrowserRouter, redirect } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Chat } from './pages/Chat';

// Simple auth check
const checkAuth = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (!isAuthenticated) {
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
    path: '*',
    Component: Landing,
  },
]);
