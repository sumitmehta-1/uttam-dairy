'use client';

import React from 'react';

const TRUST_BADGES = [
  { icon: '🧪', text: 'Purity Tested' },
  { icon: '🌅', text: 'Milked Today' },
  { icon: '🚚', text: 'Farm to Home' },
  { icon: '💚', text: '100% Natural' }
];

export default function HeroSection() {
  return (
    <section className="hero">
      <img
        src="/assets/hero-bg.jpg"
        alt="Lush pasture with cows grazing"
        className="hero-bg"
        onError={(e) => {
          // If public/assets/hero-bg.jpg doesn't exist yet, fall back gracefully
          e.target.src = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80';
        }}
      />
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-badge">
          <span>🌿</span> 100% Farm Fresh • Since 2024
        </div>
        <h1 className="hero-title">
          Pure Dairy, <br />
          Nature's <span>Best</span>
        </h1>
        <p className="hero-subtitle">
          From our pasture to your doorstep. Experience the finest cow milk, rich golden ghee, fresh paneer, and authentic dairy sweets crafted daily with strict hygiene standards.
        </p>

        <div className="hero-trust animate-fade-in">
          {TRUST_BADGES.map((badge, idx) => (
            <div key={idx} className="trust-badge">
              <span className="trust-badge-icon">{badge.icon}</span>
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
