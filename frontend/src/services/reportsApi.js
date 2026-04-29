// src/services/reportsApi.js
const API_URL = 'http://localhost:5000';

export async function getReports(token) {
  const response = await fetch(`${API_URL}/api/reports`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch reports');
  }
  return data; // { reports, total }
}

export async function downloadReport(reportId, token) {
  const response = await fetch(`${API_URL}/api/reports/${reportId}/download`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to download report');
  }

  // Convert to blob and trigger download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MedPal_Report_${reportId.substring(0, 8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
