import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../My_Comp/Header/Header.jsx'
import LoginHeader from '../My_Comp/Header/LoginHeader.jsx'
import Footer from '../My_Comp/Footer/Footer.jsx'
import './MainLayout.css'

function MainLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/Login';

  return (
    <div className="main-layout-container">
      {isLoginPage ? <LoginHeader /> : <Header />}
      <div className="main-layout-content-wrapper">
        <Outlet/>
      </div>
      <Footer/>
    </div>
  )
}

export default MainLayout;