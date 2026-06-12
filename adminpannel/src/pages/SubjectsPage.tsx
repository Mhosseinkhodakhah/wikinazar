import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { useI18n } from '../i18n';

interface SubjectData {
  id: string; title: string; slug: string; description: string | null;
  category: string | null; icon: string | null; experienceCount: number; createdAt: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', slug: '', description: '', category: '', icon: '' });
  const { t, dir } = useI18n();
  const page = 1; const limit = 50;

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getAllSubjects({ page, limit, search: search || undefined });
      setSubjects(result.subjects as unknown as SubjectData[]);
      setTotal(result.total);
    } catch { setError('Failed to load'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const resetForm = () => {
    setForm({ title: '', slug: '', description: '', category: '', icon: '' });
    setEditingId(null); setShowForm(false); setError('');
  };

  const handleEdit = (s: SubjectData) => {
    setForm({ title: s.title, slug: s.slug, description: s.description || '', category: s.category || '', icon: s.icon || '' });
    setEditingId(s.id); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      if (editingId) {
        await api.updateSubject(editingId, { title: form.title, slug: form.slug, description: form.description || undefined, category: form.category || undefined, icon: form.icon || undefined });
      } else {
        await api.createSubject({ title: form.title, slug: form.slug, description: form.description || undefined, category: form.category || undefined, icon: form.icon || undefined });
      }
      resetForm(); await fetchSubjects();
    } catch (err) { setError(err instanceof Error ? err.message : 'Operation failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.app.confirmDelete)) return;
    try { await api.deleteSubject(id); await fetchSubjects(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Delete failed'); }
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' as const, gap: '0.75rem' },
    title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
    input: { padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', background: '#fff' },
    btnPrimary: { padding: '0.55rem 1.1rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 10px rgba(99,102,241,0.3)' },
    formCard: { background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },
    formTitle: { fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.25rem' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#475569', marginBottom: 6 },
    formInput: { width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' as React.CSSProperties['boxSizing'] },
    textarea: { width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' as React.CSSProperties['boxSizing'], minHeight: 80, resize: 'vertical' as const },
    btnRow: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
    btnCancel: { padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', fontSize: '0.85rem' },
    card: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { textAlign: dir === 'rtl' ? 'right' as const : 'left' as const, padding: '0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 1, borderBottom: '2px solid #e2e8f0', background: '#f8fafc' },
    td: { padding: '0.75rem', fontSize: '0.85rem', color: '#475569', borderBottom: '1px solid #f1f5f9' },
    catTag: { display: 'inline-block', background: '#fef3c7', color: '#d97706', fontSize: '0.65rem', padding: '2px 8px', borderRadius: 10, fontWeight: 600 },
    actionBtn: (color: string) => ({ padding: '0.3rem 0.6rem', borderRadius: 6, border: 'none', background: color, color: '#fff', cursor: 'pointer', fontSize: '0.75rem', marginRight: 4 }),
    error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', padding: '0.65rem 0.85rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.8rem' },
    empty: { textAlign: 'center' as const, padding: '3rem', color: '#94a3b8' },
  };

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>{t.subjects.title}</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input type="text" placeholder={t.app.search} value={search} onChange={(e) => setSearch(e.target.value)} style={s.input} />
          <button onClick={() => { resetForm(); setShowForm(true); }} style={s.btnPrimary}>+ {t.subjects.newSubject}</button>
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={s.formCard}>
          <h2 style={s.formTitle}>{editingId ? t.subjects.editSubject : t.subjects.newSubject}</h2>
          <div style={s.formRow}>
            <div>
              <label style={s.label}>{t.subjects.title_}</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={s.formInput} />
            </div>
            <div>
              <label style={s.label}>{t.subjects.slug}</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required style={s.formInput} />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={s.label}>{t.subjects.description}</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={s.textarea} />
          </div>
          <div style={s.formRow}>
            <div>
              <label style={s.label}>{t.subjects.category}</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={s.formInput} />
            </div>
            <div>
              <label style={s.label}>{t.subjects.icon}</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} style={s.formInput} />
            </div>
          </div>
          <div style={s.btnRow}>
            <button type="submit" style={s.btnPrimary}>{editingId ? t.app.update : t.app.create}</button>
            <button type="button" onClick={resetForm} style={s.btnCancel}>{t.app.cancel}</button>
          </div>
        </form>
      )}

      <div style={s.card}>
        {loading ? (
          <div style={s.empty}>{t.app.loading}</div>
        ) : subjects.length === 0 ? (
          <div style={s.empty}>{t.app.noData}</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t.subjects.title_}</th>
                <th style={s.th}>{t.subjects.slug}</th>
                <th style={s.th}>{t.subjects.category}</th>
                <th style={s.th}>{t.subjects.experienceCount}</th>
                <th style={s.th}>{t.subjects.createdAt}</th>
                <th style={s.th}>{t.app.actions}</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subj) => (
                <tr key={subj.id}>
                  <td style={s.td}>{subj.title}</td>
                  <td style={{ ...s.td, color: '#94a3b8', fontSize: '0.8rem' }}>{subj.slug}</td>
                  <td style={s.td}>{subj.category ? <span style={s.catTag}>{subj.category}</span> : '-'}</td>
                  <td style={s.td}>{subj.experienceCount}</td>
                  <td style={{ ...s.td, fontSize: '0.78rem', color: '#94a3b8' }}>{new Date(subj.createdAt).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <button onClick={() => handleEdit(subj)} style={s.actionBtn('#6366f1')}>{t.app.edit}</button>
                    <button onClick={() => handleDelete(subj.id)} style={s.actionBtn('#ef4444')}>{t.app.delete}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
