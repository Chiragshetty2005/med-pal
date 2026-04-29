/**
 * PDF Report Generator
 * Creates premium-formatted medical reports using pdfkit.
 */

const PDFDocument = require('pdfkit');

/**
 * Generate a PDF report as a readable stream.
 * @param {Object} report - The report object from reports.json
 * @param {string} patientName - The patient's display name
 * @returns {PDFDocument} A readable stream of the PDF
 */
function generateReportPDF(report, patientName) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 60, bottom: 60, left: 50, right: 50 },
    info: {
      Title: `Medical Report — ${report.id}`,
      Author: 'Med-Pal AI Healthcare Assistant',
      Subject: `${report.type === 'symptom' ? 'Symptom Analysis' : 'Image Analysis'} Report`,
    },
  });

  const colors = {
    primary: '#4f46e5',    // indigo-600
    dark: '#1e1b4b',       // indigo-950
    text: '#1f2937',       // gray-800
    muted: '#6b7280',      // gray-500
    border: '#e5e7eb',     // gray-200
    emergency: '#dc2626',  // red-600
    warning: '#d97706',    // amber-600
    safe: '#059669',       // emerald-600
    bgLight: '#f5f3ff',    // violet-50
  };

  // ── Header Band ──
  doc.rect(0, 0, doc.page.width, 100).fill(colors.dark);
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#ffffff')
    .text('MED_PAL', 50, 30, { continued: true })
    .fontSize(24).fillColor('#818cf8')
    .text('_', { continued: false });
  doc.fontSize(9).font('Helvetica').fillColor('#a5b4fc')
    .text('Intelligent Healthcare Assistant', 50, 58);
  doc.fontSize(8).fillColor('#c7d2fe')
    .text(`Report ID: ${report.id}`, 50, 75);

  // Date on the right side of header
  const dateStr = new Date(report.createdAt).toLocaleString('en-US', {
    dateStyle: 'long', timeStyle: 'short',
  });
  doc.fontSize(9).fillColor('#c7d2fe')
    .text(dateStr, 350, 75, { align: 'right' });

  let y = 120;

  // ── Patient Info Section ──
  doc.roundedRect(50, y, doc.page.width - 100, 60, 4)
    .fill(colors.bgLight);
  y += 15;
  doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primary)
    .text('PATIENT INFORMATION', 65, y);
  y += 18;
  doc.fontSize(10).font('Helvetica').fillColor(colors.text)
    .text(`Name: ${patientName}`, 65, y, { continued: true })
    .text(`     |     Report Type: ${report.type === 'symptom' ? 'Symptom Analysis' : 'Medical Image Analysis'}`, { continued: false });
  y += 40;

  // ── Severity Badge ──
  const severity = report.result?.Severity || report.result?.severity || 'N/A';
  const severityColor = severity === 'Emergency' || severity === 'High'
    ? colors.emergency : severity === 'Warning' || severity === 'Medium'
    ? colors.warning : colors.safe;

  doc.roundedRect(50, y, 150, 30, 4).fill(severityColor);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff')
    .text(`Severity: ${severity}`, 60, y + 8);

  // Risk Score (for symptom reports)
  if (report.result?.RiskScore !== undefined) {
    doc.roundedRect(210, y, 120, 30, 4).fill(colors.primary);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff')
      .text(`Risk: ${report.result.RiskScore}/100`, 220, y + 8);
  }

  // Confidence (for image reports)
  if (report.result?.confidence !== undefined) {
    const confX = report.result?.RiskScore !== undefined ? 340 : 210;
    doc.roundedRect(confX, y, 140, 30, 4).fill(colors.primary);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff')
      .text(`Confidence: ${(report.result.confidence * 100).toFixed(1)}%`, confX + 10, y + 8);
  }

  y += 50;

  // ── Input Data Section ──
  doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.primary)
    .text('INPUT DATA', 50, y);
  y += 5;
  doc.moveTo(50, y + 12).lineTo(doc.page.width - 50, y + 12).stroke(colors.border);
  y += 20;

  const inputData = report.inputData || {};
  if (report.type === 'symptom') {
    const fields = [
      ['Symptoms', inputData.symptoms],
      ['Age', inputData.age],
      ['Gender', inputData.gender],
      ['Medical History', inputData.history],
      ['Heart Rate', inputData.hr ? `${inputData.hr} bpm` : null],
      ['Blood Pressure', inputData.bp],
      ['SpO2', inputData.spo2 ? `${inputData.spo2}%` : null],
      ['Temperature', inputData.temp ? `${inputData.temp}°F` : null],
    ];
    for (const [label, value] of fields) {
      if (value) {
        doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.muted)
          .text(`${label}:`, 55, y, { continued: true })
          .font('Helvetica').fillColor(colors.text)
          .text(`  ${value}`, { continued: false });
        y += 16;
      }
    }
  } else {
    doc.fontSize(9).font('Helvetica').fillColor(colors.text)
      .text(`Scan Type: ${inputData.scanType || 'N/A'}`, 55, y);
    y += 16;
    if (inputData.fileName) {
      doc.text(`File: ${inputData.fileName}`, 55, y);
      y += 16;
    }
  }

  y += 15;

  // ── AI Results Section ──
  doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.primary)
    .text('AI ANALYSIS RESULTS', 50, y);
  y += 5;
  doc.moveTo(50, y + 12).lineTo(doc.page.width - 50, y + 12).stroke(colors.border);
  y += 20;

  const result = report.result || {};

  // For symptom reports
  if (result.Explanation) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.muted).text('Diagnostic Reasoning:', 55, y);
    y += 14;
    doc.fontSize(9).font('Helvetica').fillColor(colors.text)
      .text(result.Explanation, 55, y, { width: doc.page.width - 120, lineGap: 3 });
    y = doc.y + 15;
  }

  // For image reports
  if (result.prediction) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.muted).text('Prediction:', 55, y);
    y += 14;
    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.text).text(result.prediction, 55, y);
    y += 20;
  }
  if (result.explanation) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.muted).text('Explanation:', 55, y);
    y += 14;
    doc.fontSize(9).font('Helvetica').fillColor(colors.text)
      .text(result.explanation, 55, y, { width: doc.page.width - 120, lineGap: 3 });
    y = doc.y + 15;
  }

  // Possible Conditions
  if (result.PossibleConditions?.length) {
    // Check if we need a new page
    if (y > doc.page.height - 200) {
      doc.addPage();
      y = 60;
    }
    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.muted).text('Possible Conditions:', 55, y);
    y += 14;
    for (const cond of result.PossibleConditions) {
      doc.fontSize(9).font('Helvetica').fillColor(colors.text).text(`•  ${cond}`, 60, y);
      y += 14;
    }
    y += 8;
  }

  // Recommendations / Next Steps
  const recs = result.Recommendations || result.next_steps || [];
  if (recs.length) {
    if (y > doc.page.height - 200) {
      doc.addPage();
      y = 60;
    }
    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.muted).text('Recommendations:', 55, y);
    y += 14;
    recs.forEach((rec, i) => {
      doc.fontSize(9).font('Helvetica').fillColor(colors.text).text(`${i + 1}.  ${rec}`, 60, y, { width: doc.page.width - 130 });
      y = doc.y + 6;
    });
  }

  // ── Footer ──
  const footerY = doc.page.height - 40;
  doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).stroke(colors.border);
  doc.fontSize(7).font('Helvetica').fillColor(colors.muted)
    .text(
      'This report was generated by Med-Pal AI Healthcare Assistant. It is intended for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional.',
      50, footerY + 8,
      { width: doc.page.width - 100, align: 'center' }
    );

  doc.end();
  return doc;
}

module.exports = { generateReportPDF };
