"use client"

import React, { useState } from "react"
import "./AreaManagement.css"
import { Link } from 'react-router-dom';

export default function AreaManagement() {
  const [areas, setAreas] = useState([
    {
      id: 1,
      region: "Building A",
      subRegions: [
        { id: 1, name: "Entry 1", dateCreated: "14/02/25" },
        { id: 2, name: "Exit 1", dateCreated: "14/02/25" },
        { id: 3, name: "Main Hall", dateCreated: "14/02/25" },
      ],
    },
    {
      id: 2,
      region: "Building B",
      subRegions: [
        { id: 4, name: "Entry 1", dateCreated: "14/02/25" },
        { id: 5, name: "Exit 1", dateCreated: "14/02/25" },
        { id: 6, name: "Main Hall", dateCreated: "14/02/25" },
      ],
    },
  ])

  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleAddArea = () => {
    console.log("Add area clicked")
  }

  const handleEditRegion = (regionId) => {
    console.log("Edit region", regionId)
  }

  const handleDeleteRegion = (regionId) => {
    console.log("Delete region", regionId)
  }

  const handleEditSubRegion = (regionId, subRegionId) => {
    console.log("Edit sub-region", regionId, subRegionId)
  }

  const handleDeleteSubRegion = (regionId, subRegionId) => {
    console.log("Delete sub-region", regionId, subRegionId)
  }

  return (
    <div className="area-management-main-content">
      <div className="area-management-add-area-container">
        <Link to="/AddArea">
        <button className="area-management-add-new-area-btn" onClick={handleAddArea}>
          + Add Area
        </button>
        </Link>
      </div>
      <div className="area-management-table-container">
        <AreaTable
          areas={areas}
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
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {areas.length > 0 ? (
            areas.map((area) => (
              <React.Fragment key={area.id}>
                {(area.subRegions || []).map((subRegion, index) => (
                  <tr key={subRegion.id}>
                    {index === 0 ? (
                      <td rowSpan={area.subRegions.length} className="area-management-region-cell">
                        {area.region}
                      </td>
                    ) : null}
                    <td>{subRegion.name}</td>
                    <td>{subRegion.dateCreated}</td>
                    <td>
                      <div className="area-management-action-buttons">
                        <button className="area-management-edit-button" onClick={() => onEditSubRegion(area.id, subRegion.id)}>
                          <span className="area-management-edit-icon">✎</span>
                        </button>
                        <button className="area-management-delete-button" onClick={() => onDeleteSubRegion(area.id, subRegion.id)}>
                          <span className="area-management-delete-icon">🗑</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  if (totalPages === 0) return null

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

