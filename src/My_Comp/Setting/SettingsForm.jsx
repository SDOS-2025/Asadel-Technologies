"use client"
import "./Setting.css";

import { useState } from "react"
import { ProfileImage } from "./Icons"

export default function SettingsForm() {
  const [formData, setFormData] = useState({
    name: "Naman",
    language: "English",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h (am/pm)",
    country: "India",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <div className="main-content" style={{ backgroundColor: 'white' }}>
      <div className="settings-container">
        <div className="settings-content">
          <div className="profile-section">
            <div className="profile-image">
              <ProfileImage />
            </div>
            <div className="profile-actions">
              <button className="remove-button">Remove</button>
              <button className="update-button">Update</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select id="language" name="language" value={formData.language} onChange={handleChange}>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateFormat">Date Format</label>
                <select id="dateFormat" name="dateFormat" value={formData.dateFormat} onChange={handleChange}>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="timeFormat">Time Format</label>
                <select id="timeFormat" name="timeFormat" value={formData.timeFormat} onChange={handleChange}>
                  <option value="12h (am/pm)">12h (am/pm)</option>
                  <option value="24h">24h</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select id="country" name="country" value={formData.country} onChange={handleChange}>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>

            <div className="button-group">
              <button type="submit" className="save-button">
                Save Changes
              </button>
              <button type="button" className="delete-button">
                Delete Account
              </button>
            </div>
          </form>
        </div>
        <div className="illustration">
          <img src="/image.png" alt="Decorative illustration" />
        </div>
      </div>
    </div>
  )
}



