"use client"

import { Container, Row, Col } from "react-bootstrap"
import { Linkedin, Instagram, Twitter, Youtube, Facebook } from "react-bootstrap-icons"
import "./Footer.css"
export default function Footer() {
  return (
    <footer className="footer-section text-white">
      <Container fluid className="footer-main-container">
        <Row className="py-4">
          <Col xs={12} md={4} lg={3} className="mb-3 mb-md-0">
            <div className="footer-logo-container">
              <img src="/logo.png" alt="Asadel Technologies Logo" className="footer-logo-img" />
            </div>
            <h5 className="footer-section-heading mt-3">Contact Us</h5>
            <p className="mb-0 mt-3 d-block d-md-none">
              © 2025 Asadel Technologies Pvt.Ltd. All rights reserved
            </p>
          </Col>
          <Col xs={12} md={8} lg={9} className="text-md-end footer-company-info">
            <h5 className="footer-company-name">ASADEL Technologies Pvt. Ltd.</h5>
            <p className="mb-1">
              Room No. 506 & 528, Incubation & Innovation<br />
              Center, IIITD, Phase-3, Okhla Industrial Area,<br />
              New Delhi-110020
            </p>
            <p className="mb-3">info@asadeltech.com</p>
            <div className="footer-social-icons">
              <a href="https://www.linkedin.com/company/asadeltech/" target="_blank" rel="noopener noreferrer">
                <div className="footer-social-icon-circle">
                  <Linkedin />
                </div>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <div className="footer-social-icon-circle">
                  <Instagram />
                </div>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <div className="footer-social-icon-circle">
                  <Twitter />
                </div>
              </a>
              <a href="https://www.youtube.com/@asadeltechnologies9123" target="_blank" rel="noopener noreferrer">
                <div className="footer-social-icon-circle">
                  <Youtube />
                </div>
              </a>
              <a href="https://www.facebook.com/asadeltech" target="_blank" rel="noopener noreferrer">
                <div className="footer-social-icon-circle">
                  <Facebook />
                </div>
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

