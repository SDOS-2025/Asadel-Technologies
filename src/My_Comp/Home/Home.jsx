"use client"
import "./Home.css"
import { Container, Row, Col, Card } from "react-bootstrap"
import { Link } from "react-router-dom"
import { Grid3x3GapFill, GraphUpArrow, PersonFill, Diagram3Fill, CameraVideoFill, GearFill } from "react-bootstrap-icons"
import { useState, useEffect } from "react"
import api from "../../services/api"

export default function Home() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.getCurrentUser()
        console.log("Current user data:", response)
        
        // Parse access_level if it's a string (API returns access_level, not access_type)
        let accessType = []
        
        // Check if access data exists in response
        if (response.access_level) {
          // Try to parse if it's a string
          if (typeof response.access_level === 'string') {
            try {
              accessType = JSON.parse(response.access_level)
              console.log("Parsed access_level:", accessType)
            } catch (e) {
              console.error("Error parsing access_level:", e)
              accessType = []
            }
          } else if (Array.isArray(response.access_level)) {
            accessType = response.access_level
            console.log("Access_level is already an array:", accessType)
          }
        }
          
        setUserData({
          ...response,
          access_type: accessType
        })
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to fetch user permissions")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Check if user has access to a specific module
  const hasAccess = (module) => {
    console.log("Checking access for module:", module)
    console.log("User data:", userData)
    
    if (!userData || !userData.access_type) {
      console.log("No user data or access_type")
      return false
    }
    
    // Access labels in DB may not match exactly, so handle possible variations
    const accessType = userData.access_type
    
    // Check for literal match first
    if (accessType.includes(module)) {
      console.log("Direct match found for", module)
      return true
    }
    
    // Check for variations (For example, "Reports and Analytics" vs "Reports & Analytics")
    if (module === "Reports and Analytics" && accessType.includes("Reports & Analytics")) {
      return true
    }
    
    if (module === "Area Management" && accessType.includes("Area")) {
      return true
    }
    
    if (module === "Camera Management" && accessType.includes("Camera")) {
      return true
    }
    
    if (module === "User Management" && accessType.includes("User")) {
      return true
    }
    
    console.log("No match found for", module)
    return false
  }

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
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    margin: "0"
  };

  const disabledCardStyle = {
    ...cardStyle,
    opacity: 0.6,
    backgroundColor: "#eaeaea",
    cursor: "not-allowed"
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

  const noAccessStyle = {
    fontSize: "14px",
    color: "#d32f2f",
    marginTop: "10px"
  };

  const sections = [
    { title: "Dashboard", icon: <Grid3x3GapFill size={85} color="#2a4d9e" />, link: "/Dashboard", accessKey: "Dashboard" },
    { title: "Reports & Analytics", icon: <GraphUpArrow size={85} color="#2a4d9e" />, link: "/LogReports", accessKey: "Reports and Analytics" },
    { title: "User Management", icon: <PersonFill size={85} color="#2a4d9e" />, link: "/UserManagement", accessKey: "User Management" },
    { title: "Area Management", icon: <Diagram3Fill size={85} color="#2a4d9e" />, link: "/AreaManagement", accessKey: "Area Management" },
    { title: "Camera Management", icon: <CameraVideoFill size={85} color="#2a4d9e" />, link: "/CameraManagement", accessKey: "Camera Management" },
    { title: "Settings", icon: <GearFill size={85} color="#2a4d9e" />, link: "/Settings", accessKey: null },  // Assuming settings is always accessible
  ]

  if (loading) {
    return (
      <div style={containerStyle} className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={containerStyle} className="text-center">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <Container>
        <Row className="g-4">
          {sections.map((section, index) => {
            const hasPermission = section.accessKey === null || hasAccess(section.accessKey)
            console.log(`Section ${section.title} has permission: ${hasPermission}`)
            
            return (
              <Col key={index} xs={12} sm={6} lg={4} className="mb-4">
                {hasPermission ? (
                  <Link to={section.link} className="text-decoration-none w-100 d-block">
                    <Card style={cardStyle} className="h-100">
                      <Card.Body style={cardBodyStyle}>
                        <div style={iconContainerStyle}>{section.icon}</div>
                        <Card.Title style={titleStyle}>{section.title}</Card.Title>
                      </Card.Body>
                    </Card>
                  </Link>
                ) : (
                  <div className="w-100 d-block">
                    <Card style={disabledCardStyle} className="h-100">
                      <Card.Body style={cardBodyStyle}>
                        <div style={iconContainerStyle}>{section.icon}</div>
                        <Card.Title style={titleStyle}>{section.title}</Card.Title>
                        <div style={noAccessStyle}>You don't have access</div>
                      </Card.Body>
                    </Card>
                  </div>
                )}
              </Col>
            )
          })}
        </Row>
      </Container>
    </div>
  )
}
