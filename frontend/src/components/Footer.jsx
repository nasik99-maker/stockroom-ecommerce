export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="footer-note">
          Stockroom is a demo storefront built to showcase a full-stack commerce flow —
          catalog, cart, checkout, and an inventory-aware admin dashboard. Payments are
          simulated; no real charges occur.
        </p>
        <div className="footer-cols">
          <div className="footer-col">
            <h4>Shop</h4>
            <a href="/products">Catalog</a>
            <a href="/cart">Cart</a>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <a href="/orders">Orders</a>
            <a href="/login">Log In</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
