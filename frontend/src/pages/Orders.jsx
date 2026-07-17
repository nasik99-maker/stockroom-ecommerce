import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import StatusTag from '../components/StatusTag';

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    client.get('/orders').then((res) => setOrders(res.data.orders));
  }, []);

  if (orders === null) {
    return <div className="page-shell container"><p>Loading orders…</p></div>;
  }

  if (orders.length === 0) {
    return (
      <div className="page-shell container empty-state">
        <h3>No orders yet</h3>
        <p>Once you place an order, it'll show up here.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Catalog</Link>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="eyebrow">Account</div>
        <h1 style={{ fontSize: '2.2rem' }}>My Orders</h1>

        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card-header">
              <div>
                <span className="mono">Order #{order.id}</span>
                <div className="mono" style={{ fontSize: '0.75rem' }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
              <StatusTag status={order.status} />
            </div>
            {order.items.map((item) => (
              <div className="order-item-row" key={item.id}>
                <span>{item.name} × {item.quantity}</span>
                <span className="mono">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row total">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
