const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

/**
 * Mock Stripe Payment Gateway
 * ---------------------------------
 * This simulates the Stripe PaymentIntent flow without calling the real Stripe API,
 * so the project runs fully offline/sandboxed. Swap this file's contents for the real
 * `stripe` Node SDK (create PaymentIntent, confirm, webhooks) to go live - the
 * request/response shape here intentionally mirrors Stripe's so the swap is easy.
 *
 * Test card rules (mimicking Stripe's documented test cards):
 *   4242 4242 4242 4242 -> succeeds
 *   4000 0000 0000 0002 -> declined
 *   any other well-formed 16-digit number -> succeeds
 */

router.post('/create-intent', (req, res) => {
  const { amount } = req.body; // amount in dollars
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'A valid amount is required.' });
  }

  const paymentIntent = {
    id: `pi_mock_${uuidv4().replace(/-/g, '').slice(0, 24)}`,
    client_secret: `pi_mock_${uuidv4().replace(/-/g, '')}_secret`,
    amount: Math.round(amount * 100), // cents, like Stripe
    currency: 'usd',
    status: 'requires_payment_method',
  };

  res.json({ paymentIntent });
});

router.post('/confirm', (req, res) => {
  const { payment_intent_id, card_number } = req.body;

  if (!payment_intent_id || !card_number) {
    return res.status(400).json({ error: 'payment_intent_id and card_number are required.' });
  }

  const digitsOnly = card_number.replace(/\s+/g, '');

  if (digitsOnly === '4000000000000002') {
    return res.status(402).json({
      error: 'Your card was declined.',
      paymentIntent: { id: payment_intent_id, status: 'failed' },
    });
  }

  if (!/^\d{16}$/.test(digitsOnly)) {
    return res.status(400).json({ error: 'Please enter a valid 16-digit card number.' });
  }

  // Any other well-formed card (incl. the 4242... test card) succeeds
  res.json({
    paymentIntent: {
      id: payment_intent_id,
      status: 'succeeded',
      charged_at: new Date().toISOString(),
    },
  });
});

module.exports = router;
