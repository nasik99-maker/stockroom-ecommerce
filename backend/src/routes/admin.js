const express = require('express');
const db = require('../config/db');
const { authRequired, adminRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired, adminRequired);

// GET /api/admin/stats - dashboard summary
router.get('/stats', (req, res) => {
  const totalRevenue =
    db.prepare(`SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE status != 'cancelled'`).get()
      .sum || 0;
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const totalCustomers = db
    .prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`)
    .get().count;
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const lowStock = db
    .prepare('SELECT id, name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC')
    .all();

  const ordersByStatus = db
    .prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status')
    .all();

  const recentOrders = db
    .prepare(
      `SELECT o.id, o.total, o.status, o.created_at, u.name as customer_name
       FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC LIMIT 5`
    )
    .all();

  const topProducts = db
    .prepare(
      `SELECT oi.name, SUM(oi.quantity) as units_sold, SUM(oi.price * oi.quantity) as revenue
       FROM order_items oi
       GROUP BY oi.name
       ORDER BY units_sold DESC
       LIMIT 5`
    )
    .all();

  res.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStock,
    ordersByStatus,
    recentOrders,
    topProducts,
  });
});

// GET /api/admin/users - list customers
router.get('/users', (req, res) => {
  const users = db
    .prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')
    .all();
  res.json({ users });
});

module.exports = router;
