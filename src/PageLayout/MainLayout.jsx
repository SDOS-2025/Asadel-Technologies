import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../My_Comp/Header/Header.jsx'
import Footer from '../My_Comp/Footer/Footer.jsx'
import './MainLayout.css'

function MainLayout() {
  return (
    <div className="main-layout-container">
      <Header/>
      <div className="main-layout-content-wrapper">
        <Outlet/>
      </div>
      <Footer/>
    </div>
  )
}

export default MainLayout;