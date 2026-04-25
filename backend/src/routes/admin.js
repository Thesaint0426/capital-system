const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken, requireAdmin);

// GET /api/admin/users — List all investors
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.role, u.created_at,
        a.current_balance, a.initial_deposit,
        (a.current_balance - a.initial_deposit) AS total_profit,
        (SELECT COUNT(*) FROM investment_cycles ic WHERE ic.user_id = u.id AND ic.status = 'active') AS active_cycles,
        (SELECT COUNT(*) FROM withdrawals w WHERE w.user_id = u.id AND w.status = 'pending') AS pending_withdrawals
       FROM users u
       LEFT JOIN accounts a ON a.user_id = u.id
       WHERE u.role = 'investor'
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/account — Create account for user
router.post('/account', [
  body('user_id').isInt({ gt: 0 }).withMessage('Valid user_id required'),
  body('initial_deposit').isFloat({ gt: 0 }).withMessage('Initial deposit must be greater than 0'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user_id, initial_deposit } = req.body;

  try {
    const existing = await pool.query('SELECT id FROM accounts WHERE user_id = $1', [user_id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Account already exists for this user' });
    }

    const result = await pool.query(
      `INSERT INTO accounts (user_id, initial_deposit, current_balance)
       VALUES ($1, $2, $2) RETURNING *`,
      [user_id, initial_deposit]
    );

    res.status(201).json({
      message: 'Account created successfully',
      account: result.rows[0]
    });
  } catch (err) {
    console.error('Create account error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/cycle — Start a new investment cycle
router.post('/cycle', [
  body('user_id').isInt({ gt: 0 }).withMessage('Valid user_id required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user_id, amount, notes } = req.body;

  try {
    // Check no active cycle for this user
    const activeCycle = await pool.query(
      "SELECT id FROM investment_cycles WHERE user_id = $1 AND status = 'active'",
      [user_id]
    );

    if (activeCycle.rows.length > 0) {
      return res.status(400).json({ error: 'User already has an active investment cycle' });
    }

    // Check account has enough balance
    const account = await pool.query(
      'SELECT current_balance FROM accounts WHERE user_id = $1',
      [user_id]
    );

    if (account.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    if (parseFloat(amount) > parseFloat(account.rows[0].current_balance)) {
      return res.status(400).json({ error: 'Insufficient account balance for this cycle' });
    }

    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setDate(end_date.getDate() + 30);

    const result = await pool.query(
      `INSERT INTO investment_cycles (user_id, amount, start_date, end_date, status, notes)
       VALUES ($1, $2, $3, $4, 'active', $5) RETURNING *`,
      [user_id, amount, start_date, end_date, notes || null]
    );

    res.status(201).json({
      message: 'Investment cycle started successfully',
      cycle: result.rows[0]
    });
  } catch (err) {
    console.error('Start cycle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/close-cycle — Close a cycle and record result
router.post('/close-cycle', [
  body('cycle_id').isInt({ gt: 0 }).withMessage('Valid cycle_id required'),
  body('result_amount').isFloat({ gt: 0 }).withMessage('Result amount must be greater than 0'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { cycle_id, result_amount, notes } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const cycleResult = await client.query(
      "SELECT * FROM investment_cycles WHERE id = $1 AND status = 'active'",
      [cycle_id]
    );

    if (cycleResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Active cycle not found' });
    }

    const cycle = cycleResult.rows[0];
    const profit_loss = parseFloat(result_amount) - parseFloat(cycle.amount);

    // Update cycle
    await client.query(
      `UPDATE investment_cycles 
       SET status = 'completed', result_amount = $1, profit_loss = $2, closed_at = NOW(), notes = COALESCE($3, notes)
       WHERE id = $4`,
      [result_amount, profit_loss, notes || null, cycle_id]
    );

    // Update account balance — replace cycle amount with result_amount
    await client.query(
      `UPDATE accounts 
       SET current_balance = current_balance - $1 + $2, updated_at = NOW()
       WHERE user_id = $3`,
      [cycle.amount, result_amount, cycle.user_id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Cycle closed successfully',
      cycle_id,
      profit_loss,
      result_amount
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Close cycle error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// GET /api/admin/withdrawals — List all withdrawal requests
router.get('/withdrawals', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        w.*,
        u.name AS user_name,
        u.email AS user_email
       FROM withdrawals w
       JOIN users u ON u.id = w.user_id
       ORDER BY w.requested_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Admin withdrawals error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/withdrawal/:id/approve
router.post('/withdrawal/:id/approve', [
  param('id').isInt({ gt: 0 }),
], async (req, res) => {
  const { id } = req.params;
  const { admin_note } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const wResult = await client.query(
      "SELECT * FROM withdrawals WHERE id = $1 AND status = 'pending'",
      [id]
    );

    if (wResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pending withdrawal not found' });
    }

    const withdrawal = wResult.rows[0];

    // Deduct from balance
    await client.query(
      'UPDATE accounts SET current_balance = current_balance - $1, updated_at = NOW() WHERE user_id = $2',
      [withdrawal.amount, withdrawal.user_id]
    );

    // Update withdrawal status
    await client.query(
      "UPDATE withdrawals SET status = 'approved', processed_at = NOW(), admin_note = $1 WHERE id = $2",
      [admin_note || null, id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Withdrawal approved successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Approve withdrawal error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// POST /api/admin/withdrawal/:id/reject
router.post('/withdrawal/:id/reject', [
  param('id').isInt({ gt: 0 }),
], async (req, res) => {
  const { id } = req.params;
  const { admin_note } = req.body;

  try {
    const result = await pool.query(
      "UPDATE withdrawals SET status = 'rejected', processed_at = NOW(), admin_note = $1 WHERE id = $2 AND status = 'pending' RETURNING *",
      [admin_note || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pending withdrawal not found' });
    }

    res.json({ message: 'Withdrawal rejected', withdrawal: result.rows[0] });
  } catch (err) {
    console.error('Reject withdrawal error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/cycles — All cycles
router.get('/cycles', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        ic.*,
        u.name AS user_name,
        u.email AS user_email
       FROM investment_cycles ic
       JOIN users u ON u.id = ic.user_id
       ORDER BY ic.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Admin cycles error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
