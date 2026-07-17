import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="eyebrow">Admin</div>
        <h1 style={{ fontSize: '2.2rem' }}>Stockroom Ops</h1>

        <div className="admin-shell">
          <nav className="admin-sidebar">
            <NavLink to="/admin" end>Dashboard</NavLink>
            <NavLink to="/admin/products">Products</NavLink>
            <NavLink to="/admin/orders">Orders</NavLink>
          </nav>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
