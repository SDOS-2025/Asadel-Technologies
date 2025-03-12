import React, { useState } from 'react';
import './AddCamera.css';

const AddCamera = ({ onClose }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
  };

  return (
    <div className="add-camera-overlay">
      <div className="add-camera-modal">
        <button className="add-camera-close" onClick={onClose}>×</button>
        
        <form className="add-camera-form" onSubmit={handleSubmit}>
          <div className="add-camera-input-wrapper">
            <input
              type="text"
              placeholder="Type Camera Name"
              className="add-camera-input add-camera-required"
            />
          </div>

          <div className="add-camera-input-wrapper">
            <input
              type="text"
              placeholder="Enter RTSP URL"
              className="add-camera-input add-camera-required"
            />
          </div>

          <div className="add-camera-dropdown-row">
            <div className="add-camera-dropdown add-camera-dropdown-small">
              <select className="add-camera-select">
                <option value="" disabled selected>Select Region</option>
                <option value="region1">Region 1</option>
                <option value="region2">Region 2</option>
              </select>
              <div className="add-camera-dropdown-arrow">▼</div>
            </div>
          </div>

          <div className="add-camera-dropdown-row">
            <div className="add-camera-dropdown add-camera-dropdown-small">
              <select className="add-camera-select">
                <option value="" disabled selected>Select Sub-region</option>
                <option value="sub1">Sub-region 1</option>
                <option value="sub2">Sub-region 2</option>
              </select>
              <div className="add-camera-dropdown-arrow">▼</div>
            </div>
          </div>

          <div className="add-camera-input-wrapper">
            <input
              type="text"
              placeholder="Camera Description"
              className="add-camera-input add-camera-required"
            />
          </div>

          <div className="add-camera-dropdown-row">
            <div className="add-camera-dropdown">
              <select className="add-camera-select">
                <option value="" disabled selected>User Management</option>
                <option value="admin">Admin Only</option>
                <option value="all">All Users</option>
              </select>
              <div className="add-camera-dropdown-arrow">▼</div>
            </div>
          </div>

          <div className="add-camera-button-container">
            <button type="submit" className="add-camera-submit">
              Add
            </button>
          </div>

          {showSuccess && (
            <div className="add-camera-success">
              New Camera added!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddCamera;
