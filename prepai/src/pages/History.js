import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, Clock, ChevronDown, ChevronUp, Calendar, Target, TrendingUp } from 'lucide-react';

export default function History() {
  const { user, getUserInterviews } = useApp();
  const interviews = getUserInterviews(user.id).reverse();
  const [expanded, setExpanded] = useState(null);

  const scoreColor = (s) => s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--yellow)' : 'var(--red)';
  const fmtTime = (s) => s ? `${Math.floor(s / 60)}m ${s % 60}s` : '—';

  if (interviews.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Interview History</h1>
          <p style={{ color: 'var(--text3)' }}>Review your past interviews and track your progress</p>
        </div>
        <div className="empty-state">
          <div className="icon">🎤</div>
          <h3 style={{ color: 'var(--text2)', marginBottom: '0.5rem' }}>No interviews yet</h3>
          <p>Complete your first interview to see your history here</p>
        </div>
      </div>
    );
  }

  const avgScore = Math.round(interviews.reduce((s, i) => s + (i.score || 0), 0) / interviews.length);
  const best = Math.max(...interviews.map(i => i.score || 0));

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Interview History</h1>
        <p style={{ color: 'var(--text3)' }}>Review your past interviews and track your progress</p>
      </div>

      {/* Summary row */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Interviews', value: interviews.length, icon: Target, color: 'var(--accent)' },
          { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, color: 'var(--green)' },
          { label: 'Best Score', value: `${best}%`, icon: Star, color: 'var(--yellow)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Interviews list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Role</th>
              <th>Difficulty</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Score</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((iv, idx) => (
              <React.Fragment key={iv.id || idx}>
                <tr>
                  <td style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{interviews.length - idx}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{iv.role || 'General'}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${iv.difficulty || 'easy'}`}>{iv.difficulty || 'easy'}</span>
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={13} /> {new Date(iv.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={13} /> {fmtTime(iv.duration)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Star size={14} fill={scoreColor(iv.score)} color={scoreColor(iv.score)} />
                      <span style={{ fontWeight: 700, color: scoreColor(iv.score) }}>{iv.score}%</span>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => setExpanded(expanded === idx ? null : idx)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.3rem 0.6rem' }}
                    >
                      {expanded === idx ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </td>
                </tr>
                {expanded === idx && iv.feedback && (
                  <tr>
                    <td colSpan={7} style={{ padding: '1rem 1.25rem', background: 'var(--bg3)' }}>
                      <div className="animate-in">
                        <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                          {/* Skill scores */}
                          <div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text3)', marginBottom: '0.75rem', fontWeight: 600 }}>SKILL BREAKDOWN</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {[
                                ['Communication', iv.feedback.communication],
                                ['Technical', iv.feedback.technical],
                                ['Problem Solving', iv.feedback.problemSolving],
                                ['Confidence', iv.feedback.confidence],
                                ['Clarity', iv.feedback.clarity],
                              ].map(([label, val]) => (
                                <div key={label}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>{label}</span>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: scoreColor(val) }}>{val}%</span>
                                  </div>
                                  <div className="progress-bar" style={{ height: 4 }}>
                                    <div className="progress-fill" style={{ width: `${val}%`, background: scoreColor(val) }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Strengths & improvements */}
                          <div>
                            <div style={{ marginBottom: '0.75rem' }}>
                              <div style={{ fontSize: '0.82rem', color: 'var(--text3)', marginBottom: '0.5rem', fontWeight: 600 }}>STRENGTHS</div>
                              {iv.feedback.strengths?.map((s, i) => (
                                <div key={i} style={{ fontSize: '0.85rem', color: 'var(--green)', marginBottom: '0.25rem' }}>✅ {s}</div>
                              ))}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--text3)', marginBottom: '0.5rem', fontWeight: 600 }}>IMPROVEMENTS</div>
                              {iv.feedback.improvements?.map((s, i) => (
                                <div key={i} style={{ fontSize: '0.85rem', color: 'var(--yellow)', marginBottom: '0.25rem' }}>⚡ {s}</div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Summary */}
                        <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '0.85rem 1rem', fontSize: '0.88rem', color: 'var(--text2)', borderLeft: '3px solid var(--accent)' }}>
                          💬 {iv.feedback.summary}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
