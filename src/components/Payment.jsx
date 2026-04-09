// Module-level order number counter for demo purposes
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Payment.css';

/**
 * @param {Object} props
 * @param {Array<{id: string|number, name: string, price: number, quantity: number}>} [props.cartItems=[]]
 */
const Payment = ({ cartItems = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const shippingData = location.state?.shippingData || {};

  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);



  const cartTotal = Array.isArray(cartItems) 
    ? cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0) 
    : 0;
  
  const shippingCost = shippingData?.shippingMethod?.cost || 0;
  const tax = (cartTotal * 0.08).toFixed(2);
  const total = (cartTotal + shippingCost + parseFloat(tax)).toFixed(2);

  const paymentMethods = [
    { id: 'credit-card', name: '💳 Credit Card', icon: '💳' },
    { id: 'debit-card', name: '🏧 Debit Card', icon: '🏧' },
    { id: 'paypal', name: '🅿️ PayPal', icon: '🅿️' },
    { id: 'apple-pay', name: '🍎 Apple Pay', icon: '🍎' }
  ];

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (paymentMethod === 'credit-card') {
      if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expiryDate || !cardData.cvv) {
        alert('Please fill in all card details');
        return;
      }
    }

    setOrderNumber('ORDER-0001');

    console.log('Order placed:', {
      cartItems,
      shippingData,
      paymentMethod,
      cardData,
      total
    });

    setOrderPlaced(true);
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  if (orderPlaced) {
    return (
      <div className="payment-container">
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase. Your order has been confirmed.</p>
          {orderNumber !== null && (
            <p className="order-number">Order #: {orderNumber}</p>
          )}
          <p>You will be redirected to home page shortly...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>💰 Payment</h1>
        <p>Complete your purchase securely</p>
      </div>

      <div className="payment-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-section">
            <h3>Items ({cartItems.length})</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping ({shippingData?.shippingMethod?.name}):</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%):</span>
              <span>${tax}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${total}</span>
            </div>
          </div>

          <div className="shipping-summary">
            <h3>Shipping To:</h3>
            <p>{shippingData.fullName}</p>
            <p>{shippingData.address}</p>
            <p>{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
          </div>
        </div>

        <form className="payment-form" onSubmit={handlePlaceOrder}>
          <h2>Payment Method</h2>

          <div className="methods-list">
            {paymentMethods.map(method => (
              <div
                key={method.id}
                className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}
                onClick={() => setPaymentMethod(method.id)}
              >
                <input
                  type="radio"
                  id={method.id}
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                />
                <label htmlFor={method.id}>{method.name}</label>
              </div>
            ))}
          </div>

          {paymentMethod === 'credit-card' && (
            <div className="card-form">
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number *</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleCardChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cardHolder">Card Holder Name *</label>
                <input
                  type="text"
                  id="cardHolder"
                  name="cardHolder"
                  value={cardData.cardHolder}
                  onChange={handleCardChange}
                  placeholder="John Doe"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date *</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={cardData.expiryDate}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV *</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleCardChange}
                    placeholder="123"
                    maxLength="4"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="payment-info">
              <p>You will be redirected to PayPal to complete your payment securely.</p>
            </div>
          )}

          {paymentMethod === 'apple-pay' && (
            <div className="payment-info">
              <p>Click the button below to complete your payment with Apple Pay.</p>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="back-btn" onClick={() => navigate('/shipping')}>
              ← Back to Shipping
            </button>
            <button type="submit" className="place-order-btn">
              Place Order ${total}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment;
