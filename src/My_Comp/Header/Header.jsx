"use client"
import "./Navbar.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { Navbar, Container, Nav, Button, Dropdown, Modal } from "react-bootstrap"
import { BellFill, List } from "react-bootstrap-icons"
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("token");
    // Navigate to login page
    navigate('/Login');
  };

  return (
    <>
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
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => setShowLogoutModal(true)}
              className="me-2"
            >
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Logout Confirmation Modal */}
      <Modal 
        show={showLogoutModal} 
        onHide={() => setShowLogoutModal(false)}
        className="custom-logout-modal"
      >
        <Modal.Header closeButton className="custom-modal-header">
          <Modal.Title className="custom-modal-title">Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body">
          Are you sure you want to logout?
        </Modal.Body>
        <Modal.Footer className="custom-modal-footer">
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)} className="custom-modal-cancel-btn">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleLogout} className="custom-modal-logout-btn">
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

