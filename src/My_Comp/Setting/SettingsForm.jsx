"use client"
import "./Setting.css";
import { useState, useRef, useEffect } from "react"
import { ProfileImage } from "./Icons"
import { FaChevronDown, FaTimes, FaUser } from 'react-icons/fa';
import api from "../../services/api";

export default function SettingsForm() {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    access: [],
    dateOfBirth: "",
    country: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    retypePassword: ""
  })

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageModified, setImageModified] = useState(false);
  const dropdownRef = useRef(null);
  const [showRetypeRequired, setShowRetypeRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch fresh user data from database when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Use the getCurrentUser endpoint from settings blueprint
        const response = await api.getCurrentUser();

        if (response) {
          // Parse access_level if it's a string
          const accessLevel = typeof response.access_level === 'string' 
            ? JSON.parse(response.access_level) 
            : response.access_level;

          // Format date of birth to YYYY-MM-DD for the input field
          const formattedDate = response.date_of_birth 
            ? new Date(response.date_of_birth).toISOString().split('T')[0]
            : "";

          setFormData(prev => ({
            ...prev,
            name: response.full_name || "",
            role: response.role || "",
            access: Array.isArray(accessLevel) ? accessLevel : [],
            dateOfBirth: formattedDate,
            country: response.country || "",
            email: response.email || ""
          }));

          // Set profile image if it exists
          if (response.profile_image_url) {
            setImagePreview(response.profile_image_url);
          } 
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Set empty array for access if there's an error
        setFormData(prev => ({
          ...prev,
          access: []
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set the profile image state
      setProfileImage(file);
      setImageModified(true);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    setImageModified(true);
  };

  // Open file dialog when update button is clicked
  const handleUpdateImage = () => {
    fileInputRef.current.click();
  };

  // Handle form submission: Validates the retype password and logs the form data.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Name is required');
      setShowErrorDialog(true);
      return;
    }
    if (!formData.role) {
      setError('Role is required');
      setShowErrorDialog(true);
      return;
    }
    if (!Array.isArray(formData.access) || formData.access.length === 0) {
      setError('At least one access permission is required');
      setShowErrorDialog(true);
      return;
    }
    if (!formData.dateOfBirth) {
      setError('Date of Birth is required');
      setShowErrorDialog(true);
      return;
    }
    if (!formData.country) {
      setError('Country is required');
      setShowErrorDialog(true);
      return;
    }
    if (!formData.email) {
      setError('Email is required');
      setShowErrorDialog(true);
      return;
    }

    // Add validation for retype password
    if (formData.newPassword && formData.newPassword !== formData.retypePassword) {
      setError('New password and retype password do not match!');
      setShowErrorDialog(true);
      return;
    }

    try {
      // Prepare data for update
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('role', formData.role);
      formDataToSend.append('access', JSON.stringify(formData.access));
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('email', formData.email.trim());

      // Debug logs
      console.log('Image modified:', imageModified);
      console.log('Profile image:', profileImage);
      
      // Only include profile image if it's been modified by the user
      if (imageModified) {
        if (profileImage) {
          formDataToSend.append('profileImage', profileImage);
          console.log('Appending new image to FormData');
        } else {
          formDataToSend.append('profileImage', 'null');
          console.log('Appending null to FormData for image removal');
        }
      }

      // Only include password fields if they are provided
      if (formData.oldPassword && formData.newPassword) {
        formDataToSend.append('oldPassword', formData.oldPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }

      // Update user settings using the settings blueprint endpoint
      await api.updateCurrentUserSettings(formDataToSend);

      // Refresh user data
      const refreshedUserData = await api.getCurrentUser();
      
      // Parse access_level if it's a string
      const accessLevel = typeof refreshedUserData.access_level === 'string' 
        ? JSON.parse(refreshedUserData.access_level) 
        : refreshedUserData.access_level;

      // Format date of birth for the form
      const formattedDate = refreshedUserData.date_of_birth 
        ? new Date(refreshedUserData.date_of_birth).toISOString().split('T')[0]
        : "";

      // Update form data with refreshed values
      setFormData(prev => ({
        ...prev,
        name: refreshedUserData.full_name || "",
        role: refreshedUserData.role || "",
        access: Array.isArray(accessLevel) ? accessLevel : [],
        dateOfBirth: formattedDate,
        country: refreshedUserData.country || "",
        email: refreshedUserData.email || "",
        oldPassword: "",
        newPassword: "",
        retypePassword: ""
      }));

      // Update image preview if it changed
      if (refreshedUserData.profile_image_url) {
        setImagePreview(refreshedUserData.profile_image_url);
      } else {
        setImagePreview(null);
      }

      // Reset image modification state
      setImageModified(false);
      setProfileImage(null);

      // Show success dialog
      setShowSuccessDialog(true);

    } catch (error) {
      console.error("Error saving changes:", error);
      setError(error.message || "Failed to save changes. Please try again.");
      setShowErrorDialog(true);
    }
  };

  // Define access options for the dropdown
  const accessOptions = [
    { value: "View Only", label: "View Only" },
    { value: "Edit", label: "Edit" },
    { value: "Admin", label: "Admin" },
    { value: "Super Admin", label: "Super Admin" }
  ];

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      // Show loading state
      setLoading(true);
      
      // Implement account deletion logic here
      // This would typically call an API endpoint to delete the user's account
      
      // Redirect to login page or show a success message
      window.location.href = "/login";
    } catch (error) {
      console.error("Error deleting account:", error);
      setError("Failed to delete account. Please try again.");
      setShowErrorDialog(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="settings-loading">
          Loading user settings...
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ backgroundColor: 'white' }}>
      <div className="settings-container">
        <div className="settings-content">
          <div className="profile-section">
            <div className="profile-image">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    setImagePreview(null);
                  }}
                />
              ) : (
                <div className="profile-image-placeholder">
                  <FaUser size={40} />
                </div>
              )}
            </div>
            <div className="profile-actions">
              <button 
                type="button" 
                className="remove-button"
                onClick={handleRemoveImage}
              >
                Remove
              </button>
              <button 
                type="button" 
                className="update-button"
                onClick={handleUpdateImage}
              >
                Update
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
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
              <div className="settings-select-wrapper">
                <select
                  id="access"
                  name="access"
                  value={formData.access.length === 0 ? "" : " "}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAccessSelect(e.target.value);
                      e.target.value = " "; // Set to space to hide placeholder
                    }
                  }}
                >
                  <option value="" disabled>Select Access</option>
                  <option value=" " disabled style={{ display: 'none' }}></option>
                  {accessOptions
                    .filter(option => !formData.access.includes(option.value))
                    .map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                {formData.access.length > 0 && (
                  <div className="settings-tags-container">
                    {formData.access.map(item => {
                      const option = accessOptions.find(opt => opt.value === item);
                      return (
                        <div key={item} className="settings-tag">
                          {option?.label || item}
                          <FaTimes 
                            className="settings-tag-remove" 
                            onClick={() => handleRemoveAccess(item)}
                          />
                        </div>
                      );
                    })}
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
              <button 
                type="button" 
                className="delete-button"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </button>
            </div>
          </form>
        </div>
        <div className="illustration">
          <img src="/image.png" alt="Decorative illustration" />
        </div>
      </div>

      {/* Error Dialog */}
      {showErrorDialog && (
        <div className="settings-dialog-overlay">
          <div className="settings-dialog-content">
            <h2>Error</h2>
            <p>{error}</p>
            <div className="settings-dialog-buttons">
              <button 
                className="settings-dialog-confirm"
                onClick={() => setShowErrorDialog(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="settings-dialog-overlay">
          <div className="settings-dialog-content">
            <h2>Success</h2>
            <p>Changes saved successfully!</p>
            <div className="settings-dialog-buttons">
              <button 
                className="settings-dialog-confirm success"
                onClick={() => setShowSuccessDialog(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="settings-dialog-overlay">
          <div className="settings-dialog-content">
            <h2>Delete Account</h2>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="settings-dialog-buttons">
              <button 
                className="settings-dialog-cancel"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="settings-dialog-confirm"
                onClick={() => {
                  setShowDeleteDialog(false);
                  handleDeleteAccount();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




