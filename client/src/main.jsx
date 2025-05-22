import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import Login from './components/Login';
import Register from './components/Register';
import Upload from './components/Upload';
import Home from './components/Home';
import VideoPlayer from './components/VideoPlayer.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // Wraps all children with Navbar + Outlet
    children: [
      { path: '', element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'upload', element: <Upload /> },
      { path: 'videos/video/:id', element: <VideoPlayer /> }, // Main video player route
      // Remove the duplicate videoplayer route since we're using /video/:id
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);