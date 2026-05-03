import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// สร้างเลข SO อัตโนมัติ SO-yyyymmdd-00001
async function generateSoNo() {
  const today = new Date();
  const ymd = today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');
  const prefix = `SO-${ymd}-`;
  const [[row]] = await pool.query(
    `SELECT so_no FROM sales_orders WHERE so_no LIKE ? ORDER BY so_no DESC LIMIT 1`,
    [`${prefix}%`]
  );
  const nextSeq = row ? parseInt(row.so_no.slice(-5)) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(5, '0')}`;
}

// GET /api/sales-orders/next-no — เลข SO ถัดไป
router.get('/next-no', requireAuth, async (req, res) => {
  try {
    const so_no = await generateSoNo();
    res.json({ so_no });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sales-orders — ดูทั้งหมด
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sales_orders ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sales-orders/:id — ดูรายละเอียด
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [[order]] = await pool.query('SELECT * FROM sales_orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Not found' });
    const [items] = await pool.query('SELECT * FROM sales_order_items WHERE so_id = ?', [req.params.id]);
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sales-orders — สร้างใบสั่งขาย
router.post('/', requireAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const {
      customer_id, customer_name, customer_address, customer_tax_id,
      so_date, due_date, vat_pct = 10, note, items = [], created_by,
      payment_type = 'cash', payment_terms = 'ชำระทันที',
      currency = 'THB', contract_no = null, contract_id = null,
    } = req.body;

    const normalizedContractNo = String(contract_no || '').trim();
    if (!normalizedContractNo) {
      await conn.rollback();
      return res.status(400).json({ error: 'Contract number is required for every sales order' });
    }

    const so_no = await generateSoNo();

    let subtotal = 0;
    for (const it of items) {
      subtotal += parseFloat(it.amount || 0);
    }
    const vat_amount   = parseFloat(((subtotal * vat_pct) / 100).toFixed(2));
    const total_amount = parseFloat((subtotal + vat_amount).toFixed(2));

    // resolve contract_id จาก contract_no ถ้าไม่ได้ส่งมา
    let resolvedContractId = contract_id || null;
    if (!resolvedContractId) {
      const [[c]] = await conn.query('SELECT id FROM contracts WHERE contract_no = ? LIMIT 1', [normalizedContractNo]);
      if (c) resolvedContractId = c.id;
    }

    if (!resolvedContractId) {
      await conn.rollback();
      return res.status(400).json({ error: `Contract not found: ${normalizedContractNo}` });
    }

    const [result] = await conn.query(
      `INSERT INTO sales_orders
        (so_no, customer_id, customer_name, customer_address, customer_tax_id,
         so_date, due_date, payment_type, payment_terms, currency,
         contract_no, contract_id, subtotal, vat_amount, total_amount, note, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [so_no, customer_id || null, customer_name, customer_address, customer_tax_id,
       so_date, due_date || null, payment_type, payment_terms, currency,
       normalizedContractNo, resolvedContractId, subtotal, vat_amount, total_amount, note, created_by]
    );
    const so_id = result.insertId;

    for (const it of items) {
      await conn.query(
        `INSERT INTO sales_order_items (so_id, product_id, product_name, unit, qty, price_unit, discount, amount)
         VALUES (?,?,?,?,?,?,?,?)`,
        [so_id, it.product_id || null, it.product_name, it.unit, it.qty, it.price_unit, it.discount || 0, it.amount]
      );
    }

    await conn.commit();
    res.json({ success: true, so_no, id: so_id });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// PATCH /api/sales-orders/:id/status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE sales_orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
