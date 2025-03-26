import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import { Link } from 'react-router-dom';

import { FaBars, FaBell, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaLinkedin, FaInstagram, FaTwitter, FaYoutube, FaUser } from 'react-icons/fa';
import api from '../../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers(currentPage);
      setUsers(data.users);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  // Handle actual deletion
  const handleDeleteConfirm = async () => {
    try {
      await api.deleteUser(userToDelete);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle cancel deletion
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  // Handle user edit
  const handleEditUser = (userId) => {
    // Navigate to edit user page with the user ID
    window.location.href = `/EditUser/${userId}`;
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function to get user initials
  const getUserInitials = (fullName) => {
    if (!fullName) return 'NA';
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .slice(0, 2);
  };

  // Function to get pagination numbers
  const getPaginationNumbers = () => {
    const maxVisiblePages = 5;
    const halfMaxPages = Math.floor(maxVisiblePages / 2);
    let pages = [];

    if (totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all pages
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible pages
      let startPage = Math.max(2, currentPage - halfMaxPages);
      let endPage = Math.min(totalPages - 1, currentPage + halfMaxPages);

      // Adjust start and end if we're near the edges
      if (currentPage <= halfMaxPages) {
        startPage = 2;
        endPage = maxVisiblePages - 1;
      } else if (currentPage > totalPages - halfMaxPages) {
        startPage = totalPages - maxVisiblePages + 2;
        endPage = totalPages - 1;
      }

      // Add ellipsis and pages
      if (startPage > 2) {
        pages.push('...');
      }
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  // Function to format access level display
  const formatAccessLevel = (accessLevel) => {
    try {
      // Parse the JSON string if it's a string
      const accessArray = typeof accessLevel === 'string' ? JSON.parse(accessLevel) : accessLevel;
      // Join array elements with commas
      return Array.isArray(accessArray) ? accessArray.join(', ') : accessLevel;
    } catch (error) {
      // If parsing fails, return the original value
      return accessLevel;
    }
  };

  if (loading) {
    return <div className="user-management-loading">Loading users...</div>;
  }

  if (error) {
    return <div className="user-management-error">Error: {error}</div>;
  }

  return (
    <div className="user-management">
      {/* Main Content */}
      <main className="user-management-main-content">
        <div className="user-management-content-header">
          <Link to="/AddUser">
            <button className="user-management-add-user-button">Add User</button>
          </Link>
        </div>

        <div className="user-management-user-list">
          {users.map(user => (
            <div className="user-management-user-card" key={user.id}>
              <div className="user-management-avatar">
                <div className="user-management-avatar-circle">
                  <span className="user-management-avatar-initials">
                    {getUserInitials(user.full_name)}
                  </span>
                </div>
              </div>
              
              <div style={{ width: "20px" }}></div>
              
              <div className="user-management-user-details">
                <div className="user-management-user-info">
                  <p><strong>Full Name:</strong> {user.full_name}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Access:</strong> {formatAccessLevel(user.access_level)}</p>
                </div>
                <div className="user-management-user-actions">
                  <button 
                    className="user-management-action-button edit"
                    onClick={() => handleEditUser(user.id)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="user-management-action-button delete"
                    onClick={() => handleDeleteClick(user.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="user-management-pagination">
          <button 
            className="user-management-pagination-button"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </button>
          
          {getPaginationNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="user-management-pagination-ellipsis">
                ...
              </span>
            ) : (
              <button 
                key={page}
                className={`user-management-pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            )
          ))}
          
          <button 
            className="user-management-pagination-button"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <FaChevronRight />
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="user-management-modal-overlay">
          <div className="user-management-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="user-management-modal-buttons">
              <button 
                className="user-management-modal-button cancel"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button 
                className="user-management-modal-button confirm"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

