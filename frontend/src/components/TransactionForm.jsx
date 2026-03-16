import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function TransactionForm({ onClose, onSaved, transaction }) {
  const [form, setForm] = useState({
    title: '', amount: '', type: 'expense', category: '',
    date: new Date().toISOString().split('T')[0],
    description: '', paymentMethod: 'other'
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
    if (transaction) {
      setForm({
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: new Date(transaction.date).toISOString().split('T')[0],
        description: transaction.description || '',
        paymentMethod: transaction.paymentMethod || 'other'
      });
    }
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filteredCats = categories.filter(c => c.type === form.type || c.type === 'both');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (transaction) {
        await api.put(`/transactions/${transaction._id}`, form);
        toast.success('Transaction updated!');
      } else {
        await api.post('/transactions', form);
        toast.success('Transaction added!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.2rem' }}>{transaction ? 'Edit' : 'Add'} Transaction</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--muted)', fontSize: '1.4rem', padding: 0 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Type toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['expense', 'income'].map(t => (
              <button key={t} type="button" onClick={() => { set('type', t); set('category', ''); }}
                style={{
                  padding: '10px', borderRadius: 10, border: '1px solid',
                  borderColor: form.type === t ? (t === 'income' ? 'var(--green)' : 'var(--red)') : 'var(--border)',
                  background: form.type === t ? (t === 'income' ? 'rgba(34,217,138,0.1)' : 'rgba(255,91,127,0.1)') : 'var(--bg3)',
                  color: form.type === t ? (t === 'income' ? 'var(--green)' : 'var(--red)') : 'var(--muted)',
                  fontWeight: 600, textTransform: 'capitalize'
                }}>
                {t === 'income' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Lunch at Subway" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Amount</label>
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" required />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} required>
              <option value="">Select category</option>
              {filteredCats.map(c => <option key={c._id} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Payment Method</label>
            <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
              {['cash','card','bank_transfer','upi','other'].map(m => <option key={m} value={m}>{m.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Description (optional)</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Add a note..." style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Saving...' : (transaction ? 'Update' : 'Add Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
