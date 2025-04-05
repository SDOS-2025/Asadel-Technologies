const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('token');

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
};

// API service object
const api = {
  // Auth endpoints
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // User Management endpoints
  getUsers: async (page = 1) => {
    const response = await fetch(`${API_BASE_URL}/users?page=${page}`);
    return handleResponse(response);
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  getUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    return handleResponse(response);
  },

  createUser: async (userData) => {
    
    const formData = new FormData();
    
    // Append all user data to FormData
    Object.keys(userData).forEach(key => {
      if (key === 'profileImage' && userData[key]) {
        formData.append('profileImage', userData[key]);
      } else if (key === 'access_type') {
        // Handle access_type array
        formData.append(key, JSON.stringify(userData[key]));
      } else {
        formData.append(key, userData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: userData
    });
    return handleResponse(response);
  },

  // Camera Management endpoints
  getCameras: async (page = 1) => {
    const response = await fetch(`${API_BASE_URL}/cameras?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getCamera: async (cameraId) => {
    const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  createCamera: async (cameraData) => {
    const response = await fetch(`${API_BASE_URL}/cameras`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cameraData)
    });
    return handleResponse(response);
  },

  updateCamera: async (cameraId, cameraData) => {
    const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cameraData)
    });
    return handleResponse(response);
  },

  deleteCamera: async (cameraId) => {
    const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  updateCameraStatus: async (cameraId, status) => {
    const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  // Protected API calls
  getProtectedData: async (endpoint) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Area Management endpoints
  getRegions: async () => {
    const response = await fetch(`${API_BASE_URL}/regions`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getRegion: async (regionId) => {
    const response = await fetch(`${API_BASE_URL}/regions/${regionId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getRegionsList: async () => {
    const response = await fetch(`${API_BASE_URL}/regions-list`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  // Add more API methods as needed
};

export default api; 