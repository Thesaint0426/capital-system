const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// POST /api/apply — Public application submission
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('contact').trim().notEmpty().withMessage('Contact is required'),
  body('source_of_funds').notEmpty().withMessage('Source of funds is required'),
  body('understands_risk').isBoolean().withMessage('Risk acknowledgement required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, country, contact, source_of_funds, understands_risk } = req.body;

  if (!understands_risk || understands_risk === 'false' || understands_risk === false) {
    return res.status(400).json({ error: 'You must acknowledge the risks to apply' });
  }

  try {
    // Check for duplicate application
    const existing = await pool.query(
      "SELECT id FROM applications WHERE email=$1 AND status != 'rejected'", [email]
    );
    if (existing.rows.length) {
      return res.status(409).json({ error: 'An application with this email already exists' });
    }

    await pool.query(
      `INSERT INTO applications (name, email, country, contact, source_of_funds, understands_risk)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, country, contact, source_of_funds, understands_risk === true || understands_risk === 'true']
    );

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
