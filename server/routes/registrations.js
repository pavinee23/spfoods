import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, address, purpose } = req.body;
    if (!name || !email || !phone || !address || !purpose) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
    }
    const [[typeRow]] = await pool.query(
      'SELECT id FROM registration_types WHERE name = ? LIMIT 1',
      [purpose]
    );
    const registration_type_id = typeRow?.id || null;
    const [result] = await pool.query(
      'INSERT INTO registrations (name, email, phone, company, address, purpose, registration_type_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, company || null, address, purpose, registration_type_id]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM registrations ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { status, note } = req.body;
    const fields = [];
    const values = [];
    if (status !== undefined) {
      fields.push('status = ?', 'status_updated_at = NOW()');
      values.push(status);
    }
    if (note !== undefined) {
      fields.push('note = ?');
      values.push(note);
    }
    if (!fields.length) return res.status(400).json({ error: 'no fields' });
    values.push(req.params.id);
    await pool.query(`UPDATE registrations SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM registrations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
