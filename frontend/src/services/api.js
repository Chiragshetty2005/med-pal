// src/services/api.js
const API_URL = 'http://localhost:5000';

export async function analyzePatientData(data) {
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}
