/**
 * File-Based JSON Storage Utility
 * Safe read/write with auto-directory creation and pretty formatting.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * Ensure the data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Read a JSON file safely.
 * Returns an empty array if file doesn't exist or is corrupted.
 */
function readJSON(filePath) {
  ensureDataDir();
  const fullPath = path.resolve(filePath);
  try {
    if (!fs.existsSync(fullPath)) {
      return [];
    }
    const raw = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[fileStorage] Error reading ${fullPath}:`, err.message);
    return [];
  }
}

/**
 * Write data to a JSON file with pretty formatting.
 * Uses write-to-temp-then-rename pattern to prevent corruption.
 */
function writeJSON(filePath, data) {
  ensureDataDir();
  const fullPath = path.resolve(filePath);
  const tempPath = fullPath + '.tmp';
  try {
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, json, 'utf-8');
    fs.renameSync(tempPath, fullPath);
  } catch (err) {
    console.error(`[fileStorage] Error writing ${fullPath}:`, err.message);
    // Clean up temp file if it exists
    try { fs.unlinkSync(tempPath); } catch (_) {}
    throw err;
  }
}

module.exports = { readJSON, writeJSON, DATA_DIR };
