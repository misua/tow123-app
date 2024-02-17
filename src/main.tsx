import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_REACT_APP_PUBLISHABLE_KEY;
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>
);
