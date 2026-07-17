import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    client.get(`/orders/${id}`).then((res) => setOrder(res.data.order));
  }, [id]);

  if (!order) {
    return <div className="page-shell container"><p>Loading…</p></div>;
  }

  return (
    <div className="page-shell">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="checkout-section" style={{ textAlign: 'center' }}>
          <span className="tag tag-forest" style={{ marginBottom: 16 }}>Order Confirmed</span>
          <h1 style={{ fontSize: '1.9rem', marginTop: 12 }}>Thanks — it's on the shelf list.</h1>
          <p style={{ color: 'var(--ink-soft)' }}>
            Order <span className="mono">#{order.id}</span> has been placed and paid.
          </p>

          <hr className="dashed-rule" />

          <div style={{ textAlign: 'left' }}>
            {order.items.map((item) => (
              <div className="order-review-row" key={item.id}>
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row total">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          <hr className="dashed-rule" />

          <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
            Shipping to: {order.shipping_address}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <Link to="/orders" className="btn btn-primary">View My Orders</Link>
            <Link to="/products" className="btn">Keep Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
