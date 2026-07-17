import { Fragment, useEffect, useState } from 'react';
import client from '../../api/client';
import StatusTag from '../../components/StatusTag';

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  function loadOrders() {
    client.get('/orders/all').then((res) => setOrders(res.data.orders));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId, status) {
    await client.put(`/orders/${orderId}/status`, { status });
    loadOrders();
  }

  return (
    <div>
      <h3 style={{ fontSize: '1rem' }}>{orders.length} Orders</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <Fragment key={o.id}>
              <tr>
                <td className="mono">#{o.id}</td>
                <td>
                  {o.customer_name}
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>{o.customer_email}</div>
                </td>
                <td className="mono">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="mono">${o.total.toFixed(2)}</td>
                <td>
                  <select
                    className="status-select"
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-sm"
                    onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                  >
                    {expandedId === o.id ? 'Hide' : 'Items'}
                  </button>
                </td>
              </tr>
              {expandedId === o.id && (
                <tr>
                  <td colSpan={6} style={{ background: 'var(--paper)' }}>
                    {o.items.map((item) => (
                      <div className="order-item-row" key={item.id}>
                        <span>{item.name} × {item.quantity}</span>
                        <span className="mono">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="mono" style={{ fontSize: '0.78rem', marginTop: 8, color: 'var(--ink-soft)' }}>
                      Ship to: {o.shipping_address}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={6} style={{ color: 'var(--ink-soft)' }}>No orders yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
