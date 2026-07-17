const bcrypt = require('bcryptjs');
const db = require('./config/db');

const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports & Outdoors'];

const products = [
  { name: 'Wireless Noise-Cancelling Headphones', description: 'Over-ear Bluetooth headphones with 30-hour battery life and active noise cancellation.', price: 149.99, category: 'Electronics', stock: 25, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
  { name: 'Smart Fitness Watch', description: 'Track heart rate, sleep, and workouts with a bright AMOLED display.', price: 89.99, category: 'Electronics', stock: 40, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
  { name: 'Portable Bluetooth Speaker', description: 'Waterproof speaker with rich bass and 12-hour playtime.', price: 39.99, category: 'Electronics', stock: 60, image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500' },
  { name: 'Mechanical Keyboard', description: 'RGB backlit mechanical keyboard with hot-swappable switches.', price: 74.99, category: 'Electronics', stock: 15, image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500' },
  { name: "Men's Classic Denim Jacket", description: 'A timeless denim jacket made from durable cotton twill.', price: 59.99, category: 'Clothing', stock: 30, image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500' },
  { name: "Women's Running Shoes", description: 'Lightweight breathable running shoes with responsive cushioning.', price: 79.99, category: 'Clothing', stock: 3, image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500' },
  { name: 'Cotton Crewneck T-Shirt (3-Pack)', description: 'Soft, breathable everyday tees in classic colors.', price: 24.99, category: 'Clothing', stock: 100, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' },
  { name: 'Stainless Steel Cookware Set', description: '10-piece cookware set, dishwasher safe and induction compatible.', price: 129.99, category: 'Home & Kitchen', stock: 12, image_url: 'https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=500' },
  { name: 'Programmable Coffee Maker', description: '12-cup drip coffee maker with auto-brew scheduling.', price: 49.99, category: 'Home & Kitchen', stock: 4, image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500' },
  { name: 'Memory Foam Pillow (2-Pack)', description: 'Contoured memory foam pillows for supportive, cool sleep.', price: 34.99, category: 'Home & Kitchen', stock: 45, image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=500' },
  { name: 'The Art of Clean Code', description: 'A practical guide to writing maintainable, elegant software.', price: 29.99, category: 'Books', stock: 50, image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500' },
  { name: 'Modern Web Development Handbook', description: 'A comprehensive reference for building full-stack web applications.', price: 34.99, category: 'Books', stock: 35, image_url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=500' },
  { name: 'Yoga Mat with Carrying Strap', description: 'Non-slip, extra-thick yoga mat for home or studio practice.', price: 27.99, category: 'Sports & Outdoors', stock: 55, image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500' },
  { name: 'Insulated Water Bottle', description: 'Keeps drinks cold for 24 hours or hot for 12. 32oz.', price: 22.99, category: 'Sports & Outdoors', stock: 2, image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500' },
  { name: 'Adjustable Dumbbell Set', description: 'Space-saving dumbbells adjustable from 5 to 52.5 lbs per hand.', price: 249.99, category: 'Sports & Outdoors', stock: 8, image_url: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=500' },
];

// Wipes and recreates all demo data. Used by `npm run seed` (CLI) and safe
// to call any time you want to reset back to the known demo state.
function runSeed() {
  console.log('Seeding database...');

  db.exec(`
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM cart_items;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM users;
  `);

  const catIds = {};
  const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
  for (const name of categories) {
    const info = insertCat.run(name);
    catIds[name] = info.lastInsertRowid;
  }

  const insertProduct = db.prepare(
    `INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const p of products) {
    insertProduct.run(p.name, p.description, p.price, p.image_url, catIds[p.category], p.stock);
  }

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  );
  insertUser.run('Admin User', 'admin@demo.com', bcrypt.hashSync('admin123', 10), 'admin');
  insertUser.run('Jane Customer', 'customer@demo.com', bcrypt.hashSync('customer123', 10), 'customer');

  console.log('Seed complete!');
  console.log(`  ${categories.length} categories, ${products.length} products created.`);
  console.log('  Demo admin login:    admin@demo.com / admin123');
  console.log('  Demo customer login: customer@demo.com / customer123');
}

// Only seeds if the products table is empty. Safe to call on every server
// boot — on platforms with ephemeral disks (e.g. Render's free tier), this
// means the demo catalog reappears automatically after a restart instead
// of the site showing an empty store.
function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (count === 0) {
    runSeed();
  } else {
    console.log(`Database already has ${count} product(s) — skipping auto-seed.`);
  }
}

// Running `node src/seed.js` directly always force-reseeds (wipes + recreates).
if (require.main === module) {
  runSeed();
}

module.exports = { runSeed, seedIfEmpty };
