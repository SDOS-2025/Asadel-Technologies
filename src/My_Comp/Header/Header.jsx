"use client"
import"./Navbar.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { Navbar, Container, Nav, Button, Dropdown } from "react-bootstrap"
import { BellFill } from "react-bootstrap-icons"
import {  } from "module";

export default function Header() {
  return (
    <Navbar variant="dark" expand="lg" className="py-2">
      <Container fluid>
        <Dropdown>
          <Dropdown.Toggle id="dropdown-basic" className="border-0 p-0 me-3 dropdown-toggle">
            <span className="navbar-toggler-icon"></span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="#dashboard">Dashboard</Dropdown.Item>
            <Dropdown.Item href="#reports">Reports & Analytics</Dropdown.Item>
            <Dropdown.Item href="#users">User Management</Dropdown.Item>
            <Dropdown.Item href="#areas">Area Management</Dropdown.Item>
            <Dropdown.Item href="#cameras">Camera Management</Dropdown.Item>
            <Dropdown.Item href="#settings">Settings</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Navbar.Brand className="fw-bold">Welcome, Admin!</Navbar.Brand>
        <Nav className="ms-auto d-flex align-items-center">
          <Nav.Link href="#notifications" className="me-3">
            <BellFill size={20} color="white" />
          </Nav.Link>
          <Button variant="light" size="sm">Logout</Button>
        </Nav>
      </Container>
    </Navbar>
  )
}

