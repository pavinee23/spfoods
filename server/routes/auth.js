import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password, dept_id } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }

    const [rows] = await pool.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    
    if (!rows.length) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // ถ้าส่ง dept_id มา ให้ตรวจว่าตรงกับแผนกของ user (สำหรับ dept login)
    if (dept_id && user.role !== 'superadmin' && user.dept_id !== dept_id) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงแผนกนี้' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, dept_id: user.dept_id },
      process.env.JWT_SECRET || 'spfoods_jwt_secret',
      { expiresIn: '8h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        dept_id: user.dept_id 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
