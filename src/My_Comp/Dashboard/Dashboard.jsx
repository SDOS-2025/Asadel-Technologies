"use client"
import "./Dashboard.css"
import { Container, Row, Col, Card } from "react-bootstrap"
import { Grid3x3GapFill, GraphUpArrow, PersonFill, Diagram3Fill, CameraVideoFill, GearFill } from "react-bootstrap-icons"

export default function Dashboard() {
  const sections = [
    { title: "Dashboard", icon: <Grid3x3GapFill size={40} color="#2a4d9e" /> },
    { title: "Reports & Analytics", icon: <GraphUpArrow size={40} color="#2a4d9e" /> },
    { title: "User Management", icon: <PersonFill size={40} color="#2a4d9e" /> },
    { title: "Area Management", icon: <Diagram3Fill size={40} color="#2a4d9e" /> },
    { title: "Camera Management", icon: <CameraVideoFill size={40} color="#2a4d9e" /> },
    { title: "Settings", icon: <GearFill size={40} color="#2a4d9e" /> },
  ]

  return (
    <Container className="flex-grow-1 py-4">
      <Row className="g-4">
        {sections.map((section, index) => (
          <Col xs={12} md={6} lg={4} key={index}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center py-4">
                <div className="icon-container mb-3">{section.icon}</div>
                <Card.Title>{section.title}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

