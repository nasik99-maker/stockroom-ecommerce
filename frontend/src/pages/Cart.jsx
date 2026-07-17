import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, total, updateQuantity, removeItem, loading } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return <div className="page-shell container"><p>Loading cart…</p></div>;
  }

  if (items.length === 0) {
    return (
      <div className="page-shell container empty-state">
        <h3>Your cart is empty</h3>
        <p>Browse the catalog and add something to the shelf.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
          Browse Catalog
        </Link>
      </div>
    );
  }

  const shipping = 0; // mock free shipping
  const grandTotal = total + shipping;

  return (
    <div className="page-shell">
      <div className="container">
        <div className="eyebrow">Your Cart</div>
        <h1 style={{ fontSize: '2.2rem' }}>Cart ({items.length} item{items.length !== 1 ? 's' : ''})</h1>

        <div className="cart-layout">
          <div>
            {items.map((item) => (
              <div className="cart-row" key={item.cart_item_id}>
                <img src={item.image_url} alt={item.name} />
                <div>
                  <div className="cart-row-name">{item.name}</div>
                  <div className="cart-row-price">${item.price.toFixed(2)} each</div>
                </div>
                <div className="qty-stepper">
                  <button
                    onClick={() => updateQuantity(item.cart_item_id, Math.max(1, item.quantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.cart_item_id, Math.min(item.stock, item.quantity + 1))
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontWeight: 600, marginBottom: 6 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button className="remove-link" onClick={() => removeItem(item.cart_item_id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-card">
            <h3 style={{ fontSize: '1.1rem' }}>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 16 }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
