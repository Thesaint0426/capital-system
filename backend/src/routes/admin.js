const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.use(authenticateToken, requireAdmin);

// ── USERS ──

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.status, u.admin_note, u.created_at,
             a.current_balance, a.initial_deposit,
             (a.current_balance - a.initial_deposit) AS total_profit,
             (SELECT COUNT(*) FROM investment_cycles ic WHERE ic.user_id = u.id AND ic.status = 'active') AS active_cycles,
             (SELECT COUNT(*) FROM withdrawals w WHERE w.user_id = u.id AND w.status = 'pending') AS pending_withdrawals
      FROM users u LEFT JOIN accounts a ON a.user_id = u.id
      WHERE u.role = 'investor' ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/users - create investor directly
router.post('/users', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, admin_note } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, admin_note) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hash, 'investor', admin_note || null]
    );
    res.status(201).json({ message: 'Investor created', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/users/:id - update note or status
router.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { admin_note, status } = req.body;
  try {
    const fields = [];
    const vals = [];
    if (admin_note !== undefined) { fields.push(`admin_note=$${fields.length+1}`); vals.push(admin_note); }
    if (status !== undefined) { fields.push(`status=$${fields.length+1}`); vals.push(status); }
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
    vals.push(id);
    const result = await pool.query(`UPDATE users SET ${fields.join(',')} WHERE id=$${vals.length} AND role='investor' RETURNING id,name,email,status,admin_note`, vals);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Updated', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/account
router.post('/account', [
  body('user_id').isInt({ gt: 0 }),
  body('initial_deposit').isFloat({ gt: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { user_id, initial_deposit } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM accounts WHERE user_id = $1', [user_id]);
    if (existing.rows.length) return res.status(409).json({ error: 'Account already exists' });

    const result = await pool.query(
      'INSERT INTO accounts (user_id, initial_deposit, current_balance) VALUES ($1, $2, $2) RETURNING *',
      [user_id, initial_deposit]
    );
    res.status(201).json({ message: 'Account activated', account: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/account/:id/credit - add funds to existing account
router.post('/account/:user_id/credit', [
  body('amount').isFloat({ gt: 0 }),
], async (req, res) => {
  const { user_id } = req.params;
  const { amount, note } = req.body;
  try {
    const result = await pool.query(
      'UPDATE accounts SET current_balance=current_balance+$1, updated_at=NOW() WHERE user_id=$2 RETURNING *',
      [amount, user_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Account not found' });
    res.json({ message: 'Balance updated', account: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── CYCLES ──

// GET /api/admin/cycles
router.get('/cycles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ic.*, u.name AS user_name, u.email AS user_email
      FROM investment_cycles ic JOIN users u ON u.id = ic.user_id
      ORDER BY ic.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/cycle
router.post('/cycle', [
  body('user_id').isInt({ gt: 0 }),
  body('amount').isFloat({ gt: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { user_id, amount, notes } = req.body;
  try {
    const activeCycle = await pool.query(
      "SELECT id FROM investment_cycles WHERE user_id = $1 AND status = 'active'", [user_id]
    );
    if (activeCycle.rows.length) return res.status(400).json({ error: 'Member already has an active cycle' });

    const account = await pool.query('SELECT current_balance FROM accounts WHERE user_id = $1', [user_id]);
    if (!account.rows.length) return res.status(404).json({ error: 'Member account not found' });
    if (parseFloat(amount) > parseFloat(account.rows[0].current_balance)) {
      return res.status(400).json({ error: 'Insufficient account balance' });
    }

    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setDate(end_date.getDate() + 30);

    const result = await pool.query(
      `INSERT INTO investment_cycles (user_id, amount, start_date, end_date, status, notes)
       VALUES ($1, $2, $3, $4, 'active', $5) RETURNING *`,
      [user_id, amount, start_date, end_date, notes || null]
    );
    res.status(201).json({ message: 'Cycle started', cycle: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/close-cycle
router.post('/close-cycle', [
  body('cycle_id').isInt({ gt: 0 }),
  body('result_amount').isFloat({ gt: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { cycle_id, result_amount, notes } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cycleResult = await client.query(
      "SELECT * FROM investment_cycles WHERE id = $1 AND status = 'active'", [cycle_id]
    );
    if (!cycleResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Active cycle not found' });
    }
    const cycle = cycleResult.rows[0];
    const profit_loss = parseFloat(result_amount) - parseFloat(cycle.amount);

    await client.query(
      `UPDATE investment_cycles SET status='completed', result_amount=$1, profit_loss=$2, closed_at=NOW(), notes=COALESCE($3,notes) WHERE id=$4`,
      [result_amount, profit_loss, notes || null, cycle_id]
    );
    await client.query(
      `UPDATE accounts SET current_balance=current_balance-$1+$2, updated_at=NOW() WHERE user_id=$3`,
      [cycle.amount, result_amount, cycle.user_id]
    );
    await client.query('COMMIT');
    res.json({ message: 'Cycle closed', cycle_id, profit_loss, result_amount });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// ── WITHDRAWALS ──

// GET /api/admin/withdrawals
router.get('/withdrawals', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, u.name AS user_name, u.email AS user_email
      FROM withdrawals w JOIN users u ON u.id = w.user_id
      ORDER BY w.requested_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/withdrawal/:id/approve
router.post('/withdrawal/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { admin_note } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const wResult = await client.query("SELECT * FROM withdrawals WHERE id=$1 AND status='pending'", [id]);
    if (!wResult.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Pending withdrawal not found' }); }
    const w = wResult.rows[0];
    await client.query('UPDATE accounts SET current_balance=current_balance-$1, updated_at=NOW() WHERE user_id=$2', [w.amount, w.user_id]);
    await client.query("UPDATE withdrawals SET status='approved', processed_at=NOW(), admin_note=$1 WHERE id=$2", [admin_note || null, id]);
    await client.query('COMMIT');
    res.json({ message: 'Withdrawal approved' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// POST /api/admin/withdrawal/:id/reject
router.post('/withdrawal/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { admin_note } = req.body;
  try {
    const result = await pool.query(
      "UPDATE withdrawals SET status='rejected', processed_at=NOW(), admin_note=$1 WHERE id=$2 AND status='pending' RETURNING *",
      [admin_note || null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Pending withdrawal not found' });
    res.json({ message: 'Withdrawal rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/withdrawal/:id/paid - mark as paid after bank/crypto transfer
router.post('/withdrawal/:id/paid', async (req, res) => {
  const { id } = req.params;
  const { admin_note } = req.body;
  try {
    const result = await pool.query(
      "UPDATE withdrawals SET status='paid', paid_at=NOW(), admin_note=COALESCE($1,admin_note) WHERE id=$2 AND status='approved' RETURNING *",
      [admin_note || null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Approved withdrawal not found' });
    res.json({ message: 'Withdrawal marked as paid' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── APPLICATIONS ──

// GET /api/admin/applications
router.get('/applications', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM applications ORDER BY submitted_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/application/:id/approve — creates user + optionally sets a temp password
router.post('/application/:id/approve', [
  body('temp_password').optional().isLength({ min: 6 }),
], async (req, res) => {
  const { id } = req.params;
  const { temp_password } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const appResult = await client.query("SELECT * FROM applications WHERE id=$1 AND status='pending'", [id]);
    if (!appResult.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Pending application not found' }); }

    const app = appResult.rows[0];
    let created = false;
    let generatedPassword = null;

    const existing = await client.query('SELECT id FROM users WHERE email=$1', [app.email]);
    if (!existing.rows.length) {
      generatedPassword = temp_password || (Math.random().toString(36).slice(-8) + 'A1!');
      const hash = await bcrypt.hash(generatedPassword, 10);
      await client.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        [app.name, app.email, hash, 'investor']
      );
      created = true;
    }

    await client.query(
      "UPDATE applications SET status='approved', reviewed_at=NOW(), reviewed_by=$1 WHERE id=$2",
      [req.user.id, id]
    );
    await client.query('COMMIT');
    res.json({
      message: 'Application approved — user account created',
      user_created: created,
      temp_password: created ? generatedPassword : null,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// POST /api/admin/application/:id/reject
router.post('/application/:id/reject', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE applications SET status='rejected', reviewed_at=NOW(), reviewed_by=$1 WHERE id=$2 AND status='pending' RETURNING *",
      [req.user.id, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── STATS ──

// GET /api/admin/stats - dashboard summary
router.get('/stats', async (req, res) => {
  try {
    const [members, cycles, withdrawals, apps] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, SUM(a.current_balance) AS aum, SUM(a.current_balance - a.initial_deposit) AS profit FROM users u LEFT JOIN accounts a ON a.user_id=u.id WHERE u.role='investor'"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='completed') AS completed FROM investment_cycles"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='pending') AS pending, SUM(amount) FILTER (WHERE status='pending') AS pending_amount FROM withdrawals"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='pending') AS pending FROM applications"),
    ]);
    res.json({
      members: members.rows[0],
      cycles: cycles.rows[0],
      withdrawals: withdrawals.rows[0],
      applications: apps.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
