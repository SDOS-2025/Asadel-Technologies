import React, { useState } from 'react';
import './UserManagement.css';
import { FaBars, FaBell, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaLinkedin, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

export default function UserManagement() {
  // Sample user data
  const [users, setUsers] = useState([
    {
      id: 1,
      fullName: "Naman Jindal",
      role: "Manager",
      access: ["Reports", "Live Feed", "Dashboard"]
    },
    {
      id: 2,
      fullName: "Naman Jindal",
      role: "User",
      access: ["Reports", "Live Feed", "Dashboard"]
    }
  ]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle user deletion
  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  return (
    <div className="user-management">
     
      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <button className="add-user-button">Add User</button>
        </div>

        <div className="user-list">
          {users.map(user => (
            <div className="user-card" key={user.id}>
              <div className="user-avatar">
                <div className="avatar-circle"></div>
              </div>
              <div className="user-details">
                <div className="user-info">
                  <p><strong>Full Name:</strong> {user.fullName}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Access:</strong> {user.access.join(", ")}</p>
                </div>
                <div className="user-actions">
                  <button className="action-button edit">
                    <FaEdit />
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </button>
          
          {[1, 2, 3, 4].map(page => (
            <button 
              key={page}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <FaChevronRight />
          </button>
        </div>
      </main>

     
    </div>
  );
}

