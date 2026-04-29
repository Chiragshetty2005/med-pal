/**
 * Reports Routes
 * GET /api/reports           - Get reports (role-based)
 * GET /api/reports/:id/download - Download report as PDF
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const { readJSON, DATA_DIR } = require('../utils/fileStorage');
const { requireAuth } = require('../middleware/auth');
const { generateReportPDF } = require('../utils/pdfGenerator');

const REPORTS_PATH = path.join(DATA_DIR, 'reports.json');
const USERS_PATH = path.join(DATA_DIR, 'users.json');

/**
 * GET /api/reports
 * Doctor: returns ALL reports
 * Patient: returns only their own reports
 */
router.get('/', requireAuth, (req, res) => {
  try {
    const reports = readJSON(REPORTS_PATH);
    const users = readJSON(USERS_PATH);

    let filtered;
    if (req.user.role === 'doctor') {
      // Doctors see all reports
      filtered = reports;
    } else {
      // Patients see only their own reports
      filtered = reports.filter(r => r.userId === req.user.id);
    }

    // Sort by date, newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Enrich with patient name
    const enriched = filtered.map(report => {
      const user = users.find(u => u.id === report.userId);
      return {
        ...report,
        patientName: user ? user.name : (report.userId === 'anonymous' ? 'Anonymous' : 'Unknown'),
      };
    });

    res.json({ reports: enriched, total: enriched.length });
  } catch (error) {
    console.error('[reports] Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * GET /api/reports/:id/download
 * Generates and streams a PDF report
 */
router.get('/:id/download', requireAuth, (req, res) => {
  try {
    const reports = readJSON(REPORTS_PATH);
    const users = readJSON(USERS_PATH);

    const report = reports.find(r => r.id === req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Access control: patients can only download their own reports
    if (req.user.role !== 'doctor' && report.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get patient name
    const patient = users.find(u => u.id === report.userId);
    const patientName = patient ? patient.name : (report.userId === 'anonymous' ? 'Anonymous Patient' : 'Unknown Patient');

    // Generate PDF
    const pdfDoc = generateReportPDF(report, patientName);

    // Set headers for PDF download
    const fileName = `MedPal_Report_${report.type}_${report.id.substring(0, 8)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Pipe the PDF stream to the response
    pdfDoc.pipe(res);
  } catch (error) {
    console.error('[reports] Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;
