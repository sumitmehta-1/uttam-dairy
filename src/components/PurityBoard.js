'use client';

import React from 'react';

const STATS = [
  { value: '6.2%', label: 'Fat Content' },
  { value: '8.7%', label: 'SNF' },
  { value: '4°C', label: 'Temperature' },
  { value: '99.8%', label: 'Purity Score' },
  { value: '4:30 AM', label: 'Milked At' }
];

export default function PurityBoard() {
  return (
    <section className="purity-section">
      <div className="purity-board">
        <div className="purity-left">
          <span className="purity-title">Quality Assurance</span>
          <h2 className="purity-heading">Today's Milk Purity Report</h2>
        </div>
        <div className="purity-stats">
          {STATS.map((stat, idx) => (
            <div key={idx} className="purity-stat">
              <span className="purity-stat-value">{stat.value}</span>
              <span className="purity-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
