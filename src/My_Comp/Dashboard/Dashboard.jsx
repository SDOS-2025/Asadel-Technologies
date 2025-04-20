import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import api from '../../services/api';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cameras, setCameras] = useState([]);
  const [filteredCameras, setFilteredCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoErrors, setVideoErrors] = useState({});
  const [retryCount, setRetryCount] = useState({});
  const [filters, setFilters] = useState({
    region: '',
    subRegion: '',
    camera: ''
  });
  const [dropdownOpen, setDropdownOpen] = useState({
    region: false,
    subRegion: false,
    camera: false
  });
  
  // Base API URL for video feed
  const API_BASE_URL = 'http://localhost:5000';

  // Fetch cameras on component mount
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        // Only fetch active cameras
        const response = await api.getCameras(currentPage, { status: 'Active' });
        console.log('API Response:', response);
        
        if (response && response.cameras) {
          setCameras(response.cameras);
          setFilteredCameras(response.cameras); // Initialize filtered cameras with all cameras
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

  // Apply filters whenever filters state changes
  useEffect(() => {
    // Filter the cameras based on selected filters
    let result = [...cameras];
    
    if (filters.region) {
      result = result.filter(camera => camera.region_name === filters.region);
    }
    
    if (filters.subRegion) {
      result = result.filter(camera => camera.sub_region_name === filters.subRegion);
    }
    
    if (filters.camera) {
      result = result.filter(camera => camera.name === filters.camera);
    }
    
    setFilteredCameras(result);
  }, [filters, cameras]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleVideoError = (cameraId) => {
    console.error(`Video feed error for camera ${cameraId}`);
    
    // Track retry count for this camera
    const currentRetries = retryCount[cameraId] || 0;
    
    // Allow up to 3 retries before showing error
    if (currentRetries < 3) {
      // Update retry count
      setRetryCount(prev => ({
        ...prev,
        [cameraId]: currentRetries + 1
      }));
      
      // Set a timer to retry loading the video
      setTimeout(() => {
        console.log(`Retrying camera ${cameraId}, attempt ${currentRetries + 1}`);
        // Force re-render of the image by updating state
        setVideoErrors(prev => ({
          ...prev,
          [cameraId]: false
        }));
      }, 3000); // Retry after 3 seconds
    } else {
      // After 3 retries, show error message
      setVideoErrors(prev => ({
        ...prev,
        [cameraId]: true
      }));
    }
  };

  const handleRetryCamera = (cameraId) => {
    // Reset retry count and error status
    setRetryCount(prev => ({
      ...prev,
      [cameraId]: 0
    }));
    
    setVideoErrors(prev => ({
      ...prev,
      [cameraId]: false
    }));
    
    console.log(`Manually retrying camera ${cameraId}`);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Update the selected filter
      newFilters[filterType] = value;
      
      // Reset dependent filters when a parent filter changes
      if (filterType === 'region') {
        newFilters.subRegion = '';
        newFilters.camera = '';
      } else if (filterType === 'subRegion') {
        newFilters.camera = '';
      }
      
      return newFilters;
    });
    
    // Close the dropdown
    setDropdownOpen(prev => ({
      ...prev,
      [filterType]: false
    }));
  };

  // Toggle dropdown visibility
  const toggleDropdown = (dropdownType) => {
    setDropdownOpen(prev => ({
      ...prev,
      [dropdownType]: !prev[dropdownType]
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      region: '',
      subRegion: '',
      camera: ''
    });
  };

  // Get unique regions from the cameras data
  const uniqueRegions = [...new Set(cameras.map(camera => camera.region_name))];
  
  // Get unique sub-regions based on selected region
  const uniqueSubRegions = filters.region 
    ? [...new Set(cameras
        .filter(camera => camera.region_name === filters.region)
        .map(camera => camera.sub_region_name))]
    : [];
  
  // Get unique cameras based on selected sub-region
  const uniqueCameras = filters.subRegion
    ? [...new Set(cameras
        .filter(camera => 
          camera.region_name === filters.region && 
          camera.sub_region_name === filters.subRegion)
        .map(camera => camera.name))]
    : [];

  // Filter dropdown component with functionality
  const FilterDropdown = React.forwardRef(({ type, label, options, value, disabled = false }, ref) => {
    // Determine display text - show the label if no value is selected
    const displayText = value || label;
    
    return (
      <div className="dashboard-dropdown" ref={ref}>
        <div onClick={() => !disabled && toggleDropdown(type)} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <span title={displayText}>{displayText}</span>
          <button 
            className="dashboard-dropdown-button" 
            disabled={disabled}
          >
            <span>▼</span>
          </button>
        </div>
        {dropdownOpen[type] && options.length > 0 && (
          <div className="dashboard-dropdown-menu">
            <div 
              className="dashboard-dropdown-item"
              onClick={() => handleFilterChange(type, '')}
            >
              All {label}s
            </div>
            {options.map(option => (
              <div 
                key={option} 
                className="dashboard-dropdown-item" 
                onClick={() => handleFilterChange(type, option)}
                title={option}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  });

  // Create refs for handling clicks outside dropdowns
  const regionDropdownRef = React.useRef(null);
  const subRegionDropdownRef = React.useRef(null);
  const cameraDropdownRef = React.useRef(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      const clickedOutsideAll = 
        (!regionDropdownRef.current || !regionDropdownRef.current.contains(event.target)) &&
        (!subRegionDropdownRef.current || !subRegionDropdownRef.current.contains(event.target)) &&
        (!cameraDropdownRef.current || !cameraDropdownRef.current.contains(event.target));
      
      if (clickedOutsideAll) {
        setDropdownOpen({
          region: false,
          subRegion: false,
          camera: false
        });
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Camera feed component - Using processed video feed from backend with fallback
  const CameraFeed = ({ camera }) => (
    <div className="dashboard-camera-feed">
      <div className="dashboard-camera-image-container">
        {videoErrors[camera.id] ? (
          <div className="video-unavailable">
            <p>Video feed unavailable</p>
            <p>Connection error</p>
            <button 
              className="retry-button"
              onClick={() => handleRetryCamera(camera.id)}
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <img
            key={`cam-${camera.id}-retry-${retryCount[camera.id] || 0}`}
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
        <FilterDropdown 
          type="region" 
          label="Region" 
          options={uniqueRegions} 
          value={filters.region}
          ref={regionDropdownRef}
        />
        <FilterDropdown 
          type="subRegion" 
          label="Sub-region" 
          options={uniqueSubRegions} 
          value={filters.subRegion}
          disabled={!filters.region}
          ref={subRegionDropdownRef}
        />
        <FilterDropdown 
          type="camera" 
          label="Camera" 
          options={uniqueCameras} 
          value={filters.camera}
          disabled={!filters.subRegion}
          ref={cameraDropdownRef}
        />
        {(filters.region || filters.subRegion || filters.camera) && (
          <button 
            className="dashboard-reset-button"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        )}
      </div>
      
      <div className="dashboard-camera-grid">
        {filteredCameras.length === 0 ? (
          <div className="no-cameras-message">
            <p>No active cameras available</p>
            <p className="no-cameras-subtext">
              {filters.region || filters.subRegion || filters.camera
                ? "No cameras match the selected filters. Try different filter options or reset filters."
                : "Please add cameras or activate existing ones from Camera Management"}
            </p>
          </div>
        ) : (
          filteredCameras.map(camera => (
            <CameraFeed key={camera.id} camera={camera} />
          ))
        )}
      </div>
      
      {filteredCameras.length > 0 && <Pagination />}
    </div>
  );
}

