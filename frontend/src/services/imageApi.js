// src/services/imageApi.js
const API_URL = 'http://localhost:5000';

/**
 * Send a medical image to the backend for analysis.
 * @param {File} file - The image file
 * @param {string} scanType - One of 'xray', 'mri', 'ct'
 * @param {string|null} token - Optional JWT token for authenticated requests
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeImage(file, scanType = 'xray', token = null) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('scanType', scanType);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/analyze-image`, {
    method: 'POST',
    headers,
    body: formData,
    // Note: Don't set Content-Type header — browser sets it with boundary for FormData
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error || `API error: ${response.status}`);
  }

  return response.json();
}
