import React, { useState, useRef, useEffect } from 'react';
import './usr_mgt_2.css';
import { FaUser, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export default function EditUser() {
  const navigate = useNavigate();
  const location = useLocation();
  // const { userId: userIdParam } = useParams();
  const userId = location.state?.userId;
  
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    email: '',
    dateOfBirth: '',
    country: '',
    access: [],
    profileImage: null
  });

  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    type: 'success'
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if userId exists
    if (!userId) {
      setDialogConfig({
        title: 'Error',
        message: 'No user selected',
        type: 'error'
      });
      setShowDialog(true);
      navigate('/UserManagement');
      return;
    }

    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log('Fetching user data for ID:', userId);
        const response = await api.getUser(userId);
        console.log('API response:', response);
        
        // Parse access_level if it's a string
        const accessLevel = typeof response.access_level === 'string' 
          ? JSON.parse(response.access_level) 
          : response.access_level;

        // Format date of birth for the form
        const formattedDate = response.date_of_birth 
          ? new Date(response.date_of_birth).toISOString().split('T')[0]
          : "";

        setFormData({
          fullName: response.full_name || "",
          role: response.role || "",
          access: Array.isArray(accessLevel) ? accessLevel : [],
          dateOfBirth: formattedDate,
          country: response.country || "",
          email: response.email || ""
        });

        if (response.profile_image_url) {
          setImagePreview(response.profile_image_url);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setDialogConfig({
          title: 'Error',
          message: 'Failed to fetch user data',
          type: 'error'
        });
        setShowDialog(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'access') {
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
    if (value && value.trim() !== '') {
      setFormData(prev => {
        // Check if the value is already selected
        if (prev.access.includes(value)) {
          // If already selected, do nothing
          return prev;
        } else {
          // If not selected, add it
          return {
            ...prev,
            access: [...prev.access, value]
          };
        }
      });
    }
  };

  const handleRemoveAccess = (value) => {
    setFormData(prev => ({
      ...prev,
      access: prev.access.filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear error message
    setDialogConfig({
      title: '',
      message: '',
      type: 'success'
    });

    // Validate role
    if (!formData.role) {
      setDialogConfig({
        title: 'Role Required',
        message: 'Please select a role',
        type: 'error'
      });
      setShowDialog(true);
      return;
    }

    // Validate access
    if (formData.access.length === 0) {
      setDialogConfig({
        title: 'Access Required',
        message: 'Please select at least one access level',
        type: 'error'
      });
      setShowDialog(true);
      return;
    }

    // Set loading state
    setLoading(true);

    try {
      // Prepare user data for update - only the fields the API expects
      const userData = {
        role: formData.role,
        access: formData.access
      };

      console.log('Updating user:', userId);
      console.log('Update data:', userData);
      
      // Update user using the API method
      const response = await api.updateUser(userId, userData);
      console.log('Update response:', response);
      
      setDialogConfig({
        title: 'Success!',
        message: 'User updated successfully.',
        type: 'success'
      });
      setShowDialog(true);
      
    } catch (err) {
      console.error('Update error:', err);
      setDialogConfig({
        title: 'Error',
        message: err.message || 'Failed to update user',
        type: 'error'
      });
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    
   
  };

  // Access options
  const accessOptions = [
    { value: "Dashboard", label: "Dashboard" },
    { value: "Reports and Analytics", label: "Reports and Analytics" },
    { value: "User Management", label: "User Management" },
    { value: "Area Management", label: "Area Management" },
    { value: "Camera Management", label: "Camera Management" }
  ];

  if (loading) {
    return (
      <div className="usrmgt-container">
        <div className="usrmgt-loading">
          <div className="usrmgt-loading-content">
            <div className="usrmgt-loading-spinner"></div>
            <p>Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="usrmgt-container">
      <main className="usrmgt-main-content">
        {/* Profile Section */}
        <div className="usrmgt-profile-upload">
          <div className="usrmgt-profile-image-container">
            <div className="usrmgt-profile-image">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" />
              ) : (
                <div className="usrmgt-avatar-placeholder">
                  <FaUser className="usrmgt-default-avatar-icon" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="usrmgt-form-container">
          <h2>User Information</h2>
          <form onSubmit={handleSubmit} className="usrmgt-user-form">
            <div className="usrmgt-form-fields">
              <div className="usrmgt-form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  readOnly
                />
              </div>

              <div className="usrmgt-form-group">
                <label>Role</label>
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
                </div>
              </div>

              <div className="usrmgt-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                />
              </div>

              <div className="usrmgt-form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  readOnly
                />
              </div>

              <div className="usrmgt-form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={formData.country}
                  readOnly
                />
              </div>

              <div className="usrmgt-form-group">
                <label>Access</label>
                <div className="usrmgt-select-wrapper">
                  <select
                    name="access"
                    value=""
                    onChange={(e) => handleAccessSelect(e.target.value)}
                  >
                    <option value="" disabled>Select Access</option>
                    {accessOptions
                      .filter(option => !formData.access.includes(option.value))
                      .map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                  <div className="usrmgt-access-tags">
                    {formData.access.map(item => {
                      const option = accessOptions.find(opt => opt.value === item);
                      return (
                        <div key={item} className="usrmgt-access-tag">
                          {option?.label || item}
                          <FaTimes 
                            className="usrmgt-access-tag-close" 
                            onClick={() => handleRemoveAccess(item)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="usrmgt-form-actions">
              <button type="submit" className="usrmgt-save-button">
                Save Changes
              </button>
              <button 
                type="button" 
                className="usrmgt-cancel-button"
                onClick={() => navigate('/UserManagement')}
              >
                Cancel
              </button>
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

