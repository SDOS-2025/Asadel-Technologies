"use client"
import "./Home.css"
import { Container, Row, Col, Card } from "react-bootstrap"
import { Link } from "react-router-dom"
import { Grid3x3GapFill, GraphUpArrow, PersonFill, Diagram3Fill, CameraVideoFill, GearFill } from "react-bootstrap-icons"

export default function Home() {
  // Inline styles to ensure they take effect
  const containerStyle = {
    padding: "40px 20px",
    minHeight: "calc(100vh - 160px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa"
  };

  const cardStyle = {
    minHeight: "250px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#f5f5f5",
    border: "none",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease"
  };

  const cardBodyStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    textAlign: "center",
    width: "100%"
  };

  const iconContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100px",
    marginBottom: "20px"
  };

  const titleStyle = {
    fontSize: "22px",
    fontWeight: "600",
    color: "#333",
    marginTop: "15px"
  };

  const sections = [
    { title: "Dashboard", icon: <Grid3x3GapFill size={85} color="#2a4d9e" />, link: "/Dashboard" },
    { title: "Reports & Analytics", icon: <GraphUpArrow size={85} color="#2a4d9e" />, link: "/LogReports" },
    { title: "User Management", icon: <PersonFill size={85} color="#2a4d9e" />, link: "/UserManagement" },
    { title: "Area Management", icon: <Diagram3Fill size={85} color="#2a4d9e" />, link: "/AreaManagement" },
    { title: "Camera Management", icon: <CameraVideoFill size={85} color="#2a4d9e" />, link: "/CameraManagement" },
    { title: "Settings", icon: <GearFill size={85} color="#2a4d9e" />, link: "/Settings" },
  ]

  return (
    <div style={containerStyle}>
      <Container style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Row className="row-cols-1 row-cols-sm-2 row-cols-lg-3 g-5">
          {sections.map((section, index) => (
            <Col key={index} className="d-flex">
              <Link to={section.link} className="text-decoration-none w-100">
                <Card style={cardStyle} className="h-100 w-100">
                  <Card.Body style={cardBodyStyle}>
                    <div style={iconContainerStyle}>{section.icon}</div>
                    <Card.Title style={titleStyle}>{section.title}</Card.Title>
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
