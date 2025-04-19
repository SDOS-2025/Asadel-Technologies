import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./LogReports.css"

const LogReports = () => {
    const [detections, setDetections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const API_BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        const fetchDetections = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/detections`);
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
    }, []);

    const handleDownloadPdf = async () => {
        try {
            setDownloadingPdf(true);
            
            // Using axios to get the file with blob response type
            const response = await axios({
                url: `${API_BASE_URL}/api/detections/download-pdf`,
                method: 'GET',
                responseType: 'blob', // Important for receiving binary data
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'fire_detection_logs.pdf');
            
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
                            <select className="form-select mb-2">
                                <option>Region</option>
                                <option>Building A</option>
                            </select>
                            <select className="form-select mb-2">
                                <option>Sub-region</option>
                                <option>Entry 1</option>
                            </select>
                            <select className="form-select">
                                <option>Camera</option>
                                <option>Entry 1</option>
                            </select>
                        </div>
                    </div>

                    {/* Alert Filter */}
                    <div className="col-md-4">
                        <div className="filter-card">
                            <h6 className="filter-title">
                                <i className="bi bi-bell"></i> Alert
                            </h6>
                            <select className="form-select">
                                <option>Alert Type</option>
                                <option>Smoke</option>
                            </select>
                        </div>
                    </div>

                    {/* Time Filter */}
                    <div className="col-md-4">
                        <div className="filter-card">
                            <h6 className="filter-title">
                                <i className="bi bi-clock"></i> Time
                            </h6>
                            <select className="form-select">
                                <option>DATE</option>
                                <option>Today</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end mt-3 gap-2">
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
                            {detections.map((detection) => (
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
                            ))}
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
