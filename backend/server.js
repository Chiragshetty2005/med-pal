const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── New: Auth & Report middleware imports ──
const { optionalAuth } = require('./middleware/auth');
const { saveSymptomReport, saveImageReport } = require('./middleware/reportSaver');

// ── New: Auth & Report routes ──
const authRoute = require('./routes/auth');
const reportsRoute = require('./routes/reports');
app.use('/api/auth', authRoute);
app.use('/api/reports', reportsRoute);

// ── Existing Routes (UNTOUCHED handlers) ──
// optionalAuth: attaches req.user if logged in, doesn't block if not
// reportSaver: intercepts res.json to auto-save reports after handler runs
const analyzeRoute = require('./routes/analyze');
const imageRoute = require('./routes/image');
app.use('/analyze', optionalAuth, saveSymptomReport, analyzeRoute);
app.use('/api/analyze-image', optionalAuth, saveImageReport, imageRoute);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
