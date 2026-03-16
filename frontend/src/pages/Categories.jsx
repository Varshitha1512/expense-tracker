import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ICONS = ['🍔','🚗','🛍️','🎬','💊','💡','🏠','📚','💼','💻','📈','📦','✈️','🎵','🏋️','🐾','👶','💈','🍺','☕'];
const COLORS = ['#f59e0b','#3b82f6','#ec4899','#8b5cf6','#ef4444','#f97316','#14b8a6','#22c55e','#10b981','#06b6d4','#6366f1','#94a3b8'];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState({ name: '', type: 'expense', icon: '📦', color: '#6366f1', budget: '' });

  const fetchCats = async () => {
    const res = await api.get('/categories');
    setCategories(res.data);
  };

  useEffect(() => { fetchCats(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', type: 'expense', icon: '📦', color: '#6366f1', budget: '' }); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, type: c.type, icon: c.icon, color: c.color, budget: c.budget || '' }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
      }
      fetchCats();
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Deleted');
      fetchCats();
    } catch {
      toast.error('Delete failed');
    }
  };

  const grouped = {
    expense: categories.filter(c => c.type === 'expense'),
    income:  categories.filter(c => c.type === 'income'),
    both:    categories.filter(c => c.type === 'both'),
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Categories</h1>
          <p style={{ color: 'var(--muted)' }}>Organise your spending & income</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ New Category</button>
      </div>

      {Object.entries(grouped).map(([type, cats]) => cats.length > 0 && (
        <div key={type} style={{ marginBottom: 32 }}>
          <h3 style={{ textTransform: 'capitalize', marginBottom: 14, color: type === 'income' ? 'var(--green)' : type === 'expense' ? 'var(--red)' : 'var(--muted)', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
            {type}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {cats.map(c => (
              <div key={c._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: c.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    {c.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.name}</p>
                    {c.budget > 0 && <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>Budget: ${c.budget}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => openEdit(c)}>✏️</button>
                  <button className="btn-danger" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => handleDelete(c._id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3>{editing ? 'Edit' : 'New'} Category</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', color: 'var(--muted)', fontSize: '1.4rem', padding: 0 }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Groceries" required />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(p => ({ ...p, icon: ic }))}
                      style={{ width: 38, height: 38, borderRadius: 8, border: '2px solid', borderColor: form.icon === ic ? 'var(--accent)' : 'var(--border)', background: form.icon === ic ? 'rgba(124,106,255,0.15)' : 'var(--bg3)', fontSize: '1.1rem' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Color</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {COLORS.map(col => (
                    <button key={col} type="button" onClick={() => setForm(p => ({ ...p, color: col }))}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: col, border: form.color === col ? '3px solid white' : '2px solid transparent', outline: form.color === col ? `2px solid ${col}` : 'none' }} />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Monthly Budget (optional)</label>
                <input type="number" min="0" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} placeholder="0.00" />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>{editing ? 'Update' : 'Create'} Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
