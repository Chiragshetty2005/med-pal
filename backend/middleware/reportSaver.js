/**
 * Report Saver Middleware
 * Intercepts successful JSON responses on analyze endpoints
 * and saves the report to reports.json WITHOUT modifying the
 * existing route handlers at all.
 */

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { readJSON, writeJSON, DATA_DIR } = require('../utils/fileStorage');

const REPORTS_PATH = path.join(DATA_DIR, 'reports.json');

/**
 * Saves a report to the JSON store.
 */
function saveReport(userId, type, inputData, result) {
  const report = {
    id: uuidv4(),
    userId: userId || 'anonymous',
    type,        // 'symptom' | 'image'
    inputData,
    result,
    createdAt: new Date().toISOString(),
  };

  const reports = readJSON(REPORTS_PATH);
  reports.push(report);
  writeJSON(REPORTS_PATH, reports);

  console.log(`[reportSaver] Saved report ${report.id} for user ${report.userId} (${type})`);
  return report;
}

/**
 * Express middleware factory for intercepting responses.
 * @param {'symptom'|'image'} reportType - The type of report
 * @param {Function} extractInputData - function(req) returning the input data to store
 */
function createReportSaver(reportType, extractInputData) {
  return (req, res, next) => {
    // Store a reference to the original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to intercept the response
    res.json = (body) => {
      // Only save on successful responses (not errors)
      if (res.statusCode >= 200 && res.statusCode < 300 && body && !body.error) {
        try {
          const userId = req.user?.id || 'anonymous';
          const inputData = extractInputData(req);
          saveReport(userId, reportType, inputData, body);
        } catch (err) {
          console.error('[reportSaver] Failed to save report:', err.message);
          // Don't block the response — report saving is best-effort
        }
      }

      // Call the original res.json to send the response as normal
      return originalJson(body);
    };

    next();
  };
}

/**
 * Middleware for the /analyze endpoint (symptom analysis)
 */
const saveSymptomReport = createReportSaver('symptom', (req) => ({
  symptoms: req.body.symptoms,
  age: req.body.age,
  gender: req.body.gender,
  history: req.body.history,
  hr: req.body.hr,
  bp: req.body.bp,
  spo2: req.body.spo2,
  temp: req.body.temp,
}));

/**
 * Middleware for the /api/analyze-image endpoint (image analysis)
 */
const saveImageReport = createReportSaver('image', (req) => ({
  scanType: req.body.scanType || 'xray',
  fileName: req.file?.originalname || 'unknown',
}));

module.exports = { saveReport, saveSymptomReport, saveImageReport };
