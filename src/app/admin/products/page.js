'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { dbGetProducts, dbSaveProduct, dbDeleteProduct } from '@/lib/db';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const { showToast } = useToast();

  // Add Product modal / form states
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Milk & Cream');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');

  // Load products list from database (Supabase/localStorage)
  const loadInventory = async () => {
    try {
      const data = await dbGetProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockToggle = async (id) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    const updatedProduct = { ...prod, inStock: !prod.inStock };
    
    // Save state locally first
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? updatedProduct : p))
    );

    // Save to Database
    const success = await dbSaveProduct(updatedProduct);
    if (success) {
      showToast(`${prod.name} stock toggled!`, 'info');
    } else {
      showToast('Failed to update product in database', 'error');
      // Revert local state
      loadInventory();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product from database?')) {
      // Save state locally first
      setProducts((prev) => prev.filter((p) => p.id !== id));

      const success = await dbDeleteProduct(id);
      if (success) {
        showToast('Product deleted successfully', 'success');
      } else {
        showToast('Failed to delete product from database', 'error');
        // Revert local state
        loadInventory();
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !weight) {
      showToast('Name, Price, and Weight are required', 'error');
      return;
    }

    const newProduct = {
      id: `prod-${Date.now()}`,
      name,
      category,
      price: parseInt(price) || 0,
      mrp: parseInt(mrp) || parseInt(price) || 0,
      weight,
      image: '/milk.jpg', // Default fallback image asset
      deliveryTime: '20 mins',
      inStock: true,
      description
    };

    // Save state locally first
    setProducts((prev) => [newProduct, ...prev]);

    // Save to database
    const success = await dbSaveProduct(newProduct);
    if (success) {
      showToast(`${name} added to catalog!`, 'success');
      setModalOpen(false);
      
      // Clear forms
      setName('');
      setCategory('Milk & Cream');
      setPrice('');
      setMrp('');
      setWeight('');
      setDescription('');
    } else {
      showToast('Failed to add product to database', 'error');
      loadInventory();
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--charcoal)', fontSize: '2rem', fontWeight: '800' }}>Manage Store Inventory</h1>
          <p style={{ color: 'var(--gray-medium)', fontSize: '0.88rem' }}>Add new dairy products, toggle stock availability, edit details, or remove items.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, var(--green-primary), var(--green-light))',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 20px',
            fontSize: '0.88rem',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(44,107,70,0.25)',
            cursor: 'pointer'
          }}
        >
          ➕ Add New Product
        </button>
      </div>

      {/* Grid List */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--gray-pale)', color: 'var(--charcoal-light)', borderBottom: '1px solid var(--gray-light)', fontWeight: '700' }}>
                <th style={{ padding: '16px' }}>Image</th>
                <th style={{ padding: '16px' }}>Product Details</th>
                <th style={{ padding: '16px' }}>Category</th>
                <th style={{ padding: '16px' }}>Sale Price</th>
                <th style={{ padding: '16px' }}>MRP</th>
                <th style={{ padding: '16px' }}>Availability</th>
                <th style={{ padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-medium)', fontWeight: '600' }}>
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-pale)', transition: 'background 150ms' }}>
                    <td style={{ padding: '16px' }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', background: 'var(--cream)' }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=150&q=80'; }}
                      />
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--charcoal)' }}>{p.name}</div>
                      <div style={{ color: 'var(--gray-medium)', fontSize: '0.75rem' }}>📦 Weight: {p.weight}</div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--charcoal-light)', fontWeight: '600' }}>{p.category}</td>
                    <td style={{ padding: '16px', fontWeight: '800', color: 'var(--green-deep)' }}>₹{p.price}</td>
                    <td style={{ padding: '16px', color: 'var(--gray-medium)', textDecoration: p.mrp > p.price ? 'line-through' : 'none' }}>₹{p.mrp}</td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => handleStockToggle(p.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                          background: p.inStock ? 'var(--green-pale)' : '#F8D7DA',
                          color: p.inStock ? 'var(--green-deep)' : '#721C24'
                        }}
                      >
                        {p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                      </button>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal Overlay */}
      {modalOpen && (
        <div className="modal-overlay open" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            <div className="modal-header">
              <div className="modal-header-icon">➕</div>
              <h2>Add Product to Catalog</h2>
              <p>Add a new item to store database listing grids instantly.</p>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-name">Product Title</label>
                  <input
                    id="prod-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pure Desi Cow Milk"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                    <label className="form-label" htmlFor="prod-cat">Category</label>
                    <select
                      id="prod-cat"
                      className="form-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Milk & Cream">Milk & Cream</option>
                      <option value="Butter & Ghee">Butter & Ghee</option>
                      <option value="Paneer & Cheese">Paneer & Cheese</option>
                      <option value="Curd & Yogurt">Curd & Yogurt</option>
                      <option value="Ice Cream">Ice Cream</option>
                      <option value="Dairy Sweets">Dairy Sweets</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                    <label className="form-label" htmlFor="prod-wt">Weight / Vol</label>
                    <input
                      id="prod-wt"
                      type="text"
                      className="form-input"
                      placeholder="e.g. 500 ml, 200 g"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                    <label className="form-label" htmlFor="prod-price">Sale Price (₹)</label>
                    <input
                      id="prod-price"
                      type="number"
                      className="form-input"
                      placeholder="e.g. 60"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                    <label className="form-label" htmlFor="prod-mrp">MRP (₹)</label>
                    <input
                      id="prod-mrp"
                      type="number"
                      className="form-input"
                      placeholder="e.g. 65"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-desc">Product Description</label>
                  <textarea
                    id="prod-desc"
                    className="form-input"
                    rows="3"
                    placeholder="Describe the freshness or purity of the dairy product..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="form-submit" style={{ marginTop: '16px' }}>
                  Save & Publish Product
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
