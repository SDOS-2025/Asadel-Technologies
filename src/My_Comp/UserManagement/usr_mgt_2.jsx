import React, { useState, useRef, useEffect } from 'react';
import './usr_mgt_2.css';
import { FaBars, FaBell, FaLinkedin, FaInstagram, FaTwitter, FaYoutube, FaUser, FaChevronDown, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function UserManagement2() {
  const navigate = useNavigate();
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
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Add validation functions
  const validateEmail = (email) => {
    // RFC 5322 compliant email regex with dot and TLD requirements
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    // Additional length checks
    if (email.length > 254) {
      return false;
    }
    
    // Split into local and domain parts
    const [localPart, domain] = email.split('@');
    
    // Check local part length (max 64 characters)
    if (localPart.length > 64) {
      return false;
    }
    
    // Check for consecutive dots in local part
    if (localPart.includes('..')) {
      return false;
    }
    
    // Check domain part
    if (!domain) {
      return false;
    }
    
    // Check if domain has at least one dot
    if (!domain.includes('.')) {
      return false;
    }
    
    // Check domain parts length (max 63 characters each)
    const domainParts = domain.split('.');
    if (domainParts.some(part => part.length > 63)) {
      return false;
    }
    
    // Check if TLD is at least 2 characters
    if (domainParts[domainParts.length - 1].length < 2) {
      return false;
    }
    
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasDigit = /[0-9]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    if (!hasDigit) {
      return 'Password must contain at least one digit';
    }
    return null;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear error message
    setError('');

    // Validate email
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.retypePassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate access is selected
    if (formData.access.length === 0) {
      setError('Please select at least one access level');
      return;
    }

    try {
      // Prepare user data
      const userData = {
        username: formData.fullName,
        password: formData.password,
        email: formData.email,
        role: formData.role,
        date_of_birth: formData.dateOfBirth,
        country: formData.country,
        access_type: JSON.stringify(formData.access)
      };

      // Create user
      await api.createUser(userData);
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setFormData({
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
      setImagePreview(null);

      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to create user');
      console.error('Error creating user:', err);
    }
  };

  // Access options
  const accessOptions = [
    { value: "Dashboard", label: "Dashboard" },
    { value: "Reports and Analysis", label: "Reports and Analysis" },
    { value: "User Management", label: "User Management" },
    { value: "Area Management", label: "Area Management" },
    { value: "Camera Management", label: "Camera Management" },
    { value: "All", label: "All" }
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
          {error && <div className="usrmgt-error-message">{error}</div>}
          {showSuccess && <div className="usrmgt-success-message">User created successfully!</div>}
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
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
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
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

