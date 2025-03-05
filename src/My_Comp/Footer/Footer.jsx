"use client"

import { Container, Row, Col } from "react-bootstrap"
import { Linkedin, Instagram, Twitter, Youtube, Facebook } from "react-bootstrap-icons"
import "./Footer.css"
export default function Footer() {
  return (
    <footer className="text-white py-3">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
            <div className="logo-container">
              <img src="/logo.png" alt="Asadel Technologies Logo" className="footer-logo mb-2" />
            </div>
            <p className="mb-0">
              <a href="https://www.asadeltech.com" className="text-white text-decoration-none" target="_blank" rel="noopener noreferrer">
                © 2025 Asadel Technologies Pvt.Ltd. All rights reserved
              </a>
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="company-info">
              <h5 className="company-name">ASADEL Technologies Pvt.Ltd.</h5>
              <p className="mb-3 small">
                <span>Room No. 506 & 528, Incubation & Innovation Center,</span><br />
                <span>IIITD, Phase-3, Okhla Industrial Area, New Delhi-110020</span>
              </p>
              <p className="mb-1 small">+91 9876543210 / 9876543217</p>
              <p className="mb-3 small">info@asadeltech.com</p>
              <div className="social-icons">
                <a href="https://www.linkedin.com/company/asadeltech/?originalSubdomain=in" className="text-white me-2" target="_blank" rel="noopener noreferrer">
                  <Linkedin />
                </a>
                <a href="#" className="text-white me-2">
                  <Instagram />
                </a>
                <a href="#" className="text-white me-2">
                  <Twitter />
                </a>
                <a href="https://www.youtube.com/@asadeltechnologies9123/vi" className="text-white me-2" target="_blank" rel="noopener noreferrer">
                  <Youtube />
                </a>
                <a href="https://www.facebook.com/asadeltech" className="text-white me-2" target="_blank" rel="noopener noreferrer">
                  <Facebook />
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

