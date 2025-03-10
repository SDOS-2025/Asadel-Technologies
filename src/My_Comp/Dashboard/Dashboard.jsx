import React, { useState } from 'react';
import './Dashboard.css';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  // Mock data for camera feeds
  const cameraFeeds = [
    { id: 'C1', type: 'Entry 1', image: './Das_image.png' },
    { id: 'C2', type: 'Entry 2', image: './Das_image.png'},
    { id: 'C3', type: 'Exit 1', image: './Das_image.png'},
    { id: 'C4', type: 'Entry 1', image: './Das_image.png'},
    { id: 'C5', type: 'Entry 2', image: './Das_image.png'},
    { id: 'C6', type: 'Exit 1', image: './Das_image.png'},
  ];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  // Camera feed component
  const CameraFeed = ({ feed }) => (
    <div className="dashboard-camera-feed">
      <div className="dashboard-camera-image-container">
        <img src={feed.image || "/placeholder.svg"} alt={`${feed.type} ${feed.id}`} className="dashboard-camera-image" />
        <div className={`highlight-box ${feed.highlight}`}></div>
      </div>
      <div className="dashboard-camera-info">
        <span className="dashboard-camera-type">{feed.type}</span>
        <span className="dashboard-camera-id">{feed.id}</span>
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

  return (
    <div className="dashboard-surveillance-dashboard">
      <div className="dashboard-filters">
        <Dropdown label="Region" />
        <Dropdown label="Sub-region" />
        <Dropdown label="Camera" />
      </div>
      
      <div className="dashboard-camera-grid">
        {cameraFeeds.map(feed => (
          <CameraFeed key={feed.id} feed={feed} />
        ))}
      </div>
      
      <Pagination />
    </div>
  );
}

