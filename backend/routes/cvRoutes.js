const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Cv = require('../models/Cv');

// Submit / Save CV and PDF to MongoDB and disk
router.post('/submit', async (req, res) => {
  try {
    const { clientId, language, template, pages, cv, photo, pdfData } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    const cvFields = cv || {};
    let pdfBuffer = null;
    let pdfUrl = '';

    // Convert base64 PDF data to Buffer if provided
    if (pdfData && typeof pdfData === 'string') {
      const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, '');
      pdfBuffer = Buffer.from(base64Data, 'base64');

      // Save a copy on disk under uploads/cvs/
      const uploadsDir = path.join(__dirname, '../uploads/cvs');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `cv-${clientId}-${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, pdfBuffer);
      pdfUrl = `/uploads/cvs/${filename}`;
    }

    // Find existing document for this device/clientId or create new
    let cvDoc = await Cv.findOne({ clientId });
    if (!cvDoc) {
      cvDoc = new Cv({ clientId });
    }

    cvDoc.language = language || 'ar';
    cvDoc.template = template || 'bold';
    cvDoc.pages = pages || 1;
    cvDoc.name = cvFields.name || '';
    cvDoc.title = cvFields.title || '';
    cvDoc.email = cvFields.email || '';
    cvDoc.phone = cvFields.phone || '';
    cvDoc.city = cvFields.city || '';
    cvDoc.photo = photo || null;
    cvDoc.cvData = cvFields;
    cvDoc.submittedAt = new Date();

    if (pdfBuffer) {
      cvDoc.pdfFile = {
        data: pdfBuffer,
        contentType: 'application/pdf',
        size: pdfBuffer.length
      };
      cvDoc.pdfUrl = pdfUrl;
    }

    await cvDoc.save();

    res.status(200).json({
      success: true,
      message: 'CV and PDF saved successfully to database',
      cvId: cvDoc._id,
      pdfUrl: cvDoc.pdfUrl
    });
  } catch (error) {
    console.error('Error saving CV to DB:', error);
    res.status(500).json({ error: 'Failed to save CV to database', details: error.message });
  }
});

// Stream/Download PDF by CV ID directly from MongoDB
router.get('/:id/pdf', async (req, res) => {
  try {
    const cvDoc = await Cv.findById(req.params.id);
    if (!cvDoc || !cvDoc.pdfFile || !cvDoc.pdfFile.data) {
      return res.status(404).json({ error: 'PDF file not found in database' });
    }

    res.set({
      'Content-Type': cvDoc.pdfFile.contentType || 'application/pdf',
      'Content-Length': cvDoc.pdfFile.data.length,
      'Content-Disposition': `inline; filename="cv-${cvDoc.name || 'document'}.pdf"`
    });

    res.send(cvDoc.pdfFile.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve PDF from database' });
  }
});

// Get single CV by ID
router.get('/:id', async (req, res) => {
  try {
    const cvDoc = await Cv.findById(req.params.id).select('-pdfFile.data');
    if (!cvDoc) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json(cvDoc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve CV' });
  }
});

// List all saved CVs
router.get('/', async (req, res) => {
  try {
    const cvs = await Cv.find().select('-pdfFile.data').sort({ updatedAt: -1 }).limit(100);
    res.json(cvs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list CVs' });
  }
});

module.exports = router;
