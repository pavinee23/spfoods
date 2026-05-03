import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import registrationRoutes from './routes/registrations.js';
import trackingRoutes from './routes/tracking.js';
import departmentRoutes from './routes/departments.js';
import customerRoutes from './routes/customers.js';
import productRoutes from './routes/products.js';
import contractRoutes from './routes/contracts.js';
import feedbackRoutes from './routes/feedback.js';
import invoiceRoutes from './routes/invoices.js';
import expenseRoutes from './routes/expenses.js';
import productionRoutes from './routes/production.js';
import qualityRoutes from './routes/quality.js';
import deliveryRoutes from './routes/delivery.js';
import purchaseRoutes from './routes/purchase.js';
import stockApiRoutes from './routes/stock-api.js';
import salesOrderRoutes from './routes/sales-orders.js';
import crmTrackingRoutes from './routes/crm-tracking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:3005',
  'http://localhost:5173',
  'https://strong-dory-enabled.ngrok-free.app',
  'https://spfoodskorea.com',
  'https://www.spfoodskorea.com',
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/crm-tracking', crmTrackingRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/stock-api', stockApiRoutes);
app.use('/api/sales-orders', salesOrderRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ SP FOODS API server running at http://localhost:${PORT}`);
});
