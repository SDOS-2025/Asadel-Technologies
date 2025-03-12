import React, { useState } from 'react';
import './usr_mgt_2.css';
import { FaBars, FaBell, FaLinkedin, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

export default function UserManagement2() {
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    email: '',
    dateOfBirth: '',
    identityNo: '',
    password: '',
    retypePassword: '',
    access: '',
    profileImage: null
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  return (
    <div className="user-management">


      {/* Main Content */}
      <main className="main-content">
        <div className="form-container">
          
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-grid">
              <div className="form-left">
                <div className="form-group">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Type Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="required">*</span>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="role"
                    placeholder="Type Role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="required">*</span>
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email id"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="required">*</span>
                </div>

                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Create new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="required">*</span>
                </div>

                <div className="form-group">
                  <input
                    type="password"
                    name="retypePassword"
                    placeholder="Re-type new password"
                    value={formData.retypePassword}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="required">*</span>
                </div>

                <div className="form-group">
                  <div className="select-wrapper">
                    <select
                      name="access"
                      value={formData.access}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Access</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-right">
                <input
                  type="date"
                  name="dateOfBirth"
                  placeholder="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />

                <input
                  type="text"
                  name="identityNo"
                  placeholder="Identity No."
                  value={formData.identityNo}
                  onChange={handleInputChange}
                />

                <div className="profile-upload">
                  <div className="profile-image">
                    {imagePreview ? (
                      <img src={imagePreview || "/placeholder.svg"} alt="Profile preview" />
                    ) : (
                      <div className="avatar-placeholder"></div>
                    )}
                  </div>
                  <div className="upload-text">
                    Add Profile Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-footer">
              <button type="submit" className="add-button">Add</button>
              {showSuccess && <div className="success-message">New user added!</div>}
            </div>
          </form>
        </div>
      </main>

   
    </div>
  );
}

