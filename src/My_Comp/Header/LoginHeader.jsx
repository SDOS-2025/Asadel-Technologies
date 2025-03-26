"use client"
import "./Navbar.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { Navbar, Container } from "react-bootstrap"
import { Link } from 'react-router-dom';

export default function LoginHeader() {
  return (
    <Navbar variant="dark" expand="lg" className="header-navbar py-2">
      <Container fluid>
        <div className="d-flex align-items-center">
        
          <Navbar.Brand className="header-navbar-brand ms-3 fw-bold">Welcome To Asadel Technologies</Navbar.Brand>
        </div>
      </Container>
    </Navbar>
  )
} 