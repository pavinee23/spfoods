import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Summary: ลูกค้าทุกรายที่มีบันทึก CRM พร้อม record ล่าสุด
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.customer_code, c.customer_name, c.phone, c.email,
             ct.id AS tracking_id, ct.interaction_type, ct.service_stage,
             ct.description, ct.notes, ct.created_at, ct.updated_at
      FROM customers c
      INNER JOIN crm_tracking ct ON ct.id = (
        SELECT id FROM crm_tracking WHERE customer_id = c.id ORDER BY created_at DESC LIMIT 1
      )
      ORDER BY ct.updated_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search customers
router.get('/customers/search', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json([]);
    const search = `%${q.trim()}%`;
    const [rows] = await pool.query(
      `SELECT id, customer_code, customer_name, phone, email, address 
       FROM customers 
       WHERE customer_name LIKE ? OR customer_code LIKE ? OR phone LIKE ? 
       ORDER BY customer_name ASC 
       LIMIT 20`,
      [search, search, search]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer CRM tracking history
router.get('/customer/:customerId', requireAuth, async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Get customer info
    const [customer] = await pool.query(
      'SELECT id, customer_code, customer_name, phone, email, address FROM customers WHERE id = ?',
      [customerId]
    );
    if (!customer.length) return res.status(404).json({ error: 'Customer not found' });
    
    // Get CRM tracking records
    const [trackings] = await pool.query(
      `SELECT id, customer_id, interaction_type, service_stage, description, notes, 
              created_by, created_at, updated_at
       FROM crm_tracking 
       WHERE customer_id = ? 
       ORDER BY created_at DESC`,
      [customerId]
    );
    
    // Get recent sales orders
    const [salesOrders] = await pool.query(
      `SELECT id, so_no, customer_id, total_amount, created_at, status
       FROM sales_orders 
       WHERE customer_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [customerId]
    );
    
    res.json({
      customer: customer[0],
      trackings,
      salesOrders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create CRM tracking record
router.post('/', requireAuth, async (req, res) => {
  try {
    const { customer_id, interaction_type, service_stage, description, notes } = req.body;
    
    if (!customer_id || !interaction_type || !service_stage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure crm_tracking table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_tracking (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT NOT NULL,
        interaction_type VARCHAR(50) NOT NULL,
        service_stage ENUM('pre-sale', 'during', 'post-sale') NOT NULL,
        description TEXT,
        notes TEXT,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `).catch(() => {});

    const [result] = await pool.query(
      `INSERT INTO crm_tracking 
       (customer_id, interaction_type, service_stage, description, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer_id, interaction_type, service_stage, description || null, notes || null, req.body.created_by || 'admin']
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update CRM tracking record
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { interaction_type, service_stage, description, notes } = req.body;
    const { id } = req.params;

    await pool.query(
      `UPDATE crm_tracking 
       SET interaction_type=?, service_stage=?, description=?, notes=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=?`,
      [interaction_type, service_stage, description, notes, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete CRM tracking record
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM crm_tracking WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
