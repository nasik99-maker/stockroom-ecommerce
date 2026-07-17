const express = require('express');
const db = require('../config/db');
const { authRequired, adminRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

// POST /api/orders - create order from current cart (called after successful payment)
router.post('/', (req, res) => {
  const { shipping_address, payment_intent_id } = req.body;

  const cartItems = db
    .prepare(
      `SELECT ci.quantity, p.id as product_id, p.name, p.price, p.stock
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`
    )
    .all(req.user.id);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  for (const item of cartItems) {
    if (item.quantity > item.stock) {
      return res.status(400).json({ error: `Not enough stock for "${item.name}".` });
    }
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const createOrder = db.transaction(() => {
    const orderInfo = db
      .prepare(
        `INSERT INTO orders (user_id, total, status, payment_intent_id, shipping_address)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        req.user.id,
        Math.round(total * 100) / 100,
        payment_intent_id ? 'paid' : 'pending',
        payment_intent_id || null,
        shipping_address || ''
      );

    const orderId = orderInfo.lastInsertRowid;

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)`
    );
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.name, item.price, item.quantity);
      updateStock.run(item.quantity, item.product_id);
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

    return orderId;
  });

  const orderId = createOrder();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

  res.status(201).json({ order: { ...order, items } });
});

// GET /api/orders - current user's order history
router.get('/', (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  const withItems = orders.map((o) => ({
    ...o,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id),
  }));
  res.json({ orders: withItems });
});

// GET /api/orders/all - admin: view every order
router.get('/all', adminRequired, (req, res) => {
  const orders = db
    .prepare(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    )
    .all();
  const withItems = orders.map((o) => ({
    ...o,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id),
  }));
  res.json({ orders: withItems });
});

// GET /api/orders/:id - single order (owner or admin)
router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have access to this order.' });
  }
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ order: { ...order, items } });
});

// PUT /api/orders/:id/status - admin only
router.put('/:id/status', adminRequired, (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ order: db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) });
});

module.exports = router;
