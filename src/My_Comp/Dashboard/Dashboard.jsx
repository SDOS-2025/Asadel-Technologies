import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import api from '../../services/api';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoErrors, setVideoErrors] = useState({});
  
  // Base API URL for video feed
  const API_BASE_URL = 'http://localhost:5000';

  // Fetch cameras on component mount
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        const response = await api.getCameras(currentPage);
        console.log('API Response:', response);
        
        if (response && response.cameras) {
          setCameras(response.cameras);
          if (response.total_pages) {
            setTotalPages(response.total_pages);
          }
        } else {
          console.error('Unexpected response format:', response);
          setError('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching cameras:', err);
        setError(err.message || 'Failed to load cameras. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleVideoError = (cameraId) => {
    console.error(`Video feed error for camera ${cameraId}`);
    setVideoErrors(prev => ({
      ...prev,
      [cameraId]: true
    }));
  };

  // Filter dropdowns
  const Dropdown = ({ label }) => (
    <div className="dashboard-dropdown">
      <span>{label}</span>
      <button className="dashboard-dropdown-button">
        <span>▼</span>
      </button>
    </div>
  );

  // Camera feed component - Using processed video feed from backend with fallback
  const CameraFeed = ({ camera }) => (
    <div className="dashboard-camera-feed">
      <div className="dashboard-camera-image-container">
        {videoErrors[camera.id] ? (
          <div className="video-unavailable">
            <p>Video feed unavailable</p>
            <p>Connection error</p>
          </div>
        ) : (
          <img
            src={`${API_BASE_URL}/video_feed/${camera.id}`}
            alt={camera.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => handleVideoError(camera.id)}
          />
        )}
        <div className={`highlight-box ${camera.highlight}`}></div>
      </div>
      <div className="dashboard-camera-info">
        <span className="dashboard-camera-type">{camera.name}</span>
        <span className="dashboard-camera-id">{camera.id}</span>
      </div>
    </div>
  );

  // Pagination component
  const Pagination = () => (
    <div className="dashboard-pagination">
      <button 
        className="dashboard-pagination-arrow" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          className={`dashboard-pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
          onClick={() => handlePageChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}
      
      <button 
        className="dashboard-pagination-arrow" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );

  if (loading) {
    return <div className="dashboard-loading">Loading cameras...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-surveillance-dashboard">
      <div className="dashboard-filters">
        <Dropdown label="Region" />
        <Dropdown label="Sub-region" />
        <Dropdown label="Camera" />
      </div>
      
      <div className="dashboard-camera-grid">
        {cameras.length === 0 ? (
          <div className="no-cameras-message">No cameras available</div>
        ) : (
          cameras.map(camera => (
            <CameraFeed key={camera.id} camera={camera} />
          ))
        )}
      </div>
      
      <Pagination />
    </div>
  );
}

