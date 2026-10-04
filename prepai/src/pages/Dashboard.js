import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Mic, TrendingUp, Award, Clock, Target, ChevronRight,
  BarChart2, Star, Zap, BookOpen, RefreshCw
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const { user, getUserInterviews } = useApp();
  const navigate = useNavigate();

  // Force a re-read from localStorage every time Dashboard mounts or user changes
  const [interviews, setInterviews] = useState([]);

  const loadInterviews = () => {
    const fresh = getUserInterviews(user.id);
    setInterviews(fresh);
  };

  useEffect(() => {
    loadInterviews();
    // Also re-load when window regains focus (e.g. returning from interview)
    const onFocus = () => loadInterviews();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user.id]); // eslint-disable-line

  const stats = useMemo(() => {
    if (!interviews.length) return { total: 0, avgScore: 0, best: 0, totalTime: 0 };
    const scores = interviews.map(i => i.score || 0);
    const totalTime = interviews.reduce((s, i) => s + (i.duration || 0), 0);
    return {
      total: interviews.length,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      best: Math.max(...scores),
      totalTime: Math.round(totalTime / 60),
    };
  }, [interviews]);

  const radarData = [
    { subject: 'Communication', A: stats.avgScore > 0 ? Math.min(100, Math.round(stats.avgScore * 0.95)) : 0 },
    { subject: 'Technical', A: stats.avgScore > 0 ? Math.min(100, Math.round(stats.avgScore * 0.88)) : 0 },
    { subject: 'Problem Solving', A: stats.avgScore > 0 ? Math.min(100, Math.round(stats.avgScore * 0.92)) : 0 },
    { subject: 'Confidence', A: stats.avgScore > 0 ? Math.min(100, Math.round(stats.avgScore * 0.90)) : 0 },
    { subject: 'Clarity', A: stats.avgScore > 0 ? Math.min(100, Math.round(stats.avgScore * 0.93)) : 0 },
  ];

  const trendData = interviews.slice(-8).map((iv, idx) => ({
    name: `#${idx + 1}`,
    score: iv.score || 0,
    role: iv.role,
  }));

  const recent = [...interviews].reverse().slice(0, 5);
  const diffColor = { easy: 'var(--green)', medium: 'var(--yellow)', hard: 'var(--red)' };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>
            {greeting}, <span style={{ color: 'var(--accent2)' }}>{user.name.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.95rem' }}>
            {stats.total === 0
              ? "Ready to start your interview journey? Take your first practice session!"
              : `You've completed ${stats.total} interview${stats.total > 1 ? 's' : ''}. Average score: ${stats.avgScore}%`}
          </p>
        </div>
        <button onClick={loadInterviews} className="btn btn-ghost btn-sm" title="Refresh data">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Interviews', value: stats.total, icon: Mic, color: 'var(--accent)', suffix: '' },
          { label: 'Avg. Score', value: stats.avgScore, icon: BarChart2, color: 'var(--green)', suffix: '%' },
          { label: 'Best Score', value: stats.best, icon: Award, color: 'var(--yellow)', suffix: '%' },
          { label: 'Practice Time', value: stats.totalTime, icon: Clock, color: 'var(--orange)', suffix: 'm' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
              {s.value}<span style={{ fontSize: '1rem', color: 'var(--text3)', fontWeight: 400 }}>{s.suffix}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text3)', marginTop: '0.3rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Radar */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} color="var(--accent2)" /> Skill Breakdown
          </h3>
          {stats.total === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2rem' }}>📊</div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text3)' }}>
                Complete an interview to see your skill breakdown
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(99,102,241,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                <Radar name="Score" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Trend */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--green)" /> Score Trend
          </h3>
          {trendData.length < 2 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2rem' }}>📈</div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text3)' }}>
                Complete at least 2 interviews to see your progress trend
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: '0.85rem' }}
                  labelStyle={{ color: 'var(--text2)' }}
                  formatter={(val, _, props) => [`${val}%`, props.payload?.role || 'Score']}
                />
                <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 5, strokeWidth: 0 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Quick start */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} color="var(--yellow)" /> Quick Start
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {[
              { label: 'Software Engineering', sub: 'DSA, System Design, CS Fundamentals', icon: '💻', role: 'software-engineering' },
              { label: 'Data Science', sub: 'ML, Statistics, Python, SQL', icon: '📊', role: 'data-science' },
              { label: 'Product Management', sub: 'Strategy, Metrics, Roadmaps', icon: '🚀', role: 'product-management' },
            ].map((r, i) => (
              <button
                key={i}
                onClick={() => navigate('/interview', { state: { role: r.role } })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '0.85rem 1rem', cursor: 'pointer',
                  transition: 'all 0.2s', color: 'var(--text)', textAlign: 'left', width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--surface2)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              >
                <span style={{ fontSize: '1.4rem' }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{r.sub}</div>
                </div>
                <ChevronRight size={16} color="var(--text3)" />
              </button>
            ))}
            <button onClick={() => navigate('/interview')} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
              <Mic size={16} /> Browse All Roles
            </button>
          </div>
        </div>

        {/* Recent interviews */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="var(--accent2)" /> Recent Interviews
            </h3>
            {recent.length > 0 && (
              <button onClick={() => navigate('/history')} className="btn btn-ghost btn-sm">View all</button>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem' }}>🎤</div>
              <p style={{ fontSize: '0.88rem', marginTop: '0.75rem', color: 'var(--text3)' }}>
                No interviews yet — take your first one!
              </p>
              <button onClick={() => navigate('/interview')} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Start Interview
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {recent.map((iv, i) => (
                <div key={iv.id || i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: 'var(--bg3)', borderRadius: 9, padding: '0.75rem 1rem',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {iv.role || 'General'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text3)' }}>
                      {new Date(iv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <span className={`badge badge-${iv.difficulty || 'easy'}`}>{iv.difficulty || 'easy'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                    <Star size={13} color={diffColor[iv.difficulty] || 'var(--green)'} fill={diffColor[iv.difficulty] || 'var(--green)'} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: diffColor[iv.difficulty] || 'var(--green)' }}>
                      {iv.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
