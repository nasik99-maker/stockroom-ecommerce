import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StockBadge from '../components/StockBadge';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    client
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => setNotFound(true));
  }, [id]);

  async function handleAddToCart() {
    setError('');
    setMessage('');
    if (!user) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    setAdding(true);
    const result = await addToCart(product.id, qty);
    setAdding(false);
    if (result.success) {
      setMessage(`Added ${qty} × ${product.name} to your cart.`);
    } else {
      setError(result.error);
    }
  }

  if (notFound) {
    return (
      <div className="page-shell container empty-state">
        <h3>Product not found</h3>
        <p>It may have been removed from the catalog.</p>
        <Link to="/products" className="btn btn-primary">Back to Catalog</Link>
      </div>
    );
  }

  if (!product) {
    return <div className="page-shell container"><p>Loading…</p></div>;
  }

  return (
    <div className="page-shell">
      <div className="container">
        <Link to="/products" className="eyebrow" style={{ textDecoration: 'none' }}>← Back to Catalog</Link>

        <div className="product-detail">
          <div className="product-detail-media">
            <img src={product.image_url} alt={product.name} />
          </div>
          <div>
            <span className="tag tag-navy">{product.category_name || 'General'}</span>
            <h1 style={{ marginTop: 14, fontSize: '2rem' }}>{product.name}</h1>
            <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>{product.description}</p>
            <div className="product-detail-price">${product.price.toFixed(2)}</div>
            <div style={{ marginBottom: 20 }}>
              <StockBadge stock={product.stock} />
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            {product.stock > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div className="qty-stepper">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleAddToCart} disabled={adding}>
                  {adding ? 'Adding…' : 'Add to Cart'}
                </button>
              </>
            ) : (
              <button className="btn" disabled>Out of Stock</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
