'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartItem = cart.find((item) => item.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateQuantity(product.id, qty + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(product.id, qty - 1);
  };

  // Calculate discount percentage
  const discountPct = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="product-card fade-in">
      <div className="product-card-badge">
        <span className="dot"></span>
        <span>{product.deliveryTime || '10 mins'}</span>
      </div>

      <div className="product-card-img">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            // Fallback just in case assets copy takes time
            e.target.src = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80';
          }}
        />
      </div>

      <div className="product-card-body">
        <span className="product-card-weight">{product.weight}</span>
        <h3 className="product-card-name">{product.name}</h3>

        <div className="product-card-price-row">
          <span className="product-card-price">₹{product.price}</span>
          {product.mrp > product.price && (
            <>
              <span className="product-card-mrp">₹{product.mrp}</span>
              <span className="product-card-discount">{discountPct}% OFF</span>
            </>
          )}
        </div>
      </div>

      <div className="product-card-footer">
        {qty > 0 ? (
          <div className="add-btn in-cart">
            <span className="qty-control" onClick={handleDecrement}>−</span>
            <span className="qty-value">{qty}</span>
            <span className="qty-control" onClick={handleIncrement}>+</span>
          </div>
        ) : (
          <button className="add-btn ripple-effect" onClick={handleAdd}>
            ADD
          </button>
        )}
      </div>
    </div>
  );
}
