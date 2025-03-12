"use client"

import { useState } from "react"
import "./AddArea.css"

const RegionManager = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState("Region A")
  const [showRegionAdded, setShowRegionAdded] = useState(false)
  const [showSubRegionAdded, setShowSubRegionAdded] = useState(true)
  const [newRegion, setNewRegion] = useState("Add new region")
  const [newSubRegion, setNewSubRegion] = useState("Add new sub-region")

  const regions = ["Region A", "Region B", "Region C"]

  const handleRegionSelect = (region) => {
    setSelectedRegion(region)
    setIsDropdownOpen(false)
  }

  const handleAddRegion = () => {
    if (newRegion.trim()) {
      setShowRegionAdded(true)
      setNewRegion("")
      setTimeout(() => setShowRegionAdded(false), 3000)
    }
  }

  const handleAddSubRegion = () => {
    if (newSubRegion.trim()) {
      setShowSubRegionAdded(true)
      setNewSubRegion("")
      setTimeout(() => setShowSubRegionAdded(false), 3000)
    }
  }

  return (
    <div className="area-add-wrapper">
      <div className="area-add-container">
        <input 
          type="text" 
          className="area-add-input" 
          placeholder="Add new region" 
          value={newRegion}
          onChange={(e) => setNewRegion(e.target.value)}
        />

        <div className="area-add-or-divider">or</div>

        <div className="area-add-dropdown-container">
          <div className="area-add-dropdown">
            <div className="area-add-dropdown-header" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="area-add-dropdown-text">Select Region</div>
              <div className="area-add-dropdown-arrow">▼</div>
            </div>

            {isDropdownOpen && (
              <div className="area-add-dropdown-options">
                {regions.map((region) => (
                  <div key={region} className="area-add-dropdown-option" onClick={() => handleRegionSelect(region)}>
                    {region}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="area-add-selected-text">{selectedRegion} selected</div>
        </div>

        <button className="area-add-submit-button" onClick={handleAddRegion}>
          Add
        </button>

        {showRegionAdded && <div className="area-add-success-message">New region added successfully!</div>}

        <div className="area-add-section-divider"></div>

        <input 
          type="text" 
          className="area-add-input" 
          placeholder="Add new sub-region" 
          value={newSubRegion}
          onChange={(e) => setNewSubRegion(e.target.value)}
        />

        {showSubRegionAdded && <div className="area-add-success-message">New sub-region added!</div>}

        <button className="area-add-submit-button" onClick={handleAddSubRegion}>
          Add
        </button>
      </div>
    </div>
  )
}

export default RegionManager

