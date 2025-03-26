import React, { useState, useRef, useEffect } from 'react';
import './usr_mgt_2.css';
import { FaBars, FaBell, FaLinkedin, FaInstagram, FaTwitter, FaYoutube, FaUser, FaChevronDown, FaTimes } from 'react-icons/fa';

export default function UserManagement2() {
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    email: '',
    dateOfBirth: '',
    country: '',
    password: '',
    retypePassword: '',
    access: [],
    profileImage: null
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAccessSelect = (value) => {
    setFormData(prev => {
      // Check if the value is already selected
      if (prev.access.includes(value)) {
        // If already selected, remove it
        return {
          ...prev,
          access: prev.access.filter(item => item !== value)
        };
      } else {
        // If not selected, add it
        return {
          ...prev,
          access: [...prev.access, value]
        };
      }
    });
  };

  const handleRemoveAccess = (value) => {
    setFormData(prev => ({
      ...prev,
      access: prev.access.filter(item => item !== value)
    }));
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form validation and submission logic here
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Access options
  const accessOptions = [
    { value: "dashboard", label: "Dashboard" },
    { value: "reports_analysis", label: "Reports and Analysis" },
    { value: "user_management", label: "User Management" },
    { value: "area_management", label: "Area Management" },
    { value: "camera_management", label: "Camera Management" },
    { value: "all", label: "All" }
  ];

  return (
    <div className="usrmgt-container">
      <main className="usrmgt-main-content">
        {/* Profile Upload Section */}
        <div className="usrmgt-profile-upload">
          <div className="usrmgt-profile-image-container">
            <div className="usrmgt-profile-image">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile preview" />
              ) : (
                <div className="usrmgt-avatar-placeholder">
                  <FaUser className="usrmgt-default-avatar-icon" />
                </div>
              )}
            </div>
            <div className="usrmgt-upload-text">
              <span>Add Profile Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="usrmgt-file-input"
              />
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="usrmgt-form-container">
          <h2>User Information</h2>
          <form onSubmit={handleSubmit} className="usrmgt-user-form">
            <div className="usrmgt-form-fields">
              <div className="usrmgt-form-group">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Type Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
                <span className="usrmgt-required">*</span>
              </div>

              <div className="usrmgt-form-group">
                <div className="usrmgt-select-wrapper">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <span className="usrmgt-required">*</span>
                </div>
              </div>

              <div className="usrmgt-form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email id"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <span className="usrmgt-required">*</span>
              </div>

              <div className="usrmgt-form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Create new password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <span className="usrmgt-required">*</span>
              </div>

              <div className="usrmgt-form-group">
                <input
                  type="password"
                  name="retypePassword"
                  placeholder="Re-type new password"
                  value={formData.retypePassword}
                  onChange={handleInputChange}
                  required
                />
                <span className="usrmgt-required">*</span>
              </div>

              <div className="usrmgt-form-group">
                <div className="usrmgt-custom-select-wrapper" ref={dropdownRef}>
                  <div className="usrmgt-selected-options" onClick={toggleDropdown}>
                    {formData.access.length > 0 ? (
                      <div className="usrmgt-selected-tags">
                        {formData.access.map(item => {
                          const option = accessOptions.find(opt => opt.value === item);
                          return (
                            <div key={item} className="usrmgt-tag">
                              {option?.label}
                              <FaTimes 
                                className="usrmgt-tag-remove" 
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
                      <div className="usrmgt-placeholder">Select Access</div>
                    )}
                    <div className="usrmgt-dropdown-toggle">
                      <FaChevronDown className={`usrmgt-dropdown-icon ${dropdownOpen ? 'open' : ''}`} />
                    </div>
                  </div>
                  {dropdownOpen && (
                    <div className="usrmgt-dropdown-menu">
                      {accessOptions.map(option => (
                        <div 
                          key={option.value}
                          className={`usrmgt-dropdown-item ${formData.access.includes(option.value) ? 'selected' : ''}`}
                          onClick={() => handleAccessSelect(option.value)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="usrmgt-required">*</span>
                  <input 
                    type="hidden"
                    name="access"
                    value={formData.access}
                    required
                  />
                </div>
              </div>

              <div className="usrmgt-form-group">
                <input
                  type="date"
                  name="dateOfBirth"
                  placeholder="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
                <span className="usrmgt-required">*</span>
              </div>

              <div className="usrmgt-form-group">
                <div className="usrmgt-select-wrapper">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="india">India</option>
                    <option value="usa">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="canada">Canada</option>
                    <option value="australia">Australia</option>
                    <option value="germany">Germany</option>
                    <option value="france">France</option>
                    <option value="japan">Japan</option>
                    <option value="china">China</option>
                    <option value="brazil">Brazil</option>
                  </select>
                  <span className="usrmgt-required">*</span>
                </div>
              </div>
            </div>

            <div className="usrmgt-form-footer">
              <button type="submit" className="usrmgt-add-button">Add</button>
              {showSuccess && <div className="usrmgt-success-message">New user added!</div>}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

