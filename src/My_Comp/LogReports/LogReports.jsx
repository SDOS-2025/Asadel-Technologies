import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./LogReports.css"

const LogReports = () => {
    const [detections, setDetections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [filters, setFilters] = useState({
        region: '',
        sub_region: '',
        camera: '',
        alert_type: '',
        date: ''
    });

    const API_BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        const fetchDetections = async () => {
            try {
                setLoading(true);
                
                // Build query parameters for filtering
                const params = new URLSearchParams();
                if (filters.region) params.append('region', filters.region);
                if (filters.sub_region) params.append('sub_region', filters.sub_region);
                if (filters.camera) params.append('camera', filters.camera);
                if (filters.alert_type) params.append('alert_type', filters.alert_type);
                if (filters.date) params.append('date', filters.date);
                
                const url = `${API_BASE_URL}/api/detections${params.toString() ? '?' + params.toString() : ''}`;
                const response = await axios.get(url);
                setDetections(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch detections');
                setLoading(false);
                console.error('Error fetching detections:', err);
            }
        };

        // Fetch initially
        fetchDetections();

        // Set up polling every 5 seconds
        const interval = setInterval(fetchDetections, 50000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [filters]); // Re-fetch when filters change

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [filterType]: value };
            
            // Reset dependent filters when parent filter changes
            if (filterType === 'region' && value !== prev.region) {
                newFilters.sub_region = '';
                newFilters.camera = '';
            } else if (filterType === 'sub_region' && value !== prev.sub_region) {
                newFilters.camera = '';
            }
            
            return newFilters;
        });
    };

    const resetFilters = () => {
        setFilters({
            region: '',
            sub_region: '',
            camera: '',
            alert_type: '',
            date: ''
        });
    };

    const handleDownloadPdf = async () => {
        try {
            setDownloadingPdf(true);
            
            // Build query parameters for filtering
            const params = new URLSearchParams();
            if (filters.region) params.append('region', filters.region);
            if (filters.sub_region) params.append('sub_region', filters.sub_region);
            if (filters.camera) params.append('camera', filters.camera);
            if (filters.alert_type) params.append('alert_type', filters.alert_type);
            if (filters.date) params.append('date', filters.date);
            
            // Using axios to get the file with blob response type and filters
            const response = await axios({
                url: `${API_BASE_URL}/api/detections/download-pdf${params.toString() ? '?' + params.toString() : ''}`,
                method: 'GET',
                responseType: 'blob', // Important for receiving binary data
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Include filter information in filename if filters are applied
            let filename = 'fire_detection_logs';
            if (filters.region) filename += `_${filters.region}`;
            if (filters.alert_type) filename += `_${filters.alert_type}`;
            
            link.setAttribute('download', `${filename}.pdf`);
            
            // Append to html page
            document.body.appendChild(link);
            
            // Start download
            link.click();
            
            // Clean up and remove the link
            link.parentNode.removeChild(link);
            setDownloadingPdf(false);
        } catch (err) {
            console.error('Error downloading PDF:', err);
            setDownloadingPdf(false);
            alert('Failed to download PDF. Please try again.');
        }
    };

    // Get unique region names from detections
    const regions = [...new Set(detections.map(d => d.region_name))];
    
    // Get sub-regions based on selected region
    const subRegions = filters.region 
        ? [...new Set(detections
            .filter(d => d.region_name === filters.region)
            .map(d => d.sub_region_name))]
        : [];
    
    // Get cameras based on selected sub-region
    const cameras = filters.sub_region
        ? [...new Set(detections
            .filter(d => d.sub_region_name === filters.sub_region)
            .map(d => d.camera_name))]
        : [];
    
    // Get unique alert types
    const alertTypes = [...new Set(detections.map(d => d.alert_type))];
    
    // Get unique dates
    const dates = [...new Set(detections.map(d => d.date_created))];

    if (loading) {
        return <div className="log-reports">Loading detections...</div>;
    }

    if (error) {
        return <div className="log-reports">Error: {error}</div>;
    }

    return (
        <div className="log-reports">
            {/* Header */}

            {/* Filters */}
            <div className="container-fluid mt-3">
                <div className="row g-3">
                    {/* Camera Filter */}
                    <div className="col-md-4">
                        <div className="filter-card">
                            <h6 className="filter-title">
                                <i className="bi bi-camera"></i> Camera
                            </h6>
                            <select 
                                className="form-select mb-2"
                                value={filters.region}
                                onChange={(e) => handleFilterChange('region', e.target.value)}
                            >
                                <option value="">All Regions</option>
                                {regions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                            <select 
                                className="form-select mb-2"
                                value={filters.sub_region}
                                onChange={(e) => handleFilterChange('sub_region', e.target.value)}
                                disabled={!filters.region}
                            >
                                <option value="">All Sub-regions</option>
                                {subRegions.map(subRegion => (
                                    <option key={subRegion} value={subRegion}>{subRegion}</option>
                                ))}
                            </select>
                            <select 
                                className="form-select"
                                value={filters.camera}
                                onChange={(e) => handleFilterChange('camera', e.target.value)}
                                disabled={!filters.sub_region}
                            >
                                <option value="">All Cameras</option>
                                {cameras.map(camera => (
                                    <option key={camera} value={camera}>{camera}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Alert Filter */}
                    <div className="col-md-4">
                        <div className="filter-card">
                            <h6 className="filter-title">
                                <i className="bi bi-bell"></i> Alert
                            </h6>
                            <select 
                                className="form-select"
                                value={filters.alert_type}
                                onChange={(e) => handleFilterChange('alert_type', e.target.value)}
                            >
                                <option value="">All Alert Types</option>
                                {alertTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Time Filter */}
                    <div className="col-md-4">
                        <div className="filter-card">
                            <h6 className="filter-title">
                                <i className="bi bi-clock"></i> Time
                            </h6>
                            <select 
                                className="form-select"
                                value={filters.date}
                                onChange={(e) => handleFilterChange('date', e.target.value)}
                            >
                                <option value="">All Dates</option>
                                {dates.map(date => (
                                    <option key={date} value={date}>{date}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end mt-3 gap-2">
                    <button 
                        className="btn btn-secondary"
                        onClick={resetFilters}
                    >
                        Reset Filters
                    </button>
                    <button className="btn btn-secondary">View PDF</button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                    >
                        {downloadingPdf ? 'Generating PDF...' : 'Download Report'}
                    </button>
                </div>

                {/* Table */}
                <div className="table-responsive mt-3">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Region</th>
                                <th>Sub-region</th>
                                <th>Camera Name</th>
                                <th>Alert Type</th>
                                <th>Description</th>
                                <th>Time Stamp</th>
                                <th>Date Created</th>
                                <th>Snapshot</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detections.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center">No detection records found</td>
                                </tr>
                            ) : (
                                detections.map((detection) => (
                                    <tr key={detection.id}>
                                        <td>{detection.region_name}</td>
                                        <td>{detection.sub_region_name}</td>
                                        <td>{detection.camera_name}</td>
                                        <td>{detection.alert_type}</td>
                                        <td>{(detection.confidence * 100).toFixed(1)}%</td>
                                        <td>{detection.time_stamp}</td>
                                        <td>{detection.date_created}</td>
                                        <td>
                                            <div className="snapshot-placeholder">
                                                <i className="bi bi-image"></i>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="log-reports-pagination">
                    <button
                        className="log-reports-pagination-arrow"
                        onClick={() => {/* Handle previous page */}}
                        disabled={false} // Set to true for first page
                    >
                        &lt;
                    </button>
                    
                    {[1, 2, 3, 4].map(page => (
                        <button 
                            key={page}
                            className={`log-reports-pagination-number ${page === 1 ? 'active' : ''}`}
                            onClick={() => {/* Handle page change */}}
                        >
                            {page}
                        </button>
                    ))}
                    
                    <button
                        className="log-reports-pagination-arrow"
                        onClick={() => {/* Handle next page */}}
                        disabled={false} // Set to true for last page
                    >
                        &gt;
                    </button>
                </div>
            </div>

            {/* Footer */}
        </div>
    )
}

export default LogReports;
