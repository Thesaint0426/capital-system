const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// All investor routes require authentication
router.use(authenticateToken);

// GET /api/investor/account
router.get('/account', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.id,
        a.initial_deposit,
        a.current_balance,
        a.created_at,
        u.name,
        u.email,
        (a.current_balance - a.initial_deposit) AS total_profit
       FROM accounts a
       JOIN users u ON u.id = a.user_id
       WHERE a.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found. Please contact admin.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Account fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/investor/cycles
router.get('/cycles', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, amount, start_date, end_date, status, result_amount, profit_loss, notes, created_at, closed_at
       FROM investment_cycles
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const activeCycle = result.rows.find(c => c.status === 'active') || null;
    const completedCycles = result.rows.filter(c => c.status === 'completed');
    const lastCycle = completedCycles[0] || null;

    res.json({
      activeCycle,
      lastCycle,
      allCycles: result.rows,
      completedCycles,
    });
  } catch (err) {
    console.error('Cycles fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/investor/withdraw
router.post('/withdraw', [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount } = req.body;

  try {
    // Check account exists and has sufficient balance
    const accountResult = await pool.query(
      'SELECT current_balance FROM accounts WHERE user_id = $1',
      [req.user.id]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const { current_balance } = accountResult.rows[0];

    if (parseFloat(amount) > parseFloat(current_balance)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check no active cycle
    const activeCycle = await pool.query(
      "SELECT id FROM investment_cycles WHERE user_id = $1 AND status = 'active'",
      [req.user.id]
    );

    if (activeCycle.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot withdraw while an investment cycle is active' });
    }

    // Check no pending withdrawal
    const pendingWithdrawal = await pool.query(
      "SELECT id FROM withdrawals WHERE user_id = $1 AND status = 'pending'",
      [req.user.id]
    );

    if (pendingWithdrawal.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a pending withdrawal request' });
    }

    const fee = parseFloat((amount * 0.005).toFixed(2)); // 0.5% fee
    const net_amount = parseFloat((amount - fee).toFixed(2));

    const result = await pool.query(
      `INSERT INTO withdrawals (user_id, amount, fee, net_amount, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [req.user.id, amount, fee, net_amount]
    );

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: result.rows[0]
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/investor/withdrawals
router.get('/withdrawals', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY requested_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Withdrawals fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
