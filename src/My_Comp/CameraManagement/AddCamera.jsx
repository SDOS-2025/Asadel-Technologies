import React, { useState, useEffect } from 'react';
import './AddCamera.css';
import api from '../../services/api';

const AddCamera = ({ onClose, onCameraAdded }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingAreas, setFetchingAreas] = useState(true);
  const [regions, setRegions] = useState([]);
  const [subRegions, setSubRegions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    rtsp_url: '',
    region: '',
    sub_region: '',
    description: '',
    access_level: ''
  });

  // Fetch regions and sub-regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setFetchingAreas(true);
        const result = await api.getRegions();
        if (result.success && result.data) {
          setRegions(result.data);
        } else {
          setError('Failed to fetch regions');
        }
      } catch (err) {
        console.error('Error fetching regions:', err);
        setError('Failed to load regions. Please try again.');
      } finally {
        setFetchingAreas(false);
      }
    };

    fetchRegions();
  }, []);

  // Update available sub-regions when region changes
  useEffect(() => {
    if (formData.region) {
      const selectedRegion = regions.find(r => r.id.toString() === formData.region);
      if (selectedRegion && selectedRegion.subRegions) {
        setSubRegions(selectedRegion.subRegions);
      } else {
        setSubRegions([]);
      }
    } else {
      setSubRegions([]);
    }
  }, [formData.region, regions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // If changing region, reset sub_region
      if (name === 'region') {
        return {
          ...prev,
          [name]: value,
          sub_region: ''
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate form
    const requiredFields = ['name', 'rtsp_url', 'region', 'sub_region', 'description', 'access_level'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in all required fields`);
        setIsLoading(false);
        return;
      }
    }

    try {
      // Send data to the server
      const result = await api.createCamera(formData);
      console.log('Camera added successfully:', result);
      
      setShowSuccess(true);
      setIsLoading(false);
      
      // Notify parent component that a camera was added
      if (onCameraAdded) {
        onCameraAdded();
      }
      
      // Close the modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Error adding camera:', err);
      setError(err.message || 'Failed to add camera');
      setIsLoading(false);
    }
  };

  return (
    <div className="add-camera-overlay">
      <div className="add-camera-modal">
        <button className="add-camera-close" onClick={onClose}>×</button>
        
        {error && <div className="add-camera-error">{error}</div>}
        
        <form className="add-camera-form" onSubmit={handleSubmit}>
          <div className="add-camera-input-wrapper">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Camera Name"
              className="add-camera-input add-camera-required"
            />
          </div>

          <div className="add-camera-input-wrapper">
            <input
              type="text"
              name="rtsp_url"
              value={formData.rtsp_url}
              onChange={handleChange}
              placeholder="Enter RTSP URL"
              className="add-camera-input add-camera-required"
            />
          </div>

          <div className="add-camera-dropdown-row">
            <div className="add-camera-dropdown add-camera-dropdown-small">
              <select 
                className="add-camera-select"
                name="region"
                value={formData.region}
                onChange={handleChange}
                disabled={fetchingAreas}
              >
                <option value="" disabled>
                  {fetchingAreas ? 'Loading regions...' : 'Select Region'}
                </option>
                {regions.map(region => (
                  <option key={region.id} value={region.id.toString()}>
                    {region.region}
                  </option>
                ))}
              </select>
              <div className="add-camera-dropdown-arrow">▼</div>
            </div>
          </div>

          <div className="add-camera-dropdown-row">
            <div className="add-camera-dropdown add-camera-dropdown-small">
              <select 
                className="add-camera-select"
                name="sub_region"
                value={formData.sub_region}
                onChange={handleChange}
                disabled={!formData.region || fetchingAreas}
              >
                <option value="" disabled>
                  {!formData.region 
                    ? 'Select a region first' 
                    : fetchingAreas 
                      ? 'Loading...' 
                      : 'Select Sub-region'}
                </option>
                {subRegions.map(subRegion => (
                  <option key={subRegion.id} value={subRegion.id.toString()}>
                    {subRegion.name}
                  </option>
                ))}
              </select>
              <div className="add-camera-dropdown-arrow">▼</div>
            </div>
          </div>

          <div className="add-camera-input-wrapper">
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Camera Description"
              className="add-camera-input add-camera-required"
            />
          </div>

          <div className="add-camera-dropdown-row">
            <div className="add-camera-dropdown">
              <select 
                className="add-camera-select"
                name="access_level"
                value={formData.access_level}
                onChange={handleChange}
              >
                <option value="" disabled>Access Level</option>
                <option value="1">Admin Only</option>
                <option value="2">All Users</option>
              </select>
              <div className="add-camera-dropdown-arrow">▼</div>
            </div>
          </div>

          <div className="add-camera-button-container">
            <button 
              type="submit" 
              className="add-camera-submit"
              disabled={isLoading || fetchingAreas}
            >
              {isLoading ? 'Adding...' : 'Add'}
            </button>
          </div>

          {showSuccess && (
            <div className="add-camera-success">
              New Camera added successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddCamera;
