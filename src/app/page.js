'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CategoryBar from '@/components/CategoryBar';
import HeroSection from '@/components/HeroSection';
import PurityBoard from '@/components/PurityBoard';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import LocationPicker from '@/components/LocationPicker';
import LoginModal from '@/components/LoginModal';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { dbGetAllOrders, dbGetProducts } from '@/lib/db';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  
  // Modals state
  const [loginOpen, setLoginOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  
  const { getCartCount, getCartTotal } = useCart();
  const { showToast } = useToast();
  const { user, isAdmin, isDelivery } = useAuth();
  const router = useRouter();

  // Subscription form states
  const [subQty, setSubQty] = useState(1);
  const [subPlan, setSubPlan] = useState('daily'); // 'daily' | 'alternate' | 'weekends'

  // Load products list from database
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await dbGetProducts();
        setProducts(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCatalog();
  }, []);

  // Redirect admin/delivery to their panels
  useEffect(() => {
    if (user && user.loggedIn) {
      if (isAdmin()) {
        router.push('/admin');
        return;
      }
      if (isDelivery()) {
        router.push('/delivery');
        return;
      }
    }
  }, [user]);

  // Sync active order status
  useEffect(() => {
    const checkActiveOrder = async () => {
      const saved = localStorage.getItem('uttam_active_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        try {
          const allOrders = await dbGetAllOrders();
          const sharedOrder = (allOrders || []).find((order) => order.id === parsed.id);
          const latestOrder = sharedOrder || parsed;

          if (latestOrder.status === 'Delivered' || latestOrder.status === 'Cancelled') {
            localStorage.removeItem('uttam_active_order');
            setActiveOrder(null);
          } else {
            localStorage.setItem('uttam_active_order', JSON.stringify(latestOrder));
            setActiveOrder(latestOrder);
          }
        } catch (e) {
          console.error('Error checking active order status:', e);
          if (parsed.status !== 'Delivered' && parsed.status !== 'Cancelled') {
            setActiveOrder(parsed);
          } else {
            localStorage.removeItem('uttam_active_order');
            setActiveOrder(null);
          }
        }
      } else {
        setActiveOrder(null);
      }
    };

    checkActiveOrder();
    const interval = setInterval(checkActiveOrder, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery) ||
                          product.category.toLowerCase().includes(searchQuery) ||
                          (product.description && product.description.toLowerCase().includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    showToast(`Milk Subscription activated! ${subQty}L delivered ${subPlan}.`, 'success');
    setSubModalOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenLogin={() => setLoginOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        onOpenLocation={() => setLocationOpen(true)}
        onSearch={handleSearch}
      />

      <CategoryBar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <main className="main-content">
        <HeroSection />
        
        <PurityBoard />

        {/* PRODUCTS SECTION */}
        <section className="products-section">
          <div className="products-header">
            <h2 className="products-title">
              {activeCategory === 'All' ? 'Our Fresh Catalog' : activeCategory}
            </h2>
            <span className="products-count">
              Showing {filteredProducts.length} items
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="products-empty">
              <div className="products-empty-icon">🥛</div>
              <p className="products-empty-text">No products match your search. Try looking for "Milk" or "Ghee".</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* SUBSCRIPTION PROMO BANNER */}
        <section className="subscription-section">
          <div className="subscription-card">
            <div className="subscription-left">
              <h3>Subscribe & Save 5% Daily</h3>
              <p>Get fresh milk delivered to your door every morning before 7:00 AM. Pause, modify or resume deliveries easily.</p>
            </div>
            <button className="subscription-btn ripple-effect" onClick={() => setSubModalOpen(true)}>
              📅 Create Subscription
            </button>
          </div>
        </section>

        {/* MOCK MAP / AREA INFO */}
        <section style={{ padding: '0 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(0,0,0,0.06)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', marginBottom: '4px' }}>🗺️ Delivering to Dwarka & Nearby Sectors</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--charcoal-light)' }}>Get free delivery on orders above ₹299. Freshness guaranteed or your money back.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ padding: '6px 12px', background: 'var(--green-pale)', color: 'var(--green-deep)', fontSize: '0.78rem', fontWeight: '700', borderRadius: 'var(--radius-sm)' }}>⚡ 10 Min Delivery</span>
              <span style={{ padding: '6px 12px', background: 'var(--green-pale)', color: 'var(--green-deep)', fontSize: '0.78rem', fontWeight: '700', borderRadius: 'var(--radius-sm)' }}>⏰ 6:00 AM - 10:00 PM</span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-brand-name">🐄 Uttam Dairy</div>
            <p className="footer-brand-desc">
              Purity is our promise. We deliver pasture-fresh cow milk, golden desi ghee, and pure dairy products directly from local farms. Strict quality checks at every level.
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">About Farm</a></li>
              <li><a href="#">Purity Certificate</a></li>
              <li><a href="#">Subscription Plans</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Delivery Area</a></li>
              <li><a href="#">Refund Policy</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Get in Touch</h4>
            <ul>
              <li>📧 contact@uttamdairy.com</li>
              <li>📞 +91 99999 99999</li>
              <li>📍 Dwarka Sector 10, New Delhi</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Uttam Dairy. All rights reserved.</p>
          <div className="footer-socials">
            <a href="#" className="footer-social-link">📘</a>
            <a href="#" className="footer-social-link">📸</a>
            <a href="#" className="footer-social-link">💬</a>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY FLOATING CART BAR */}
      {getCartCount() > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          right: '16px',
          background: 'var(--green-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 20px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 900,
          cursor: 'pointer'
        }} onClick={() => setCartOpen(true)}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem' }}>🛒</span>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>{getCartCount()} Item{getCartCount() > 1 ? 's' : ''}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>Total: ₹{getCartTotal()}</div>
            </div>
          </div>
          <button style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Cart <span>➔</span>
          </button>
        </div>
      )}

      {/* PERSISTENT FLOATING ACTIVE ORDER TRACKING BAR */}
      {activeOrder && (
        <Link href="/orders/active" style={{
          position: 'fixed',
          bottom: getCartCount() > 0 ? '84px' : '16px',
          left: '16px',
          right: '16px',
          background: 'var(--green-deep)',
          border: '2px solid var(--gold-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 20px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 890,
          textDecoration: 'none',
          transition: 'all 300ms ease'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.3rem', animation: 'ripple 2s infinite' }}>🛵</span>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Active Order: {activeOrder.id}
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: activeOrder.status === 'Pending' ? 'var(--gold-primary)' : 'var(--success)',
                  animation: 'ripple 1.5s infinite'
                }}></span>
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: '500' }}>
                Status: {activeOrder.status === 'Pending' ? 'Preparing (Modify Window Open)' : 'Confirmed & Packing'} • Delivery in 10 mins
              </div>
            </div>
          </div>
          <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Track Order ➔
          </span>
        </Link>
      )}

      {/* MODALS */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <LocationPicker isOpen={locationOpen} onClose={() => setLocationOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Subscription Scheduler Modal */}
      {subModalOpen && (
        <div className="modal-overlay open" onClick={() => setSubModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSubModalOpen(false)}>&times;</button>
            <div className="modal-header">
              <div className="modal-header-icon">📅</div>
              <h2>Build Milk Subscription</h2>
              <p>Configure your custom plan. Pay at the end of the month. Pause or edit anytime.</p>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubscribeSubmit}>
                <div className="form-group">
                  <label className="form-label">Select Product</label>
                  <select className="form-input" defaultValue="milk">
                    <option value="milk">Uttam Premium Cow Milk (500ml)</option>
                    <option value="milk-1">Uttam Pure Family Milk (1L)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sub-qty">Daily Quantity (Litre)</label>
                  <input
                    id="sub-qty"
                    type="number"
                    min="1"
                    max="10"
                    className="form-input"
                    value={subQty}
                    onChange={(e) => setSubQty(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Schedule</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    {['daily', 'alternate', 'weekends'].map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: '2px solid',
                          borderColor: subPlan === plan ? 'var(--green-primary)' : 'var(--gray-light)',
                          background: subPlan === plan ? 'var(--green-pale)' : 'white',
                          color: subPlan === plan ? 'var(--green-deep)' : 'var(--charcoal-light)',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          borderRadius: 'var(--radius-sm)',
                          textTransform: 'capitalize'
                        }}
                        onClick={() => setSubPlan(plan)}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'var(--gray-pale)', padding: '12px', borderRadius: 'var(--radius-sm)', margin: '18px 0', fontSize: '0.8rem', color: 'var(--charcoal-light)' }}>
                  💡 **Cost Estimation:** Daily delivery of {subQty}L at ₹64/L will cost approx. **₹{subQty * 64 * (subPlan === 'daily' ? 30 : subPlan === 'alternate' ? 15 : 8)}/month**. Bills generated on the 1st of every month.
                </div>

                <button type="submit" className="form-submit">
                  Confirm Subscription
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
