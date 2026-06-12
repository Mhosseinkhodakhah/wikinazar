import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { useI18n } from '../i18n';

const ALL_PERMISSIONS = ['dashboard', 'admins', 'users', 'subjects', 'experiences', 'requests', 'settings'] as const;

interface AdminData {
  id: string; username: string; displayName: string | null;
  isSuperAdmin: boolean; permissions: string[]; createdAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', displayName: '', permissions: [] as string[] });
  const { t, dir } = useI18n();

  const fetchAdmins = useCallback(async () => {
    try { setAdmins(await api.getAllAdmins()); }
    catch { setError(t.admins.loadError); }
    finally { setLoading(false); }
  }, [t]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const resetForm = () => {
    setForm({ username: '', password: '', displayName: '', permissions: [] });
    setEditingId(null); setShowForm(false); setError('');
  };

  const handleEdit = (a: AdminData) => {
    if (a.isSuperAdmin) return;
    setForm({ username: a.username, password: '', displayName: a.displayName || '', permissions: a.permissions });
    setEditingId(a.id); setShowForm(true);
  };

  const togglePerm = (perm: string) => {
    setForm((p) => ({
      ...p,
      permissions: p.permissions.includes(perm) ? p.permissions.filter((x) => x !== perm) : [...p.permissions, perm],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      if (editingId) {
        const payload: Record<string, unknown> = { username: form.username, displayName: form.displayName || null, permissions: form.permissions };
        if (form.password) payload.password = form.password;
        await api.updateAdmin(editingId, payload);
      } else {
        await api.createAdmin({ username: form.username, password: form.password, displayName: form.displayName || null, permissions: form.permissions });
      }
      resetForm(); await fetchAdmins();
    } catch (err) { setError(err instanceof Error ? err.message : t.admins.operationFailed); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.app.confirmDelete)) return;
    try { await api.deleteAdmin(id); await fetchAdmins(); }
    catch (err) { setError(err instanceof Error ? err.message : t.admins.deleteFailed); }
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
    btnPrimary: {
      padding: '0.55rem 1.1rem', borderRadius: 8, border: 'none',
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff',
      fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(99,102,241,0.3)',
    },
    formCard: {
      background: '#fff', borderRadius: 12, padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.5rem',
    },
    formTitle: { fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.25rem' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#475569', marginBottom: 6 },
    input: {
      width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0',
      fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
    },
    permGrid: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const, marginBottom: '1rem' },
    permChip: (selected: boolean) => ({
      padding: '0.35rem 0.8rem', borderRadius: 20, border: 'none', cursor: 'pointer',
      fontSize: '0.8rem', fontWeight: 500,
      background: selected ? '#6366f1' : '#f1f5f9',
      color: selected ? '#fff' : '#475569',
      transition: 'all 0.15s ease',
    }),
    btnRow: { display: 'flex', gap: '0.5rem' },
    btnCancel: {
      padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #e2e8f0',
      background: '#fff', color: '#475569', cursor: 'pointer', fontSize: '0.85rem',
    },
    card: {
      background: '#fff', borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
    },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: {
      textAlign: dir === 'rtl' ? 'right' as const : 'left' as const,
      padding: '0.75rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b',
      textTransform: 'uppercase' as const, letterSpacing: 1, borderBottom: '2px solid #e2e8f0',
      background: '#f8fafc',
    },
    td: { padding: '0.75rem', fontSize: '0.85rem', color: '#475569', borderBottom: '1px solid #f1f5f9' },
    superBadge: { background: '#6366f1', color: '#fff', fontSize: '0.65rem', padding: '2px 10px', borderRadius: 10, fontWeight: 600 },
    adminBadge: { background: '#f1f5f9', color: '#475569', fontSize: '0.65rem', padding: '2px 10px', borderRadius: 10, fontWeight: 600 },
    permTag: {
      display: 'inline-block', background: '#eef2ff', color: '#6366f1',
      fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4, margin: '1px',
    },
    actionBtn: (color: string) => ({
      padding: '0.3rem 0.6rem', borderRadius: 6, border: 'none',
      background: color, color: '#fff', cursor: 'pointer', fontSize: '0.75rem', marginRight: 4,
    }),
    error: {
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
      color: '#dc2626', padding: '0.65rem 0.85rem', borderRadius: 8,
      marginBottom: '1rem', fontSize: '0.8rem',
    },
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>{t.app.loading}</div>;

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>{t.admins.title}</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={s.btnPrimary}>
          + {t.admins.newAdmin}
        </button>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={s.formCard}>
          <h2 style={s.formTitle}>{editingId ? t.admins.editAdmin : t.admins.createAdmin}</h2>
          <div style={s.formRow}>
            <div>
              <label style={s.label}>{t.admins.username}</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required style={s.input} />
            </div>
            <div>
              <label style={s.label}>{editingId ? t.admins.newPassword : t.admins.password}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingId} style={s.input} />
            </div>
            <div>
              <label style={s.label}>{t.admins.displayName}</label>
              <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} style={s.input} />
            </div>
          </div>
          <label style={s.label}>{t.admins.permissions}</label>
          <div style={s.permGrid}>
            {ALL_PERMISSIONS.map((perm) => (
              <button key={perm} type="button" onClick={() => togglePerm(perm)} style={s.permChip(form.permissions.includes(perm))}>
                {perm.charAt(0).toUpperCase() + perm.slice(1)}
              </button>
            ))}
          </div>
          <div style={s.btnRow}>
            <button type="submit" style={s.btnPrimary}>{editingId ? t.app.update : t.app.create}</button>
            <button type="button" onClick={resetForm} style={s.btnCancel}>{t.app.cancel}</button>
          </div>
        </form>
      )}

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>{t.admins.username}</th>
              <th style={s.th}>{t.admins.displayName}</th>
              <th style={s.th}>{t.admins.role_}</th>
              <th style={s.th}>{t.admins.permissions}</th>
              <th style={s.th}>{t.admins.created}</th>
              <th style={s.th}>{t.app.actions}</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id}>
                <td style={s.td}>{a.username}</td>
                <td style={{ ...s.td, color: '#94a3b8' }}>{a.displayName || '-'}</td>
                <td style={s.td}>
                  <span style={a.isSuperAdmin ? s.superBadge : s.adminBadge}>
                    {a.isSuperAdmin ? t.admins.super : t.admins.admin}
                  </span>
                </td>
                <td style={s.td}>
                  {a.permissions.map((p) => <span key={p} style={s.permTag}>{p}</span>)}
                </td>
                <td style={{ ...s.td, fontSize: '0.78rem', color: '#94a3b8' }}>
                  {new Date(a.createdAt).toLocaleDateString()}
                </td>
                <td style={s.td}>
                  {!a.isSuperAdmin && (
                    <>
                      <button onClick={() => handleEdit(a)} style={s.actionBtn('#6366f1')}>{t.app.edit}</button>
                      <button onClick={() => handleDelete(a.id)} style={s.actionBtn('#ef4444')}>{t.app.delete}</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
