"use client"

import React, { useState, useEffect } from "react"
import "./AreaManagement.css"
import { Link } from 'react-router-dom';
import axios from '../../api.js';

export default function AreaManagement() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fetch regions from the backend
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/regions");
        if (response.data.success) {
          setAreas(response.data.data);
        } else {
          setError("Failed to fetch regions");
        }
      } catch (err) {
        console.error("Error fetching regions:", err);
        setError("Failed to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAreas = areas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(areas.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditRegion = async (regionId) => {
    const newName = prompt("Enter new region name:");
    if (newName && newName.trim()) {
      try {
        const response = await axios.put(`/regions/${regionId}`, {
          name: newName.trim()
        });
        
        if (response.data.success) {
          // Update the local state with the edited region
          setAreas(areas.map(area => 
            area.id === regionId ? { ...area, region: newName.trim() } : area
          ));
        } else {
          alert("Failed to update region: " + response.data.error);
        }
      } catch (err) {
        console.error("Error updating region:", err);
        alert("Error updating region");
      }
    }
  };

  const handleDeleteRegion = async (regionId) => {
    if (window.confirm("Are you sure you want to delete this region? This will also delete all sub-regions.")) {
      try {
        const response = await axios.delete(`/regions/${regionId}`);
        
        if (response.data.success) {
          // Remove the deleted region from the local state
          setAreas(areas.filter(area => area.id !== regionId));
        } else {
          // Display the specific error message from the server
          alert(response.data.error || "Failed to delete region");
        }
      } catch (err) {
        console.error("Error deleting region:", err);
        // Show the error message from the response if available
        if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error);
        } else {
          alert("Error deleting region. There might be cameras associated with this region.");
        }
      }
    }
  };

  const handleEditSubRegion = async (regionId, subRegionId) => {
    const newName = prompt("Enter new sub-region name:");
    if (newName && newName.trim()) {
      try {
        const response = await axios.put(`/sub-regions/${subRegionId}`, {
          name: newName.trim()
        });
        
        if (response.data.success) {
          // Update the local state with the edited sub-region
          setAreas(areas.map(area => {
            if (area.id === regionId) {
              return {
                ...area,
                subRegions: area.subRegions.map(subRegion => 
                  subRegion.id === subRegionId ? { ...subRegion, name: newName.trim() } : subRegion
                )
              };
            }
            return area;
          }));
        } else {
          alert("Failed to update sub-region: " + response.data.error);
        }
      } catch (err) {
        console.error("Error updating sub-region:", err);
        alert("Error updating sub-region");
      }
    }
  };

  const handleDeleteSubRegion = async (regionId, subRegionId) => {
    if (window.confirm("Are you sure you want to delete this sub-region?")) {
      try {
        const response = await axios.delete(`/sub-regions/${subRegionId}`);
        
        if (response.data.success) {
          // Remove the deleted sub-region from the local state
          setAreas(areas.map(area => {
            if (area.id === regionId) {
              return {
                ...area,
                subRegions: area.subRegions.filter(subRegion => subRegion.id !== subRegionId)
              };
            }
            return area;
          }));
        } else {
          // Display the specific error message from the server
          alert(response.data.error || "Failed to delete sub-region");
        }
      } catch (err) {
        console.error("Error deleting sub-region:", err);
        // Show the error message from the response if available
        if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error);
        } else {
          alert("Error deleting sub-region. There might be cameras associated with this sub-region.");
        }
      }
    }
  };

  if (loading) {
    return <div className="area-management-loading">Loading...</div>;
  }

  if (error) {
    return <div className="area-management-error">Error: {error}</div>;
  }

  return (
    <div className="area-management-main-content">
      <div className="area-management-add-area-container">
        <Link to="/AddArea">
          <button className="area-management-add-new-area-btn">
            + Add Area
          </button>
        </Link>
      </div>
      <div className="area-management-table-container">
        <AreaTable
          areas={currentAreas}
          onEditRegion={handleEditRegion}
          onDeleteRegion={handleDeleteRegion}
          onEditSubRegion={handleEditSubRegion}
          onDeleteSubRegion={handleDeleteSubRegion}
        />
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

function AreaTable({ areas = [], onEditRegion, onDeleteRegion, onEditSubRegion, onDeleteSubRegion }) {
  return (
    <div className="area-management-table-container">
      <table className="area-management-area-table">
        <thead>
          <tr>
            <th>Region</th>
            <th>Sub-region</th>
            <th>Date Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {areas.length > 0 ? (
            areas.map((area) => (
              <React.Fragment key={area.id}>
                {area.subRegions && area.subRegions.length > 0 ? (
                  area.subRegions.map((subRegion, index) => (
                    <tr key={subRegion.id}>
                      {index === 0 ? (
                        <td rowSpan={area.subRegions.length} className="area-management-region-cell">
                          <div className="area-management-region-name">{area.region}</div>
                          <div className="area-management-region-actions">
                            <button 
                              className="area-management-edit-button" 
                              onClick={() => onEditRegion(area.id)}
                              title="Edit Region"
                            >
                              <span className="area-management-edit-icon">✎</span>
                            </button>
                            <button 
                              className="area-management-delete-button" 
                              onClick={() => onDeleteRegion(area.id)}
                              title="Delete Region"
                            >
                              <span className="area-management-delete-icon">🗑</span>
                            </button>
                          </div>
                        </td>
                      ) : null}
                      <td>{subRegion.name}</td>
                      <td>{subRegion.created_at}</td>
                      <td>
                        <div className="area-management-action-buttons">
                          <button 
                            className="area-management-edit-button" 
                            onClick={() => onEditSubRegion(area.id, subRegion.id)}
                            title="Edit Sub-region"
                          >
                            <span className="area-management-edit-icon">✎</span>
                          </button>
                          <button 
                            className="area-management-delete-button" 
                            onClick={() => onDeleteSubRegion(area.id, subRegion.id)}
                            title="Delete Sub-region"
                          >
                            <span className="area-management-delete-icon">🗑</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>{area.region}</td>
                    <td colSpan="2">No sub-regions available</td>
                    <td>
                      <div className="area-management-region-actions">
                        <button 
                          className="area-management-edit-button" 
                          onClick={() => onEditRegion(area.id)}
                          title="Edit Region"
                        >
                          <span className="area-management-edit-icon">✎</span>
                        </button>
                        <button 
                          className="area-management-delete-button" 
                          onClick={() => onDeleteRegion(area.id)}
                          title="Delete Region"
                        >
                          <span className="area-management-delete-icon">🗑</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="4">No areas available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null;

  return (
    <div className="area-management-pagination">
      <button
        className="area-management-pagination-arrow"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      {pages.map((page) => (
        <button
          key={page}
          className={`area-management-pagination-number ${currentPage === page ? "active" : ""}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        className="area-management-pagination-arrow"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  )
}

