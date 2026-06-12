import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useI18n } from '../i18n';

interface DashboardData {
  totalUsers: number;
  totalSubjects: number;
  totalExperiences: number;
  totalRequests: number;
  totalAdmins: number;
  recentUsers: Array<{ id: string; username: string; email: string; role: string; createdAt: string }>;
  recentSubjects: Array<{ id: string; title: string; slug: string; experienceCount: number; createdAt: string }>;
  recentExperiences: Array<{ id: string; content: string; rating: number; authorId: string; subjectId: string; createdAt: string }>;
  recentRequests: Array<{ id: string; title: string; status: string; votes: number; createdAt: string }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, dir } = useI18n();

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = {
    pageTitle: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: (color: string) => ({
      background: '#fff', borderRadius: 12, padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
    }),
    statValue: { fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginTop: 4 },
    statLabel: { fontSize: '0.8rem', color: '#64748b', fontWeight: 500 },
    section: {
      background: '#fff', borderRadius: 12, padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem',
    },
    sectionTitle: { fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { textAlign: dir === 'rtl' ? 'right' as const : 'left' as const, padding: '0.6rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 1, borderBottom: '2px solid #e2e8f0' },
    td: { padding: '0.6rem 0.5rem', fontSize: '0.85rem', color: '#475569', borderBottom: '1px solid #f1f5f9' },
    badge: (bg: string) => ({
      fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10, fontWeight: 600,
      background: bg, color: '#fff',
    }),
    empty: { textAlign: 'center' as const, padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' },
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>{t.app.loading}</div>;

  const stats = [
    { label: t.dashboard.totalUsers, value: data?.totalUsers ?? 0, color: '#6366f1' },
    { label: t.dashboard.totalSubjects, value: data?.totalSubjects ?? 0, color: '#10b981' },
    { label: t.dashboard.totalExperiences, value: data?.totalExperiences ?? 0, color: '#f59e0b' },
    { label: t.dashboard.totalRequests, value: data?.totalRequests ?? 0, color: '#ec4899' },
    { label: t.dashboard.totalAdmins, value: data?.totalAdmins ?? 0, color: '#8b5cf6' },
  ];

  return (
    <div>
      <h1 style={s.pageTitle}>{t.dashboard.title}</h1>

      <div style={s.grid}>
        {stats.map((stat) => (
          <div key={stat.label} style={s.statCard(stat.color)}>
            <div style={s.statLabel}>{stat.label}</div>
            <div style={s.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={s.twoCol}>
        <div style={s.section}>
          <h2 style={s.sectionTitle}>{t.dashboard.recentUsers}</h2>
          {data?.recentUsers && data.recentUsers.length > 0 ? (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>{t.dashboard.username}</th>
                  <th style={s.th}>{t.dashboard.email}</th>
                  <th style={s.th}>{t.dashboard.role}</th>
                  <th style={s.th}>{t.dashboard.date}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={s.td}>{u.username}</td>
                    <td style={{ ...s.td, fontSize: '0.8rem', color: '#64748b' }}>{u.email}</td>
                    <td style={s.td}>
                      <span style={s.badge(u.role === 'EXPERT' ? '#8b5cf6' : '#6366f1')}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ ...s.td, fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div style={s.empty}>{t.app.noData}</div>}
        </div>

        <div style={s.section}>
          <h2 style={s.sectionTitle}>{t.dashboard.recentSubjects}</h2>
          {data?.recentSubjects && data.recentSubjects.length > 0 ? (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>{t.dashboard.title_}</th>
                  <th style={s.th}>{t.dashboard.rating}</th>
                  <th style={s.th}>{t.dashboard.date}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSubjects.map((sj) => (
                  <tr key={sj.id}>
                    <td style={s.td}>{sj.title}</td>
                    <td style={s.td}>{sj.experienceCount}</td>
                    <td style={{ ...s.td, fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(sj.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div style={s.empty}>{t.app.noData}</div>}
        </div>
      </div>

      <div style={s.twoCol}>
        <div style={s.section}>
          <h2 style={s.sectionTitle}>{t.dashboard.recentExperiences}</h2>
          {data?.recentExperiences && data.recentExperiences.length > 0 ? (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>{t.experiences.content}</th>
                  <th style={s.th}>{t.dashboard.rating}</th>
                  <th style={s.th}>{t.dashboard.date}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentExperiences.map((e) => (
                  <tr key={e.id}>
                    <td style={{ ...s.td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.content}
                    </td>
                    <td style={s.td}>{e.rating}</td>
                    <td style={{ ...s.td, fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div style={s.empty}>{t.app.noData}</div>}
        </div>

        <div style={s.section}>
          <h2 style={s.sectionTitle}>{t.dashboard.recentRequests}</h2>
          {data?.recentRequests && data.recentRequests.length > 0 ? (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>{t.requests.title_}</th>
                  <th style={s.th}>{t.dashboard.status}</th>
                  <th style={s.th}>{t.dashboard.votes}</th>
                  <th style={s.th}>{t.dashboard.date}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentRequests.map((r) => (
                  <tr key={r.id}>
                    <td style={s.td}>{r.title}</td>
                    <td style={s.td}>
                      <span style={s.badge(r.status === 'open' ? '#10b981' : r.status === 'fulfilled' ? '#6366f1' : '#ef4444')}>
                        {r.status}
                      </span>
                    </td>
                    <td style={s.td}>{r.votes}</td>
                    <td style={{ ...s.td, fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div style={s.empty}>{t.app.noData}</div>}
        </div>
      </div>
    </div>
  );
}
