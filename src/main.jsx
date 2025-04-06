import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import  Home  from "./My_Comp/Home/Home.jsx";
import CameraTable from "./My_Comp/CameraManagement/CameraTable";
import SettingsForm  from "./My_Comp/Setting/SettingsForm";
import React from 'react';
import ReactDOM from 'react-dom/client';
import  MainLayout  from "./PageLayout/MainLayout"; 
import UserManagement from "./My_Comp/UserManagement/UserManagement.jsx";
import AreaManagement from "./My_Comp/AreaManagement/AreaManagement.jsx";
import UserManagement2 from "./My_Comp/UserManagement/usr_mgt_2.jsx";
import Login from "./My_Comp/Login/Login.jsx";
import LogReports from "./My_Comp/LogReports/LogReports.jsx"
import AddCamera from "./My_Comp/CameraManagement/AddCamera.jsx";
import AddArea from "./My_Comp/AreaManagement/AddArea.jsx";
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Dashboard from './My_Comp/Dashboard/Dashboard.jsx';
import EditUser from './My_Comp/UserManagement/EditUser.jsx';
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="Login" replace />
      },
      {
        path: 'Login',
        element: <Login />
      },
      {
        path: 'Home',
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )
      },
      {
        path: 'Settings',
        element: (
          <ProtectedRoute>
            <SettingsForm />
          </ProtectedRoute>
        )
      },
      {
        path: 'CameraManagement',
        element: (
          <ProtectedRoute>
            <CameraTable />
          </ProtectedRoute>
        )
      },
      {
        path: 'UserManagement',
        element: (
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        )
      },
      {
        path: 'AddUser',
        element: (
          <ProtectedRoute>
            <UserManagement2 />
          </ProtectedRoute>
        )
      },
      {
        path: 'AreaManagement',
        element: (
          <ProtectedRoute>
            <AreaManagement />
          </ProtectedRoute>
        )
      },
      {
        path: 'Dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'LogReports',
        element: (
          <ProtectedRoute>
            <LogReports />
          </ProtectedRoute>
        )
      }, 
      {
        path: 'AddArea',
        element: (
          <ProtectedRoute>
            <AddArea />
          </ProtectedRoute>
        )
      },
      {
        path: 'AddCamera',
        element: (
          <ProtectedRoute>
            <AddCamera />
          </ProtectedRoute>
        )
      },
      {
        path: 'EditUser/:userId',
        element: (
          <ProtectedRoute>
            <EditUser />
          </ProtectedRoute>
        )
      },
      {
        path: 'EditUser',
        element: (
          <ProtectedRoute>
            <EditUser />
          </ProtectedRoute>
        )
      }

    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />

  </React.StrictMode>,
)