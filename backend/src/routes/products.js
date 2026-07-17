const express = require('express');
const db = require('../config/db');
const { authRequired, adminRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/products - list with optional search/category/sort/pagination
router.get('/', (req, res) => {
  const { search, category, sort, page = 1, limit = 12 } = req.query;

  let query = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    query += ' AND c.name = ?';
    params.push(category);
  }

  const sortMap = {
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    newest: 'p.created_at DESC',
    name: 'p.name ASC',
  };
  query += ` ORDER BY ${sortMap[sort] || 'p.created_at DESC'}`;

  // Count total for pagination (before LIMIT)
  const countQuery = query.replace(
    /SELECT p\.\*, c\.name as category_name/,
    'SELECT COUNT(*) as total'
  ).replace(/ORDER BY.*$/, '');
  const total = db.prepare(countQuery).get(...params).total;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  query += ' LIMIT ? OFFSET ?';
  params.push(limitNum, offset);

  const products = db.prepare(query).all(...params);
  res.json({
    products,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
});

// GET /api/products/categories - list all categories
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json({ categories });
});

// GET /api/products/:id (numeric only, so it doesn't shadow /categories)
router.get('/:id(\\d+)', (req, res) => {
  const product = db
    .prepare(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`
    )
    .get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json({ product });
});

// POST /api/products - admin only
router.post('/', authRequired, adminRequired, (req, res) => {
  const { name, description, price, image_url, category_id, stock } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }
  if (price < 0 || (stock != null && stock < 0)) {
    return res.status(400).json({ error: 'Price and stock must not be negative.' });
  }

  const info = db
    .prepare(
      `INSERT INTO products (name, description, price, image_url, category_id, stock)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(name, description || '', price, image_url || '', category_id || null, stock || 0);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ product });
});

// PUT /api/products/:id - admin only
router.put('/:id', authRequired, adminRequired, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found.' });

  const { name, description, price, image_url, category_id, stock } = req.body;
  db.prepare(
    `UPDATE products SET name=?, description=?, price=?, image_url=?, category_id=?, stock=? WHERE id=?`
  ).run(
    name ?? existing.name,
    description ?? existing.description,
    price ?? existing.price,
    image_url ?? existing.image_url,
    category_id ?? existing.category_id,
    stock ?? existing.stock,
    req.params.id
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json({ product });
});

// DELETE /api/products/:id - admin only
router.delete('/:id', authRequired, adminRequired, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found.' });

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted successfully.' });
});

// POST /api/products/categories - admin only
router.post('/categories', authRequired, adminRequired, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required.' });
  try {
    const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    res.status(201).json({ category: { id: info.lastInsertRowid, name } });
  } catch (err) {
    res.status(409).json({ error: 'Category already exists.' });
  }
});

module.exports = router;
