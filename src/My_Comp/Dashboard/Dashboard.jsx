"use client"
import "./Dashboard.css"
import { Container, Row, Col, Card } from "react-bootstrap"
import { Link } from "react-router-dom"
import { Grid3x3GapFill, GraphUpArrow, PersonFill, Diagram3Fill, CameraVideoFill, GearFill } from "react-bootstrap-icons"

export default function Dashboard() {
  const sections = [
    { title: "Dashboard", icon: <Grid3x3GapFill size={40} color="#2a4d9e" />, link: "/Dashboard" },
    { title: "Reports & Analytics", icon: <GraphUpArrow size={40} color="#2a4d9e" />, link: "/reports" },
    { title: "User Management", icon: <PersonFill size={40} color="#2a4d9e" />, link: "/UserManagement" },
    { title: "Area Management", icon: <Diagram3Fill size={40} color="#2a4d9e" />, link: "/AreaManagement" },
    { title: "Camera Management", icon: <CameraVideoFill size={40} color="#2a4d9e" />, link: "/CameraManagement" },
    { title: "Settings", icon: <GearFill size={40} color="#2a4d9e" />, link: "/Settings" },
  ]

  return (
    <Container className="flex-grow-1 py-4">
      <Row className="g-4">
        {sections.map((section, index) => (
          <Col xs={12} md={6} lg={4} key={index}>
            <Link to={section.link} style={{ textDecoration: 'none' }}>
              <Card className="h-100 shadow-sm" role="button">
                <Card.Body className="text-center py-4">
                  <div className="icon-container mb-3">{section.icon}</div>
                  <Card.Title>{section.title}</Card.Title>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  )
}
