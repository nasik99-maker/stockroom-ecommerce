import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client, { getErrorMessage } from '../api/client';
import { useCart } from '../context/CartContext';

const initialAddress = { fullName: '', street: '', city: '', state: '', zip: '' };
const initialCard = { number: '', expiry: '', cvc: '' };

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(initialAddress);
  const [card, setCard] = useState(initialCard);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const shipping = 0;
  const grandTotal = total + shipping;

  // Redirect back to cart if it's empty - but never once an order has
  // just been placed (clearing the cart shouldn't bounce us off this page
  // mid-navigation to the confirmation screen).
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [items.length, orderPlaced, navigate]);

  if (items.length === 0 && !orderPlaced) {
    return null;
  }

  function updateAddress(key, value) {
    setAddress((a) => ({ ...a, [key]: value }));
  }
  function updateCard(key, value) {
    setCard((c) => ({ ...c, [key]: value }));
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');

    for (const [k, v] of Object.entries(address)) {
      if (!v.trim()) {
        setError('Please fill in all shipping address fields.');
        return;
      }
    }
    const digitsOnly = card.number.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(digitsOnly)) {
      setError('Please enter a valid 16-digit card number (try 4242 4242 4242 4242).');
      return;
    }
    if (!card.expiry.trim() || !card.cvc.trim()) {
      setError('Please fill in the card expiry and CVC.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: intentData } = await client.post('/payments/create-intent', { amount: grandTotal });
      const paymentIntentId = intentData.paymentIntent.id;

      const { data: confirmData } = await client.post('/payments/confirm', {
        payment_intent_id: paymentIntentId,
        card_number: card.number,
      });

      if (confirmData.paymentIntent.status !== 'succeeded') {
        setError('Payment failed. Please try a different card.');
        setSubmitting(false);
        return;
      }

      const shippingAddress = `${address.fullName}, ${address.street}, ${address.city}, ${address.state} ${address.zip}`;
      const { data: orderData } = await client.post('/orders', {
        shipping_address: shippingAddress,
        payment_intent_id: paymentIntentId,
      });

      // Mark the order as placed BEFORE clearing cart state, so the
      // empty-cart guard above doesn't redirect us away mid-navigation.
      setOrderPlaced(true);
      navigate(`/order-confirmation/${orderData.order.id}`);
      clearCart();
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="container">
        <div className="eyebrow">Checkout</div>
        <h1 style={{ fontSize: '2.2rem' }}>Complete Your Order</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handlePlaceOrder} className="checkout-layout">
          <div>
            <div className="checkout-section">
              <h3><span className="step-num">1</span> Shipping Address</h3>
              <div className="field">
                <label>Full Name</label>
                <input value={address.fullName} onChange={(e) => updateAddress('fullName', e.target.value)} />
              </div>
              <div className="field">
                <label>Street Address</label>
                <input value={address.street} onChange={(e) => updateAddress('street', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>City</label>
                  <input value={address.city} onChange={(e) => updateAddress('city', e.target.value)} />
                </div>
                <div className="field">
                  <label>State</label>
                  <input value={address.state} onChange={(e) => updateAddress('state', e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>ZIP Code</label>
                <input value={address.zip} onChange={(e) => updateAddress('zip', e.target.value)} />
              </div>
            </div>

            <div className="checkout-section">
              <h3><span className="step-num">2</span> Payment (Sandboxed)</h3>
              <div className="test-card-hint">
                Test card — succeeds: 4242 4242 4242 4242 · declines: 4000 0000 0000 0002
                <br />Any expiry/CVC works. No real payment is processed.
              </div>
              <div className="field">
                <label>Card Number</label>
                <input
                  placeholder="4242 4242 4242 4242"
                  value={card.number}
                  onChange={(e) => updateCard('number', e.target.value)}
                  maxLength={19}
                />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Expiry (MM/YY)</label>
                  <input placeholder="12/28" value={card.expiry} onChange={(e) => updateCard('expiry', e.target.value)} />
                </div>
                <div className="field">
                  <label>CVC</label>
                  <input placeholder="123" value={card.cvc} onChange={(e) => updateCard('cvc', e.target.value)} maxLength={4} />
                </div>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h3 style={{ fontSize: '1.1rem' }}>Order Review</h3>
            {items.map((i) => (
              <div className="order-review-row" key={i.cart_item_id}>
                <span>{i.name} × {i.quantity}</span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row total">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={submitting}>
              {submitting ? 'Processing…' : `Pay $${grandTotal.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
