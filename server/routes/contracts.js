import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

async function ensureContractTables() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS contracts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      contract_no VARCHAR(50) UNIQUE NOT NULL,
      customer_id INT NULL,
      seller_name VARCHAR(200) NULL,
      seller_address TEXT NULL,
      seller_tax_id VARCHAR(20) NULL,
      seller_contact_name VARCHAR(200) NULL,
      seller_company_phone VARCHAR(50) NULL,
      seller_contact_phone VARCHAR(50) NULL,
      customer_name VARCHAR(200) NOT NULL,
      customer_address TEXT NULL,
      customer_tax_id VARCHAR(20) NULL,
      contact_name VARCHAR(200) NULL,
      company_phone VARCHAR(50) NULL,
      contact_phone VARCHAR(50) NULL,
      title VARCHAR(255) NOT NULL,
      contract_date DATE NULL,
      start_date DATE NULL,
      end_date DATE NULL,
      content LONGTEXT NULL,
      payment_type VARCHAR(20) DEFAULT 'cash',
      payment_terms VARCHAR(100) DEFAULT 'ชำระทันที',
      currency VARCHAR(10) DEFAULT 'THB',
      value DECIMAL(12,2) DEFAULT 0,
      subtotal DECIMAL(12,2) DEFAULT 0,
      vat_amount DECIMAL(12,2) DEFAULT 0,
      total_amount DECIMAL(12,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      note TEXT NULL,
      created_by VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_contract_no (contract_no),
      INDEX idx_customer_name (customer_name),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS contract_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      contract_id INT NOT NULL,
      product_id INT NULL,
      product_name VARCHAR(200) NOT NULL,
      unit VARCHAR(20) NULL,
      qty DECIMAL(12,2) DEFAULT 1,
      price_unit DECIMAL(12,2) DEFAULT 0,
      discount DECIMAL(12,2) DEFAULT 0,
      amount DECIMAL(12,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_contract_id (contract_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );

  const alterStatements = [
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS customer_id INT NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS seller_name VARCHAR(200) NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS seller_address TEXT NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS seller_tax_id VARCHAR(20) NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS seller_contact_name VARCHAR(200) NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS seller_company_phone VARCHAR(50) NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS seller_contact_phone VARCHAR(50) NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS customer_address TEXT NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS customer_tax_id VARCHAR(20) NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contact_name VARCHAR(200) NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS company_phone VARCHAR(50) NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50) NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT 'สัญญาซื้อ-ขายสินค้า'`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_date DATE NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS start_date DATE NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS end_date DATE NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS content LONGTEXT NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'cash'`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100) DEFAULT 'ชำระทันที'`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'THB'`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS value DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS note TEXT NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_by VARCHAR(50) NULL`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
  ];

  for (const sql of alterStatements) {
    await pool.query(sql).catch(() => {});
  }
}

async function generateContractNo(connection = pool) {
  const now = new Date();
  const ymd = now.getFullYear().toString()
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0');
  const prefix = `CNT-${ymd}-`;
  const [[row]] = await connection.query(
    `SELECT contract_no FROM contracts WHERE contract_no LIKE ? ORDER BY contract_no DESC LIMIT 1`,
    [`${prefix}%`]
  );
  const nextSeq = row ? parseInt(row.contract_no.slice(-5), 10) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(5, '0')}`;
}

router.get('/next-no', requireAuth, async (_, res) => {
  try {
    await ensureContractTables();
    const contract_no = await generateContractNo();
    res.json({ contract_no });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/search', requireAuth, async (req, res) => {
  try {
    await ensureContractTables();
    const q = `%${req.query.q || ''}%`;
    const [rows] = await pool.query(
      `SELECT id, contract_no, customer_name, title, start_date, end_date, value, status
       FROM contracts WHERE (contract_no LIKE ? OR customer_name LIKE ? OR title LIKE ?) AND status = 'active'
       ORDER BY created_at DESC LIMIT 20`,
      [q, q, q]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    await ensureContractTables();
    const [rows] = await pool.query('SELECT * FROM contracts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    await ensureContractTables();
    const [[contract]] = await pool.query('SELECT * FROM contracts WHERE id = ? LIMIT 1', [req.params.id]);
    if (!contract) return res.status(404).json({ error: 'Not found' });
    const [items] = await pool.query('SELECT * FROM contract_items WHERE contract_id = ? ORDER BY id ASC', [req.params.id]);
    res.json({ ...contract, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await ensureContractTables();
    await conn.beginTransaction();

    const {
      customer_id,
      seller_name,
      seller_address,
      seller_tax_id,
      seller_contact_name,
      seller_company_phone,
      seller_contact_phone,
      customer_name,
      customer_address,
      customer_tax_id,
      contact_name,
      company_phone,
      contact_phone,
      title = 'สัญญาซื้อ-ขายสินค้า',
      contract_date,
      start_date,
      end_date,
      content,
      payment_type = 'cash',
      payment_terms = 'ชำระทันที',
      currency = 'THB',
      vat_pct = 10,
      note,
      items = [],
      created_by = 'sales',
    } = req.body;

    if (!customer_name || !contract_date || !start_date || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const contract_no = await generateContractNo(conn);
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const vat_amount = parseFloat(((subtotal * vat_pct) / 100).toFixed(2));
    const total_amount = parseFloat((subtotal + vat_amount).toFixed(2));

    const [result] = await conn.query(
      `INSERT INTO contracts
        (contract_no, customer_id, seller_name, seller_address, seller_tax_id, seller_contact_name, seller_company_phone, seller_contact_phone,
         customer_name, customer_address, customer_tax_id,
         contact_name, company_phone, contact_phone,
         title, contract_date, start_date, end_date, content, payment_type, payment_terms,
         currency, value, subtotal, vat_amount, total_amount, status, note, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        contract_no,
        customer_id || null,
        seller_name || null,
        seller_address || null,
        seller_tax_id || null,
        seller_contact_name || null,
        seller_company_phone || null,
        seller_contact_phone || null,
        customer_name,
        customer_address || null,
        customer_tax_id || null,
        contact_name || null,
        company_phone || null,
        contact_phone || null,
        title,
        contract_date,
        start_date,
        end_date || null,
        content || null,
        payment_type,
        payment_terms,
        currency,
        total_amount,
        subtotal,
        vat_amount,
        total_amount,
        'active',
        note || null,
        created_by,
      ]
    );

    for (const item of items) {
      await conn.query(
        `INSERT INTO contract_items
          (contract_id, product_id, product_name, unit, qty, price_unit, discount, amount)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          result.insertId,
          item.product_id || null,
          item.product_name,
          item.unit || null,
          item.qty || 0,
          item.price_unit || 0,
          item.discount || 0,
          item.amount || 0,
        ]
      );
    }

    await conn.commit();
    res.json({ success: true, id: result.insertId, contract_no });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

export default router;
