import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    client.get('/products?sort=newest&limit=4').then((res) => setFeatured(res.data.products));
    client.get('/products/categories').then((res) => setCategories(res.data.categories));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="hero-eyebrow">Manifest #0417 — Now Receiving</p>
          <h1>Everything has a place. Everything's in stock.</h1>
          <p>
            Stockroom is a general goods counter — electronics, clothing, home,
            books, and gear — tracked down to the last unit on the shelf.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">Browse Catalog</Link>
            <Link to="/register" className="btn btn-ghost">Create Account</Link>
          </div>
        </div>
      </section>

      <div className="manifest-strip">
        <div className="container">
          <span>FREE MOCK SHIPPING ON ALL ORDERS</span>
          <span>SANDBOX PAYMENTS — NO REAL CHARGES</span>
          <span>ADMIN INVENTORY TRACKED LIVE</span>
          <span>15 SKUs ACROSS 5 CATEGORIES</span>
        </div>
      </div>

      <div className="container">
        <div className="section-heading">
          <h2>Shop by Department</h2>
        </div>
        <div className="category-shelf">
          {categories.map((c, i) => (
            <Link key={c.id} to={`/products?category=${encodeURIComponent(c.name)}`} className="category-card">
              <span className="num mono">DEPT. {String(i + 1).padStart(2, '0')}</span>
              <h3>{c.name}</h3>
            </Link>
          ))}
        </div>

        <div className="section-heading">
          <h2>Newest Arrivals</h2>
          <Link to="/products">View all →</Link>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="section-heading">
          <h2>Why Stockroom</h2>
        </div>
        <div className="value-props">
          <div className="value-prop">
            <h4>Real-time stock</h4>
            <p>Every product page reflects live inventory — down to the low-stock warnings.</p>
          </div>
          <div className="value-prop">
            <h4>Secure checkout</h4>
            <p>JWT-authenticated accounts and a sandboxed Stripe-style payment flow.</p>
          </div>
          <div className="value-prop">
            <h4>Full order history</h4>
            <p>Track every order from placed to delivered, right from your account.</p>
          </div>
        </div>
      </div>
    </>
  );
}
