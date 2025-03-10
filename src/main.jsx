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

import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Dashboard from './My_Comp/Dashboard/Dashboard.jsx';
const router = createBrowserRouter([
  {
    path: '/',
    element:<MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="Home" replace />
      },
      {
        path: 'Home',
        element: <Home />
      },
      {
        path: 'Settings',
        element: <SettingsForm />
      },
      {
        path: 'CameraManagement',
        element: <CameraTable />
      },
      {
        path: 'UserManagement',
        element: <UserManagement />
      },
      {
        path: 'AddUser',
        element: <UserManagement2 />
      },
      {
        path: 'AreaManagement',
        element: <AreaManagement />
      },
      {
        path: 'Login',
        element: <Login />
      },
      {
        path: 'Dashboard',
        element: <Dashboard />
      },
      {
        path: 'LogReports',
        element: <LogReports />
      }
    ]
  },
  
  // {
  //   path: '/login', // Separate route for login
  //   element: <Login /> // This route does not include the GuestLayout (Header/Footer)
  // },
  // {
  //   path: '/signup', // Separate route for register
  //   element: <Register /> // This route does not include the GuestLayout (Header/Footer)
  // }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />

  </React.StrictMode>,
)