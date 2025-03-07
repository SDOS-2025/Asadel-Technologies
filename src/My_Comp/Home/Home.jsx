"use client"
import "./Home.css"
import { Container, Row, Col, Card } from "react-bootstrap"
import { Link } from "react-router-dom"
import { Grid3x3GapFill, GraphUpArrow, PersonFill, Diagram3Fill, CameraVideoFill, GearFill } from "react-bootstrap-icons"

export default function Home() {
  const sections = [
    { title: "Dashboard", icon: <Grid3x3GapFill size={60} color="#2a4d9e" />, link: "/Dashboard" },
    { title: "Reports & Analytics", icon: <GraphUpArrow size={60} color="#2a4d9e" />, link: "/reports" },
    { title: "User Management", icon: <PersonFill size={60} color="#2a4d9e" />, link: "/UserManagement" },
    { title: "Area Management", icon: <Diagram3Fill size={60} color="#2a4d9e" />, link: "/AreaManagement" },
    { title: "Camera Management", icon: <CameraVideoFill size={60} color="#2a4d9e" />, link: "/CameraManagement" },
    { title: "Settings", icon: <GearFill size={60} color="#2a4d9e" />, link: "/Settings" },
  ]

  return (
    <div className="home-container">
      <Container>
        <Row className="row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {sections.map((section, index) => (
            <Col key={index}>
              <Link to={section.link} className="text-decoration-none">
                <Card className="card">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <div className="icon-container">{section.icon}</div>
                    <Card.Title className="mb-0">{section.title}</Card.Title>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  )
}
