"use client"
import "./Navbar.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { Navbar, Container, Nav, Button, Dropdown } from "react-bootstrap"
import { BellFill, List } from "react-bootstrap-icons"
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <Navbar variant="dark" expand="lg" className="header-navbar py-2">
      <Container fluid>
        <div className="d-flex align-items-center">
          <Dropdown>
            <Dropdown.Toggle variant="" id="nav-dropdown" className="custom-dropdown-toggle">
              <List size={24} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/Dashboard">Dashboard</Dropdown.Item>
              <Dropdown.Item as={Link} to="/LogReports">Reports & Analytics</Dropdown.Item>
              <Dropdown.Item as={Link} to="/UserManagement">User Management</Dropdown.Item>
              <Dropdown.Item as={Link} to="/AreaManagement">Area Management</Dropdown.Item>
              <Dropdown.Item as={Link} to="/CameraManagement">Camera Management</Dropdown.Item>
              <Dropdown.Item as={Link} to="/Settings">Settings</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Navbar.Brand className="header-navbar-brand ms-3 fw-bold">Welcome, Admin!</Navbar.Brand>
        </div>
        <Nav className="ms-auto d-flex align-items-center">
          <Nav.Link href="#notifications" className="me-3">
            <BellFill size={20} color="white" />
          </Nav.Link>
          <Link to="/Home">
            <Button variant="light" size="sm" className="me-2">Home</Button>
          </Link>
          <Link to="/Login">
            <Button variant="light" size="sm">Logout</Button>
          </Link>
        </Nav>
      </Container>
    </Navbar>
  )
}

