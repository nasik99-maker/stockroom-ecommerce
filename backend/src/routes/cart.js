const express = require('express');
const db = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

function getCartForUser(userId) {
  return db
    .prepare(
      `SELECT ci.id as cart_item_id, ci.quantity, p.id as product_id, p.name, p.price,
              p.image_url, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?
       ORDER BY ci.id`
    )
    .all(userId);
}

// GET /api/cart
router.get('/', (req, res) => {
  const items = getCartForUser(req.user.id);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json({ items, total: Math.round(total * 100) / 100 });
});

// POST /api/cart - add item { product_id, quantity }
router.post('/', (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required.' });
  if (quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1.' });

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  if (product.stock < quantity) {
    return res.status(400).json({ error: `Only ${product.stock} units of "${product.name}" in stock.` });
  }

  const existing = db
    .prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, product_id);

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) {
      return res.status(400).json({ error: `Only ${product.stock} units of "${product.name}" in stock.` });
    }
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(
      req.user.id,
      product_id,
      quantity
    );
  }

  res.status(201).json({ items: getCartForUser(req.user.id) });
});

// PUT /api/cart/:cartItemId - update quantity
router.put('/:cartItemId', (req, res) => {
  const { quantity } = req.body;
  if (quantity == null || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1.' });
  }

  const item = db
    .prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?')
    .get(req.params.cartItemId, req.user.id);
  if (!item) return res.status(404).json({ error: 'Cart item not found.' });

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
  if (quantity > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} units of "${product.name}" in stock.` });
  }

  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, item.id);
  res.json({ items: getCartForUser(req.user.id) });
});

// DELETE /api/cart/:cartItemId
router.delete('/:cartItemId', (req, res) => {
  const item = db
    .prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?')
    .get(req.params.cartItemId, req.user.id);
  if (!item) return res.status(404).json({ error: 'Cart item not found.' });

  db.prepare('DELETE FROM cart_items WHERE id = ?').run(item.id);
  res.json({ items: getCartForUser(req.user.id) });
});

// DELETE /api/cart - clear cart
router.delete('/', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ items: [] });
});

module.exports = router;
