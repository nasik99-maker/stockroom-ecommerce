import { useEffect, useState } from 'react';
import client from '../../api/client';
import StatusTag from '../../components/StatusTag';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get('/admin/stats').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p>Loading dashboard…</p>;

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Revenue</div>
          <div className="value">${stats.totalRevenue.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Orders</div>
          <div className="value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="label">Customers</div>
          <div className="value">{stats.totalCustomers}</div>
        </div>
        <div className="stat-card">
          <div className="label">Products Listed</div>
          <div className="value">{stats.totalProducts}</div>
        </div>
      </div>

      <div className="two-col-grid">
        <div>
          <h3 style={{ fontSize: '1rem' }}>Recent Orders</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="mono">#{o.id}</td>
                  <td>{o.customer_name}</td>
                  <td className="mono">${o.total.toFixed(2)}</td>
                  <td><StatusTag status={o.status} /></td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr><td colSpan={4} style={{ color: 'var(--ink-soft)' }}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem' }}>Low Stock Alerts</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Left</th>
              </tr>
            </thead>
            <tbody>
              {stats.lowStock.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    <span className={`tag ${p.stock === 0 ? 'tag-rust' : 'tag-amber'}`}>{p.stock}</span>
                  </td>
                </tr>
              ))}
              {stats.lowStock.length === 0 && (
                <tr><td colSpan={2} style={{ color: 'var(--ink-soft)' }}>All products well stocked.</td></tr>
              )}
            </tbody>
          </table>

          <h3 style={{ fontSize: '1rem', marginTop: 28 }}>Top Sellers</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td className="mono">{p.units_sold}</td>
                  <td className="mono">${p.revenue.toFixed(2)}</td>
                </tr>
              ))}
              {stats.topProducts.length === 0 && (
                <tr><td colSpan={3} style={{ color: 'var(--ink-soft)' }}>No sales yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
