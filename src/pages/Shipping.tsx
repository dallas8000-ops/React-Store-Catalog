import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalContext from '../state/globalContext';
import '../styles/Shipping.css';

const shippingOptions = [
  { name: 'FedEx', cost: 12.99 },
  { name: 'DHL', cost: 10.49 },
  { name: 'USPS', cost: 7.99 },
];

const paymentOptions = [
  { name: 'Credit Card', value: 'card' },
  { name: 'Debit Card', value: 'debit' },
  { name: 'PayPal', value: 'paypal' },
];

export default function Shipping() {
  const { cart } = useContext(GlobalContext);
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);
  const [selectedPayment, setSelectedPayment] = useState(paymentOptions[0].value);
  const navigate = useNavigate();

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalCost = cartTotal + selectedShipping.cost;

  const handlePayment = (e) => {
    e.preventDefault();
    // Here you would handle payment logic
    alert(`Order placed! Total: $${totalCost.toFixed(2)}`);
    navigate('/');
  };

  return (
      <div className="shipping-container">
        <h2>Shipping & Payment</h2>
        <div className="shipping-section">
          <h3>Choose Shipping Method</h3>
          {shippingOptions.map(option => (
            <label key={option.name} className="shipping-option">
              <input
                type="radio"
                name="shipping"
                value={option.name}
                checked={selectedShipping.name === option.name}
                onChange={() => setSelectedShipping(option)}
              />
              {option.name} (${option.cost.toFixed(2)})
            </label>
          ))}
        </div>
        <div className="payment-section">
          <h3>Choose Payment Method</h3>
          {paymentOptions.map(option => (
            <label key={option.value} className="payment-option">
              <input
                type="radio"
                name="payment"
                value={option.value}
                checked={selectedPayment === option.value}
                onChange={() => setSelectedPayment(option.value)}
              />
              {option.name}
            </label>
          ))}
        </div>
        <div className="summary-section">
          <h3>Order Summary</h3>
          <div>Products Total: <strong>${cartTotal.toFixed(2)}</strong></div>
          <div>Shipping: <strong>${selectedShipping.cost.toFixed(2)}</strong></div>
          <div className="total-cost">Total: <strong>${totalCost.toFixed(2)}</strong></div>
        </div>
        <button className="place-order-btn" onClick={handlePayment}>
          Place Order
        </button>
      </div>
  );
}
