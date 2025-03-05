import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../My_Comp/Header/Header.jsx'
import Footer from '../My_Comp/Footer/Footer.jsx'
function MainLayout() {
  return (
    <>
    <Header/>
    <Outlet/>
    <Footer/>
    </>
  )
}

export default MainLayout;