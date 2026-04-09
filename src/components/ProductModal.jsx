import React from 'react';
import './ProductModal.css';

/**
 * @param {{ product: object|null, onClose: function, onPrev?: function, onNext?: function }} props
 */
const ProductModal = ({ product, onClose, onPrev, onNext }) => {
  if (!product) return null;
  return (
    <div className="modal-backdrop" tabIndex={-1} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-image-section">
          <img src={product.image} alt={product.name} className="modal-image" />
        </div>
        <div className="modal-details-section">
          <h2>{product.name}</h2>
          <p className="modal-description">{product.description}</p>
          <div className="modal-meta">
            <span className="modal-price">${product.price}</span>
            {product.oldPrice && <span className="modal-old-price">${product.oldPrice}</span>}
            {product.discount && <span className="modal-discount">-{product.discount}%</span>}
          </div>
          <div className="modal-category">Category: {product.category}</div>
          <div className="modal-stars">Rating: {product.stars} ⭐</div>
        </div>
        {(onPrev || onNext) && (
          <div className="modal-nav">
            {onPrev && <button className="modal-arrow left" onClick={onPrev}>&#8592;</button>}
            {onNext && <button className="modal-arrow right" onClick={onNext}>&#8594;</button>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductModal;
