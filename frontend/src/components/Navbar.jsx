import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">S</span>
          Stockroom
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={`main-nav ${menuOpen ? '' : 'closed'}`}>
          <NavLink to="/products" onClick={() => setMenuOpen(false)}>
            Catalog
          </NavLink>
          {user && (
            <NavLink to="/orders" onClick={() => setMenuOpen(false)}>
              My Orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
              Admin
            </NavLink>
          )}
          {!user && (
            <>
              <NavLink to="/login" onClick={() => setMenuOpen(false)}>
                Log In
              </NavLink>
              <NavLink to="/register" onClick={() => setMenuOpen(false)}>
                Sign Up
              </NavLink>
            </>
          )}
          {user && (
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
              Log Out
            </a>
          )}
        </nav>

        <div className="header-actions">
          {user && <span className="user-chip">Hi, {user.name.split(' ')[0]}</span>}
          <Link to="/cart" className="cart-link">
            Cart
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
