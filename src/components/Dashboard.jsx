import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, Paper, Typography, Select, MenuItem, FormControl, InputLabel, 
         Alert, CircularProgress, Tabs, Tab } from '@mui/material';

const Dashboard = () => {
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [subRegions, setSubRegions] = useState([]);
    const [selectedSubRegion, setSelectedSubRegion] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    // Base URL for API calls
    const API_BASE_URL = 'http://localhost:5000';
    
    // Helper function to get auth token
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Function to handle token expiration or invalid token
    const handleAuthError = (error) => {
        console.error('Authentication error:', error);
        setError('Your session has expired. Please log in again.');
        // Optionally redirect to login page
        // window.location.href = '/login';
    };

    useEffect(() => {
        const fetchCameras = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/cameras`, {
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`
                    }
                });
                console.log('Camera response:', response.data);
                
                if (response.data && Array.isArray(response.data)) {
                    setCameras(response.data);
                    
                    // Extract unique regions
                    const uniqueRegions = [...new Set(response.data.map(cam => cam.region_name))];
                    setRegions(uniqueRegions);
                    
                    if (uniqueRegions.length > 0) {
                        setSelectedRegion(uniqueRegions[0]);
                        
                        // Get sub-regions for the first region
                        const regionCameras = response.data.filter(cam => cam.region_name === uniqueRegions[0]);
                        const uniqueSubRegions = [...new Set(regionCameras.map(cam => cam.sub_region_name))];
                        setSubRegions(uniqueSubRegions);
                        
                        if (uniqueSubRegions.length > 0) {
                            setSelectedSubRegion(uniqueSubRegions[0]);
                            
                            // Select the first camera in this sub-region
                            const subRegionCameras = regionCameras.filter(cam => cam.sub_region_name === uniqueSubRegions[0]);
                            if (subRegionCameras.length > 0) {
                                setSelectedCamera(subRegionCameras[0].id.toString());
                            }
                        }
                    }
                } else {
                    setError('Invalid response format or no cameras available');
                }
            } catch (err) {
                console.error('Error fetching cameras:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    handleAuthError(err);
                } else {
                    setError('Failed to fetch cameras: ' + (err.message || 'Unknown error'));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCameras();
    }, []);

    const handleRegionChange = (event) => {
        const region = event.target.value;
        setSelectedRegion(region);
        
        // Update sub-regions based on selected region
        const regionCameras = cameras.filter(cam => cam.region_name === region);
        const uniqueSubRegions = [...new Set(regionCameras.map(cam => cam.sub_region_name))];
        setSubRegions(uniqueSubRegions);
        
        if (uniqueSubRegions.length > 0) {
            setSelectedSubRegion(uniqueSubRegions[0]);
            
            // Select the first camera in this sub-region
            const subRegionCameras = regionCameras.filter(cam => cam.sub_region_name === uniqueSubRegions[0]);
            if (subRegionCameras.length > 0) {
                setSelectedCamera(subRegionCameras[0].id.toString());
            }
        } else {
            setSelectedSubRegion('');
            setSelectedCamera('');
        }
    };

    const handleSubRegionChange = (event) => {
        const subRegion = event.target.value;
        setSelectedSubRegion(subRegion);
        
        // Update camera selection based on selected sub-region
        const filteredCameras = cameras.filter(
            cam => cam.region_name === selectedRegion && cam.sub_region_name === subRegion
        );
        
        if (filteredCameras.length > 0) {
            setSelectedCamera(filteredCameras[0].id.toString());
        } else {
            setSelectedCamera('');
        }
    };

    const handleCameraChange = (event) => {
        setSelectedCamera(event.target.value);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Get filtered cameras based on selections
    const getFilteredCameras = () => {
        if (!selectedRegion) return [];
        
        if (selectedSubRegion) {
            return cameras.filter(
                cam => cam.region_name === selectedRegion && cam.sub_region_name === selectedSubRegion
            );
        }
        
        return cameras.filter(cam => cam.region_name === selectedRegion);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    const filteredCameras = getFilteredCameras();

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Camera Dashboard
            </Typography>

            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Camera View" />
                <Tab label="Analytics" />
            </Tabs>

            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {/* Selection Controls */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                {/* Region Selection */}
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Region</InputLabel>
                                        <Select
                                            value={selectedRegion}
                                            label="Region"
                                            onChange={handleRegionChange}
                                        >
                                            {regions.map((region) => (
                                                <MenuItem key={region} value={region}>
                                                    {region}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                {/* Sub-Region Selection */}
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth disabled={!selectedRegion}>
                                        <InputLabel>Sub-Region</InputLabel>
                                        <Select
                                            value={selectedSubRegion}
                                            label="Sub-Region"
                                            onChange={handleSubRegionChange}
                                        >
                                            {subRegions.map((subRegion) => (
                                                <MenuItem key={subRegion} value={subRegion}>
                                                    {subRegion}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                {/* Camera Selection */}
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth disabled={!selectedSubRegion}>
                                        <InputLabel>Camera</InputLabel>
                                        <Select
                                            value={selectedCamera}
                                            label="Camera"
                                            onChange={handleCameraChange}
                                        >
                                            {filteredCameras.map((camera) => (
                                                <MenuItem key={camera.id} value={camera.id.toString()}>
                                                    {camera.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Video Feed */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            {selectedCamera ? (
                                <>
                                    <Typography variant="h6" gutterBottom>
                                        {cameras.find(cam => cam.id.toString() === selectedCamera)?.name || "Camera Feed"}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                        Region: {selectedRegion} | Sub-Region: {selectedSubRegion}
                                    </Typography>
                                    <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                                        <img
                                            src={`${API_BASE_URL}/video_feed/${selectedCamera}?token=${getAuthToken()}`}
                                            alt="Camera Feed"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                            onError={(e) => {
                                                console.error('Error loading video feed:', e);
                                                e.target.src = 'https://via.placeholder.com/640x360?text=Video+Feed+Unavailable';
                                            }}
                                        />
                                    </Box>
                                </>
                            ) : (
                                <Typography variant="body1" align="center">
                                    Please select a camera to view the feed
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {activeTab === 1 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6">Analytics Dashboard</Typography>
                            <Typography variant="body1" color="text.secondary">
                                Analytics features will be implemented in future updates.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default Dashboard; 