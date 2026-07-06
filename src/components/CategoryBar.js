'use client';

import React from 'react';

const CATEGORIES = [
  { icon: '🥛', name: 'All' },
  { icon: '🥛', name: 'Milk & Cream' },
  { icon: '🧈', name: 'Butter & Ghee' },
  { icon: '🧀', name: 'Paneer & Cheese' },
  { icon: '🍶', name: 'Curd & Yogurt' },
  { icon: '🍦', name: 'Ice Cream' },
  { icon: '🍬', name: 'Dairy Sweets' }
];

export default function CategoryBar({ activeCategory, onCategoryChange }) {
  return (
    <div className="category-bar">
      {CATEGORIES.map((cat) => (
        <div
          key={cat.name}
          className={`category-pill ${activeCategory === cat.name ? 'active' : ''}`}
          onClick={() => onCategoryChange && onCategoryChange(cat.name)}
        >
          <span className="category-pill-icon">{cat.icon}</span>
          <span>{cat.name}</span>
        </div>
      ))}
    </div>
  );
}
