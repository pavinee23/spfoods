import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/feedback — ดูทั้งหมด
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, s.so_no AS order_no FROM order_feedback f
       LEFT JOIN sales_orders s ON f.so_id = s.id
       ORDER BY f.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/feedback/sales-orders — ดึงรายการ SO สำหรับ dropdown
router.get('/sales-orders', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, so_no, customer_name, total_amount, status, so_date
       FROM sales_orders ORDER BY created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/feedback — บันทึกปัญหาใหม่
router.post('/', requireAuth, async (req, res) => {
  try {
    const { so_id, so_no, customer_id, customer_name, issue_type, priority, description, created_by } = req.body;
    if (!issue_type || !description) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });

    // resolve customer from SO if not provided
    let cname = customer_name, cid = customer_id, sno = so_no;
    if (so_id && !cname) {
      const [[so]] = await pool.query('SELECT customer_name, customer_id, so_no FROM sales_orders WHERE id=?', [so_id]);
      if (so) { cname = so.customer_name; cid = so.customer_id; sno = so.so_no; }
    }

    const [result] = await pool.query(
      `INSERT INTO order_feedback (so_id, so_no, customer_id, customer_name, issue_type, priority, description, created_by)
       VALUES (?,?,?,?,?,?,?,?)`,
      [so_id || null, sno || null, cid || null, cname || null, issue_type, priority || 'medium', description, created_by || 'admin']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/feedback/:id — อัปเดตสถานะ + การแก้ไข
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { status, resolution, resolved_by } = req.body;
    const resolvedAt = status === 'resolved' || status === 'closed' ? 'NOW()' : 'NULL';
    await pool.query(
      `UPDATE order_feedback SET status=?, resolution=?, resolved_by=?, resolved_at=${resolvedAt}, updated_at=NOW() WHERE id=?`,
      [status, resolution || null, resolved_by || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/feedback/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM order_feedback WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
