import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/next-code', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT product_code FROM products WHERE product_code LIKE 'SPF-%' ORDER BY id DESC LIMIT 1`
    );
    let next = 'SPF-001';
    if (rows.length) {
      const last = parseInt(rows[0].product_code.replace('SPF-', ''), 10);
      next = `SPF-${String(last + 1).padStart(3, '0')}`;
    }
    res.json({ code: next });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/categories', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name AS category_name FROM product_categories ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { product_code, product_name, category_id, unit, price_cost, price_sell, stock_qty, min_stock, description } = req.body;
    if (!product_name) return res.status(400).json({ error: 'กรุณากรอกชื่อสินค้า' });

    const [exist] = await pool.query('SELECT id FROM products WHERE product_code = ?', [product_code]);
    if (exist.length) return res.status(400).json({ error: 'รหัสสินค้านี้มีอยู่แล้ว' });

    const [result] = await pool.query(
      `INSERT INTO products (product_code, product_name, category_id, unit, price_cost, price_sell, stock_qty, min_stock, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_code, product_name, category_id || null, unit || 'กล่อง', price_cost || 0, price_sell || 0, stock_qty || 0, min_stock || 0, description || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.category_name FROM products p
       LEFT JOIN (
         SELECT id, name AS category_name
         FROM product_categories
       ) c ON p.category_id = c.id
       WHERE p.active = 1 ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
