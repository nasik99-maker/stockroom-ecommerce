import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

import './styles/tokens.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/products.css';
import './styles/cart.css';
import './styles/checkout.css';
import './styles/orders.css';
import './styles/admin.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
