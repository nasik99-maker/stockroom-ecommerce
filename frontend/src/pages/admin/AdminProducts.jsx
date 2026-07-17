import { useEffect, useState } from 'react';
import client, { getErrorMessage } from '../../api/client';

const emptyForm = { name: '', description: '', price: '', image_url: '', category_id: '', stock: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function loadProducts() {
    client.get('/products', { params: { limit: 50 } }).then((res) => setProducts(res.data.products));
  }

  useEffect(() => {
    loadProducts();
    client.get('/products/categories').then((res) => setCategories(res.data.categories));
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowModal(true);
  }

  function openEdit(p) {
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      image_url: p.image_url || '',
      category_id: p.category_id || '',
      stock: p.stock,
    });
    setEditingId(p.id);
    setError('');
    setShowModal(true);
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || form.price === '') {
      setError('Name and price are required.');
      return;
    }
    if (Number(form.price) < 0 || Number(form.stock) < 0) {
      setError('Price and stock cannot be negative.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      image_url: form.image_url,
      category_id: form.category_id ? Number(form.category_id) : null,
      stock: Number(form.stock) || 0,
    };

    try {
      if (editingId) {
        await client.put(`/products/${editingId}`, payload);
      } else {
        await client.post('/products', payload);
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await client.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h3 style={{ fontSize: '1rem', margin: 0 }}>{products.length} Products</h3>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Add Product</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td><img className="table-thumb" src={p.image_url} alt="" /></td>
              <td>{p.name}</td>
              <td>{p.category_name || '—'}</td>
              <td className="mono">${p.price.toFixed(2)}</td>
              <td className="mono">{p.stock}</td>
              <td>
                <button className="btn btn-sm" onClick={() => openEdit(p)} style={{ marginRight: 8 }}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem' }}>{editingId ? 'Edit Product' : 'Add Product'}</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => updateField('price', e.target.value)} />
                </div>
                <div className="field">
                  <label>Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Category</label>
                <select value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)}>
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Image URL</label>
                <input value={form.image_url} onChange={(e) => updateField('image_url', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : editingId ? 'Save Changes' : 'Create Product'}
                </button>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
