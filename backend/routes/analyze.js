const express = require('express');
const router = express.Router();
const llmService = require('../services/llm');

router.post('/', async (req, res) => {
  try {
    const { symptoms, age, gender, history, hr, bp, spo2, temp } = req.body;
    console.log('[/analyze] Received:', { symptoms, age, gender, history, hr, bp, spo2, temp });
    
    // Process input using LLM mock
    const analysisResult = await llmService.analyzePatient({
      symptoms, age, gender, history, hr, bp, spo2, temp
    });

    res.json(analysisResult);
  } catch (error) {
    console.error('Error in analyze route:', error);
    res.status(500).json({ error: 'Failed to analyze patient data.' });
  }
});

module.exports = router;
