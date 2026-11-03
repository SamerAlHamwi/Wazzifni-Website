const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Cv = require('../models/Cv');
// Reading saved CVs is for admins only: the same login as the HR admin (token in wz_token)
const { protect, can } = require('../hr/middleware/authMiddleware');

const UPLOADS_DIR = path.join(__dirname, '../uploads/cvs');

// Submit / Save CV and PDF to MongoDB and disk
router.post('/submit', async (req, res) => {
  try {
    const { clientId, language, template, pages, cv, photo, pdfData } = req.body;

    // clientId becomes part of the PDF file name on disk, so only allow a plain id (no path characters)
    if (!clientId || typeof clientId !== 'string' || !/^[A-Za-z0-9-]{1,64}$/.test(clientId)) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    const cvFields = cv || {};
    let pdfBuffer = null;
    let pdfUrl = '';

    // Convert base64 PDF data to Buffer if provided
    if (pdfData && typeof pdfData === 'string') {
      // jsPDF data URIs look like "data:application/pdf;filename=generated.pdf;base64,..."
      const base64Data = pdfData.replace(/^data:application\/pdf[^,]*,/, '');
      pdfBuffer = Buffer.from(base64Data, 'base64');

      // Attempt to save a copy on disk under uploads/cvs/ (optional fallback)
      try {
        if (!fs.existsSync(UPLOADS_DIR)) {
          fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }
        const filename = `cv-${clientId}-${Date.now()}.pdf`;
        const filePath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filePath, pdfBuffer);
        pdfUrl = `/uploads/cvs/${filename}`;
      } catch (fsErr) {
        console.warn('Could not write PDF to disk, storing exclusively in MongoDB:', fsErr.message);
      }
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
      if (!pdfUrl) {
        pdfUrl = `/api/cv/${cvDoc._id}/pdf`;
      }
      cvDoc.pdfUrl = pdfUrl;
    }

    await cvDoc.save();

    res.status(200).json({
      success: true,
      message: 'CV and PDF saved successfully to database',
      cvId: cvDoc._id,
      pdfUrl: `/api/cv/${cvDoc._id}/pdf`
    });
  } catch (error) {
    console.error('Error saving CV to DB:', error);
    res.status(500).json({ error: 'Failed to save CV to database', details: error.message });
  }
});

// Stream/Download PDF by CV ID directly from MongoDB (?download=1 saves it instead of showing it)
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const cvDoc = await Cv.findById(req.params.id);
    if (!cvDoc || !cvDoc.pdfFile || !cvDoc.pdfFile.data) {
      return res.status(404).json({ error: 'PDF file not found in database' });
    }

    const fileName = `cv-${cvDoc.name || 'document'}.pdf`;
    res.set({
      'Content-Type': cvDoc.pdfFile.contentType || 'application/pdf',
      'Content-Length': cvDoc.pdfFile.data.length,
      'Content-Disposition': `${req.query.download ? 'attachment' : 'inline'}; filename="cv.pdf"; filename*=UTF-8''${encodeURIComponent(fileName)}`
    });

    res.send(cvDoc.pdfFile.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve PDF from database' });
  }
});

// Get single CV by ID
router.get('/:id', protect, async (req, res) => {
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

// List saved CVs, newest first: ?q= searches name, title, phone, email and city; ?page= (50 per page)
router.get('/', protect, async (req, res) => {
  try {
    const limit = 50;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const q = String(req.query.q || '').trim();
    const filter = {};
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = ['name', 'title', 'phone', 'email', 'city'].map(k => ({ [k]: rx }));
    }
    const [cvs, total] = await Promise.all([
      Cv.find(filter).select('-pdfFile.data -photo -cvData').sort({ submittedAt: -1 })
        .skip((page - 1) * limit).limit(limit),
      Cv.countDocuments(filter)
    ]);
    res.json({ cvs, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list CVs' });
  }
});

// Delete a CV: the database record and every PDF copy of it on disk (one file is written per download)
router.delete('/:id', protect, can('del'), async (req, res) => {
  try {
    const cvDoc = await Cv.findById(req.params.id).select('clientId');
    if (!cvDoc) {
      return res.status(404).json({ error: 'CV not found' });
    }

    let filesDeleted = 0;
    const prefix = `cv-${cvDoc.clientId}-`;
    try {
      const files = fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR) : [];
      for (const f of files) {
        if (f.startsWith(prefix) && f.endsWith('.pdf')) {
          fs.unlinkSync(path.join(UPLOADS_DIR, f));
          filesDeleted++;
        }
      }
    } catch (fsErr) {
      console.error('Could not delete CV PDF files from disk:', fsErr.message);
      return res.status(500).json({ error: 'Failed to delete the CV PDF files' });
    }

    await Cv.deleteOne({ _id: cvDoc._id });
    res.json({ success: true, filesDeleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete CV' });
  }
});

module.exports = router;
