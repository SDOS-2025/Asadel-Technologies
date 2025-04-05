"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "../../api.js"
import "./AddArea.css"

const AddArea = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState({ region: false, subRegion: false })
  const [newRegion, setNewRegion] = useState("")
  const [newSubRegion, setNewSubRegion] = useState("")
  const navigate = useNavigate()

  // Fetch regions from the backend
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/regions")
        if (response.data.success) {
          setRegions(response.data.data)
          if (response.data.data.length > 0) {
            setSelectedRegion(response.data.data[0])
          }
        } else {
          setError("Failed to fetch regions")
        }
      } catch (err) {
        console.error("Error fetching regions:", err)
        setError("Failed to connect to the server")
      } finally {
        setLoading(false)
      }
    }

    fetchRegions()
  }, [])

  const handleRegionSelect = (region) => {
    setSelectedRegion(region)
    setIsDropdownOpen(false)
  }

  const handleAddRegion = async () => {
    if (newRegion.trim()) {
      try {
        const response = await axios.post("/regions", {
          name: newRegion.trim()
        })

        if (response.data.success) {
          // Show success message
          setSuccess({ ...success, region: true })
          
          // Add the new region to the list
          const newRegionData = {
            id: response.data.data.id,
            region: response.data.data.name,
            subRegions: []
          }
          
          setRegions([...regions, newRegionData])
          setSelectedRegion(newRegionData)
          setNewRegion("")
          
          // Hide success message after 3 seconds
          setTimeout(() => setSuccess({ ...success, region: false }), 3000)
        } else {
          alert("Failed to add region: " + response.data.error)
        }
      } catch (err) {
        console.error("Error adding region:", err)
        if (err.response && err.response.data && err.response.data.error) {
          alert("Error: " + err.response.data.error)
        } else {
          alert("Failed to add region")
        }
      }
    } else {
      alert("Please enter a region name")
    }
  }

  const handleAddSubRegion = async () => {
    if (!selectedRegion) {
      alert("Please select a region first")
      return
    }

    if (newSubRegion.trim()) {
      try {
        const response = await axios.post("/sub-regions", {
          name: newSubRegion.trim(),
          region_id: selectedRegion.id
        })

        if (response.data.success) {
          // Show success message
          setSuccess({ ...success, subRegion: true })
          
          // Update the selected region with the new sub-region
          const updatedRegions = regions.map(region => {
            if (region.id === selectedRegion.id) {
              return {
                ...region,
                subRegions: [
                  ...region.subRegions,
                  {
                    id: response.data.data.id,
                    name: response.data.data.name,
                    created_at: new Date().toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit'
                    })
                  }
                ]
              }
            }
            return region
          })
          
          setRegions(updatedRegions)
          setSelectedRegion(updatedRegions.find(r => r.id === selectedRegion.id))
          setNewSubRegion("")
          
          // Hide success message after 3 seconds
          setTimeout(() => setSuccess({ ...success, subRegion: false }), 3000)
        } else {
          alert("Failed to add sub-region: " + response.data.error)
        }
      } catch (err) {
        console.error("Error adding sub-region:", err)
        if (err.response && err.response.data && err.response.data.error) {
          alert("Error: " + err.response.data.error)
        } else {
          alert("Failed to add sub-region")
        }
      }
    } else {
      alert("Please enter a sub-region name")
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return <div className="area-add-loading">Loading...</div>
  }

  if (error) {
    return <div className="area-add-error">Error: {error}</div>
  }

  return (
    <div className="area-add-wrapper">
      <div className="area-add-container">
        <div className="area-add-header">
         
        </div>
      
        <h3>Add New Region</h3>
        <br></br>
        <input 
          type="text" 
          className="area-add-input" 
          placeholder="Enter region name" 
          value={newRegion}
          onChange={(e) => setNewRegion(e.target.value)}
        />

        <button className="area-add-submit-button" onClick={handleAddRegion}>
          Add Region
        </button>

        {success.region && <div className="area-add-success-message">Region added successfully!</div>}

        <div className="area-add-section-divider"></div>
        <br></br>
        <h3>Add New Sub-Region</h3>
        <br></br>

        <div className="area-add-dropdown-container">
          <div className="area-add-dropdown">
            <div className="area-add-dropdown-header" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="area-add-dropdown-text">
                {selectedRegion ? selectedRegion.region : "Select Region"}
              </div>
              <div className="area-add-dropdown-arrow">▼</div>
            </div>

            {isDropdownOpen && (
              <div className="area-add-dropdown-options">
                {regions.map((region) => (
                  <div 
                    key={region.id} 
                    className="area-add-dropdown-option" 
                    onClick={() => handleRegionSelect(region)}
                  >
                    {region.region}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedRegion && (
            <div className="area-add-selected-text">Region: {selectedRegion.region}</div>
          )}
        </div>

        <input 
          type="text" 
          className="area-add-input" 
          placeholder="Enter sub-region name" 
          value={newSubRegion}
          onChange={(e) => setNewSubRegion(e.target.value)}
          disabled={!selectedRegion}
        />

        <button 
          className="area-add-submit-button" 
          onClick={handleAddSubRegion}
          disabled={!selectedRegion}
        >
          Add Sub-Region
        </button>

        {success.subRegion && <div className="area-add-success-message">Sub-region added successfully!</div>}
      </div>
    </div>
  )
}

export default AddArea

