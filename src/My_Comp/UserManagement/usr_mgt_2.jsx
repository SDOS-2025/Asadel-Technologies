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

  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    type: 'success' // 'success' or 'error'
  });
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
    if (name === 'access') {
      // Add the selected value to the access array if it's not already there
      setFormData(prev => ({
        ...prev,
        access: Array.isArray(prev.access) ? [...prev.access, value] : [value]
      }));
      // Reset the select value to empty string
      e.target.value = '';
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
      access: Array.isArray(prev.access) 
        ? prev.access.filter(item => item !== value)
        : []
    }));
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setDialogConfig({
          title: 'Error',
          message: 'Image must be less than 5MB',
          type: 'error'
        });
        setShowDialog(true);
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setDialogConfig({
          title: 'Error',
          message: 'Image must be a JPEG, PNG, or GIF file',
          type: 'error'
        });
        setShowDialog(true);
        return;
      }

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

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: null
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear error message
    setDialogConfig({
      title: '',
      message: '',
      type: 'success'
    });

    // Validate email
    if (!validateEmail(formData.email)) {
      setDialogConfig({
        title: 'Invalid Email',
        message: 'Please enter a valid email address',
        type: 'error'
      });
      setShowDialog(true);
      return;
    }

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setDialogConfig({
        title: 'Invalid Password',
        message: passwordError,
        type: 'error'
      });
      setShowDialog(true);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.retypePassword) {
      setDialogConfig({
        title: 'Password Mismatch',
        message: 'Passwords do not match',
        type: 'error'
      });
      setShowDialog(true);
      return;
    }

    // Validate access is selected
    if (formData.access.length === 0) {
      setDialogConfig({
        title: 'Access Required',
        message: 'Please select at least one access level',
        type: 'error'
      });
      setShowDialog(true);
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
        access_type: formData.access,
        profileImage: formData.profileImage
      };

      // Create user
      const response = await api.createUser(userData);
      
      // Show success message
      setDialogConfig({
        title: 'Success',
        message: 'User created successfully!',
        type: 'success'
      });
      setShowDialog(true);
      
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

    } catch (err) {
      setDialogConfig({
        title: 'Error',
        message: err.message || 'Failed to create user',
        type: 'error'
      });
      setShowDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  // Access options
  const accessOptions = [
    { value: "Dashboard", label: "Dashboard" },
    { value: "Reports and Analysis", label: "Reports and Analysis" },
    { value: "User Management", label: "User Management" },
    { value: "Area Management", label: "Area Management" },
    { value: "Camera Management", label: "Camera Management" }
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
            <div className="usrmgt-button-container">
              <div className="usrmgt-upload-text">
                <span>Add Profile Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="usrmgt-file-input"
                />
              </div>
              <div 
                className={`usrmgt-remove-text ${!imagePreview ? 'usrmgt-remove-text-disabled' : ''}`}
                onClick={imagePreview ? handleRemoveImage : undefined}
              >
                Remove Profile Image
              </div>
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
                <div className="usrmgt-select-wrapper">
                  <select
                    name="access"
                    value={formData.access.length === 0 ? '' : ' '}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select Access</option>
                    <option value=" " disabled style={{ display: 'none' }}></option>
                    {accessOptions
                      .filter(option => !Array.isArray(formData.access) || !formData.access.includes(option.value))
                      .map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                  <span className="usrmgt-required">*</span>
                  {Array.isArray(formData.access) && formData.access.length > 0 && (
                    <div className="usrmgt-tags-container">
                      {formData.access.map(item => {
                        const option = accessOptions.find(opt => opt.value === item);
                        return (
                          <div key={item} className="usrmgt-tag">
                            {option?.label}
                            <FaTimes 
                              className="usrmgt-tag-remove" 
                              onClick={() => handleRemoveAccess(item)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
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

      {/* Dialog Box */}
      {showDialog && (
        <div className="usrmgt-dialog-overlay">
          <div className="usrmgt-dialog-content">
            <h2>{dialogConfig.title}</h2>
            <p>{dialogConfig.message}</p>
            <div className="usrmgt-dialog-buttons">
              <button 
                className={`usrmgt-dialog-button ${dialogConfig.type === 'success' ? 'confirm' : 'error'}`}
                onClick={handleCloseDialog}
              >
                {dialogConfig.type === 'success' ? 'OK' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

