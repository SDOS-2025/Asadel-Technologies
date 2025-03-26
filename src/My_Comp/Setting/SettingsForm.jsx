"use client"
import "./Setting.css";
import { useState, useRef, useEffect } from "react"
import { ProfileImage } from "./Icons"
import { FaChevronDown, FaTimes } from 'react-icons/fa';

export default function SettingsForm() {
  const [formData, setFormData] = useState({
    name: "Naman",
    role: "User",
    access: [],
    dateOfBirth: "",
    country: "India",
    email: "",
    oldPassword: "",
    newPassword: "",
    retypePassword: ""
  })

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showRetypeRequired, setShowRetypeRequired] = useState(false);
// Handle click outside of dropdown, Closes the dropdown when a user clicks outside of it.
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
// If a new password is entered, showRetypeRequired is set to true to prompt users to confirm their password.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Show retype password required when new password is entered
    if (name === 'newPassword' && value) {
      setShowRetypeRequired(true);
    }
  }
// Toggles access permissions: Adds an access option if it's not selected; removes it if it is.
  const handleAccessSelect = (value) => {
    setFormData(prev => {
      if (prev.access.includes(value)) {
        return {
          ...prev,
          access: prev.access.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          access: [...prev.access, value]
        };
      }
    });
  };
// Removes an access option when the user clicks the remove button.
  const handleRemoveAccess = (value) => {
    setFormData(prev => ({
      ...prev,
      access: prev.access.filter(item => item !== value)
    }));
  };
// Toggles the dropdown menu when the user clicks the dropdown icon.
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
// Handles form submission: Validates the retype password and logs the form data.
  const handleSubmit = (e) => {
    e.preventDefault()
    // Add validation for retype password
    if (formData.newPassword && formData.newPassword !== formData.retypePassword) {
      alert("New password and retype password do not match!");
      return;
    }
    console.log("Form submitted:", formData)
  }
// Access options for the dropdown menu.
  const accessOptions = [
    { value: "dashboard", label: "Dashboard" },
    { value: "reports_analysis", label: "Reports and Analysis" },
    { value: "user_management", label: "User Management" },
    { value: "area_management", label: "Area Management" },
    { value: "camera_management", label: "Camera Management" },
    { value: "all", label: "All" }
  ];

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
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange}>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="access">Access</label>
              <div className="settings-custom-select-wrapper" ref={dropdownRef}>
                <div className="settings-selected-options" onClick={toggleDropdown}>
                  {formData.access.length > 0 ? (
                    <div className="settings-selected-tags">
                      {formData.access.map(item => {
                        const option = accessOptions.find(opt => opt.value === item);
                        return (
                          <div key={item} className="settings-tag">
                            {option?.label}
                            <FaTimes 
                              className="settings-tag-remove" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAccess(item);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="settings-placeholder">Select Access</div>
                  )}
                  <div className="settings-dropdown-toggle">
                    <FaChevronDown className={`settings-dropdown-icon ${dropdownOpen ? 'open' : ''}`} />
                  </div>
                </div>
                {dropdownOpen && (
                  <div className="settings-dropdown-menu">
                    {accessOptions.map(option => (
                      <div 
                        key={option.value}
                        className={`settings-dropdown-item ${formData.access.includes(option.value) ? 'selected' : ''}`}
                        onClick={() => handleAccessSelect(option.value)}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input 
                type="date" 
                id="dateOfBirth" 
                name="dateOfBirth" 
                value={formData.dateOfBirth} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select id="country" name="country" value={formData.country} onChange={handleChange}>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Japan">Japan</option>
                <option value="China">China</option>
                <option value="Brazil">Brazil</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-section-divider">
              <h3>Change Password</h3>
            </div>

            <div className="settings-password-row">
              <div className="settings-password-field">
                <label htmlFor="oldPassword">Old Password</label>
                <input 
                  type="password" 
                  id="oldPassword" 
                  name="oldPassword" 
                  value={formData.oldPassword} 
                  onChange={handleChange} 
                />
              </div>

              <div className="settings-password-field">
                <label htmlFor="newPassword">New Password</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  name="newPassword" 
                  value={formData.newPassword} 
                  onChange={handleChange} 
                />
              </div>

              <div className="settings-password-field">
                <label htmlFor="retypePassword">
                  Retype New Password
                  {showRetypeRequired && formData.newPassword && !formData.retypePassword && (
                    <span className="settings-required">*</span>
                  )}
                </label>
                <input 
                  type="password" 
                  id="retypePassword" 
                  name="retypePassword" 
                  value={formData.retypePassword} 
                  onChange={handleChange}
                  required={showRetypeRequired && formData.newPassword}
                />
              </div>
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




