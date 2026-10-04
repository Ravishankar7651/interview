import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Mic, TrendingUp, Star, Trash2, Search, ChevronDown, ChevronUp, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const { getUsers, getAllInterviews, removeUser, toast } = useApp();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const users = getUsers().filter(u => u.role !== 'admin');
  const allInterviews = getAllInterviews();

  const filtered = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalInterviews = allInterviews.length;
    const avgScore = totalInterviews
      ? Math.round(allInterviews.reduce((s, i) => s + (i.score || 0), 0) / totalInterviews)
      : 0;
    return { totalUsers, totalInterviews, avgScore };
  }, [users, allInterviews]);

  const getUserStats = (userId) => {
    const interviews = allInterviews.filter(i => i.userId === userId);
    if (!interviews.length) return { count: 0, avg: 0, best: 0 };
    const scores = interviews.map(i => i.score || 0);
    return {
      count: interviews.length,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      best: Math.max(...scores),
      last: interviews[interviews.length - 1],
    };
  };

  const scoreColor = (s) => s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--yellow)' : 'var(--red)';

  const handleDelete = (userId) => {
    removeUser(userId);
    setConfirmDelete(null);
    toast('User removed successfully', 'success');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
        <Shield size={24} color="var(--accent2)" />
        <h1 style={{ fontSize: '1.8rem' }}>Admin Dashboard</h1>
      </div>
      <p style={{ color: 'var(--text3)', marginBottom: '2rem' }}>Manage users and monitor platform performance</p>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'var(--accent)' },
          { label: 'Total Interviews', value: stats.totalInterviews, icon: Mic, color: 'var(--green)' },
          { label: 'Platform Avg Score', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'var(--yellow)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ display: 'flex', align: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* User management */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.1rem' }}>User Management ({filtered.length})</h3>
          <div style={{ position: 'relative', minWidth: 240 }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              style={{ paddingLeft: '2.2rem', width: '100%' }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><div>👥</div><p>No users found</p></div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Interviews</th>
                  <th>Avg Score</th>
                  <th>Best</th>
                  <th>Resume</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => {
                  const us = getUserStats(u.id);
                  return (
                    <React.Fragment key={u.id}>
                      <tr>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0
                            }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{u.email}</td>
                        <td style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: us.count > 0 ? 'var(--text)' : 'var(--text3)' }}>{us.count}</span>
                        </td>
                        <td>
                          {us.count > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Star size={12} fill={scoreColor(us.avg)} color={scoreColor(us.avg)} />
                              <span style={{ fontWeight: 600, color: scoreColor(us.avg) }}>{us.avg}%</span>
                            </div>
                          ) : <span style={{ color: 'var(--text3)' }}>—</span>}
                        </td>
                        <td>
                          {us.best > 0 ? <span style={{ fontWeight: 600, color: scoreColor(us.best) }}>{us.best}%</span> : <span style={{ color: 'var(--text3)' }}>—</span>}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: u.resume ? 'var(--green)' : 'var(--text3)' }}>
                            {u.resume ? '✅ Yes' : '❌ No'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {us.count > 0 && (
                              <button
                                onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '0.3rem 0.5rem' }}
                              >
                                {expanded === u.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            )}
                            <button
                              onClick={() => setConfirmDelete(u)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.3rem 0.6rem' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded interview history */}
                      {expanded === u.id && (
                        <tr>
                          <td colSpan={8} style={{ background: 'var(--bg3)', padding: '1rem 1.25rem' }}>
                            <div className="animate-in">
                              <div style={{ fontSize: '0.82rem', color: 'var(--text3)', marginBottom: '0.75rem', fontWeight: 600 }}>INTERVIEW HISTORY</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {allInterviews.filter(i => i.userId === u.id).reverse().slice(0, 5).map((iv, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', borderRadius: 8, padding: '0.65rem 1rem', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text2)', flex: 1 }}>{iv.role}</span>
                                    <span className={`badge badge-${iv.difficulty}`}>{iv.difficulty}</span>
                                    <span style={{ color: 'var(--text3)' }}>{new Date(iv.date).toLocaleDateString()}</span>
                                    <span style={{ fontWeight: 700, color: scoreColor(iv.score) }}>
                                      <Star size={12} fill={scoreColor(iv.score)} color={scoreColor(iv.score)} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                                      {iv.score}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {u.profile?.bio && (
                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: 8, fontSize: '0.83rem', color: 'var(--text2)', borderLeft: '3px solid var(--accent)' }}>
                                  <span style={{ fontWeight: 600, color: 'var(--text3)', marginRight: '0.4rem' }}>Bio:</span>
                                  {u.profile.bio}
                                </div>
                              )}
                              {u.profile?.skills?.length > 0 && (
                                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                  {u.profile.skills.map((s, i) => <span key={i} className="chip" style={{ fontSize: '0.75rem' }}>{s}</span>)}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: 'var(--red)' }}>⚠️ Delete User</h3>
            <p style={{ color: 'var(--text2)', marginBottom: '1.5rem' }}>
              Are you sure you want to remove <strong style={{ color: 'var(--text)' }}>{confirmDelete.name}</strong>?
              This will delete their account and all interview history. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} className="btn btn-outline">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.id)} className="btn btn-danger">
                <Trash2 size={15} /> Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
