import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Shipping.css';

const Shipping = ({ cart: _cart = {} }) => {
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', days: '5-7 business days', cost: 0 },
    { id: 'express', name: 'Express Shipping', days: '2-3 business days', cost: 19.99 },
    { id: 'overnight', name: 'Overnight Shipping', days: '1 business day', cost: 49.99 }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      alert('Please fill in all address fields');
      return;
    }
    const selectedShipping = shippingOptions.find(opt => opt.id === shippingMethod);
    console.log('Shipping info:', { ...formData, shippingMethod: selectedShipping });
    navigate('/payment', { state: { shippingData: { ...formData, shippingMethod: selectedShipping } } });
  };

  return (
    <div className="shipping-container">
      <div className="shipping-header">
        <h1>📦 Shipping Information</h1>
        <p>Complete your shipping details to proceed</p>
      </div>

      <div className="shipping-content">
        <div className="shipping-methods">
          <h2>Shipping Methods</h2>
          <div className="methods-list">
            {shippingOptions.map(option => (
              <div
                key={option.id}
                className={`shipping-option ${shippingMethod === option.id ? 'selected' : ''}`}
                onClick={() => setShippingMethod(option.id)}
              >
                <input
                  type="radio"
                  id={option.id}
                  name="shipping"
                  value={option.id}
                  checked={shippingMethod === option.id}
                  onChange={() => setShippingMethod(option.id)}
                />
                <label htmlFor={option.id}>
                  <div className="option-header">
                    <strong>{option.name}</strong>
                    <span className="option-cost">
                      {option.cost === 0 ? 'FREE' : `$${option.cost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="option-details">{option.days}</div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <form className="shipping-form" onSubmit={handleContinue}>
          <h2>Delivery Address</h2>

          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Street Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="123 Main Street"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="San Francisco"
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="CA"
              />
            </div>
            <div className="form-group">
              <label htmlFor="zipCode">ZIP Code *</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                placeholder="94102"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="country">Country *</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            >
              <option value="USA">United States</option>
              <option value="Canada">Canada</option>
              <option value="Mexico">Mexico</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="back-btn" onClick={() => navigate('/cart')}>
              ← Back to Cart
            </button>
            <button type="submit" className="continue-btn">
              Continue to Payment →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Shipping;
