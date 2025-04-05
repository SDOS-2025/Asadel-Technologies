"use client"
import "./CameraManagement.css"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { EditIcon, DeleteIcon } from "./Icons"
import api from "../../services/api"
import AddCamera from "./AddCamera"
import EditCamera from "./EditCamera"

export default function CameraTable() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddCamera, setShowAddCamera] = useState(false);
  const [showEditCamera, setShowEditCamera] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Fetch cameras data from API
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        const response = await api.getCameras(currentPage);
        setCameras(response.cameras || []);
        setTotalPages(response.total_pages || 1);
        setError('');
      } catch (err) {
        console.error("Error fetching cameras:", err);
        setError('Failed to load cameras. Please try again.');
        setCameras([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, [currentPage, refreshTrigger]);

  const handleEdit = (cameraId) => {
    setSelectedCameraId(cameraId);
    setShowEditCamera(true);
  };

  const handleDelete = async (cameraId) => {
    if (!window.confirm("Are you sure you want to delete this camera?")) {
      return;
    }

    try {
      await api.deleteCamera(cameraId);
      // Refresh the camera list
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error deleting camera:", err);
      alert("Failed to delete camera. Please try again.");
    }
  };

  const handleStatusToggle = async (cameraId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    try {
      await api.updateCameraStatus(cameraId, newStatus);
      // Update the local state to reflect the change
      setCameras(cameras.map(camera => 
        camera.id === cameraId ? {...camera, status: newStatus} : camera
      ));
    } catch (err) {
      console.error("Error updating camera status:", err);
      alert("Failed to update camera status. Please try again.");
    }
  };

  const handleAddCamera = () => {
    setShowAddCamera(true);
  };

  const handleCameraAdded = () => {
    // Refresh the camera list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCameraUpdated = () => {
    // Refresh the camera list
    setRefreshTrigger(prev => prev + 1);
  };

  // Generate page numbers array for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="camera-management-table-container">
      <div className="camera-management-button-container">
        <button 
          className="camera-management-add-camera-btn" 
          onClick={handleAddCamera}
        >
          Add Camera
        </button>
      </div>
      
      {error && <div className="camera-management-error">{error}</div>}
      
      {loading ? (
        <div className="camera-management-loading">Loading cameras...</div>
      ) : (
        <>
          {cameras.length === 0 ? (
            <div className="camera-management-no-data">No cameras found</div>
          ) : (
            <table className="camera-management-camera-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>RTSP URL</th>
                  <th>Region</th>
                  <th>Sub-region</th>
                  <th>Description</th>
                  <th>Date Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cameras.map((camera) => (
                  <tr key={camera.id}>
                    <td>{camera.name}</td>
                    <td>{camera.rtsp_url}</td>
                    <td>{camera.region_name || camera.region}</td>
                    <td>{camera.sub_region_name || camera.sub_region}</td>
                    <td>{camera.description}</td>
                    <td>{camera.created_at}</td>
                    <td>
                      <span 
                        className={`camera-management-status-badge ${camera.status.toLowerCase()}`}
                        style={{ 
                          backgroundColor: camera.status === "Active" ? "#e6f7ed" : "#ffebee",
                          color: camera.status === "Active" ? "#00c853" : "#d32f2f"
                        }}
                        onClick={() => handleStatusToggle(camera.id, camera.status)}
                      >
                        {camera.status}
                      </span>
                    </td>
                    <td>
                      <div className="camera-management-action-buttons">
                        <button 
                          className="camera-management-action-button edit"
                          onClick={() => handleEdit(camera.id)}
                          title="Edit camera"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          className="camera-management-action-button delete"
                          onClick={() => handleDelete(camera.id)}
                          title="Delete camera"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {totalPages > 1 && (
            <>
              {/* Spacer div to create more space between table and pagination */}
              <div style={{ height: "40px" }}></div>
              
              <div className="camera-management-pagination">
                <button
                  className="camera-management-pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    className={`camera-management-pagination-number ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="camera-management-pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            </>
          )}
        </>
      )}
      
      {showAddCamera && (
        <AddCamera 
          onClose={() => setShowAddCamera(false)} 
          onCameraAdded={handleCameraAdded}
        />
      )}

      {showEditCamera && selectedCameraId && (
        <EditCamera 
          cameraId={selectedCameraId}
          onClose={() => {
            setShowEditCamera(false);
            setSelectedCameraId(null);
          }} 
          onCameraUpdated={handleCameraUpdated}
        />
      )}
    </div>
  )
}



