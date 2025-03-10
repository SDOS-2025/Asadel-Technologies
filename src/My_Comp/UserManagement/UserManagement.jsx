import React, { useState } from 'react';
import './UserManagement.css';
import { FaBars, FaBell, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaLinkedin, FaInstagram, FaTwitter, FaYoutube, FaUser } from 'react-icons/fa';

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
      fullName: "Rahul Sharma",
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

  // Function to get user initials
  const getUserInitials = (fullName) => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .slice(0, 2);
  };

  return (
    <div className="user-management">
     
      {/* Main Content */}
      <main className="user-management-main-content">
        <div className="user-management-content-header">
          <button className="user-management-add-user-button">Add User</button>
        </div>

        <div className="user-management-user-list">
          {users.map(user => (
            <div className="user-management-user-card" key={user.id}>
              <div className="user-management-avatar">
                <div className="user-management-avatar-circle">
                  <span className="user-management-avatar-initials">
                    {getUserInitials(user.fullName)}
                  </span>
                </div>
              </div>
              
              {/* Spacer div to create more space */}
              <div style={{ width: "20px" }}></div>
              
              <div className="user-management-user-details">
                <div className="user-management-user-info">
                  <p><strong>Full Name:</strong> {user.fullName}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Access:</strong> {user.access.join(", ")}</p>
                </div>
                <div className="user-management-user-actions">
                  <button className="user-management-action-button edit">
                    <FaEdit />
                  </button>
                  <button className="user-management-action-button delete" onClick={() => handleDeleteUser(user.id)}>
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
          
          {[1, 2, 3, 4].map(page => (
            <button 
              key={page}
              className={`user-management-pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
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
    </div>
  );
}

