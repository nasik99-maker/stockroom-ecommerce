require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const cartRoutes = require('./src/routes/cart');
const orderRoutes = require('./src/routes/orders');
const paymentRoutes = require('./src/routes/payments');
const adminRoutes = require('./src/routes/admin');
const { seedIfEmpty } = require('./src/seed');

// On platforms with ephemeral/reset-on-restart disks (e.g. Render's free
// tier), this makes sure the demo catalog and demo accounts are always
// there after a cold start, instead of the site showing an empty store.
seedIfEmpty();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
