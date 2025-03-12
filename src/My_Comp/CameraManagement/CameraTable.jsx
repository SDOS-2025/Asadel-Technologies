"use client"
import "./CameraManagement.css"
import { useState } from "react"
import { Link } from "react-router-dom"
import { EditIcon, DeleteIcon } from "./Icons"

export default function CameraTable() {
  const [currentPage, setCurrentPage] = useState(1)

  const mockData = [
    {
      id: 1,
      name: "Entry 1",
      rtspUrl: "rtsp://admin:admin@123:192.168.1.1:5044",
      region: "Building A",
      subRegion: "Entry 1",
      cameraName: "C1",
      dateCreated: "15/02/25",
      status: "Active",
    },
    {
      id: 2,
      name: "Entry 1",
      rtspUrl: "rtsp://admin:admin@123:192.168.1.1:5044",
      region: "Building A",
      subRegion: "Entry 1",
      cameraName: "C1",
      dateCreated: "15/02/25",
      status: "Active",
    },
    {
      id: 3,
      name: "Entry 1",
      rtspUrl: "rtsp://admin:admin@123:192.168.1.1:5044",
      region: "Building A",
      subRegion: "Entry 1",
      cameraName: "C1",
      dateCreated: "15/02/25",
      status: "Active",
    },
    {
      id: 4,
      name: "Entry 1",
      rtspUrl: "rtsp://admin:admin@123:192.168.1.1:5044",
      region: "Building A",
      subRegion: "Entry 1",
      cameraName: "C1",
      dateCreated: "15/02/25",
      status: "Inactive",
    },
  ]

  const handleEdit = (id) => {
    console.log("Edit camera:", id)
  }

  const handleDelete = (id) => {
    console.log("Delete camera:", id)
  }

  return (
    <div className="camera-management-table-container">
      <div className="camera-management-button-container">
        <Link to="/AddCamera">
        <button className="camera-management-add-camera-btn">Add Camera</button>
        </Link>
      </div>
      
      <table className="camera-management-camera-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>RTSP URL</th>
            <th>Region</th>
            <th>Sub-region</th>
            <th>Camera Name</th>
            <th>Date Created</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((camera) => (
            <tr key={camera.id}>
              <td>{camera.name}</td>
              <td>{camera.rtspUrl}</td>
              <td>{camera.region}</td>
              <td>{camera.subRegion}</td>
              <td>{camera.cameraName}</td>
              <td>{camera.dateCreated}</td>
              <td>
                <span 
                  className={`camera-management-status-badge ${camera.status.toLowerCase()}`}
                  style={{ 
                    backgroundColor: camera.status === "Active" ? "#e6f7ed" : "#ffebee",
                    color: camera.status === "Active" ? "#00c853" : "#d32f2f"
                  }}
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
        {[1, 2, 3, 4].map((page) => (
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
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === 4}
        >
          &gt;
        </button>
      </div>
    </div>
  )
}



