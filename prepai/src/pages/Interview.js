import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRight, FileText, Briefcase } from 'lucide-react';

const ROLES = [
  { id: 'software-engineering', label: 'Software Engineering', icon: '💻', desc: 'DSA, System Design, OOP, CS Fundamentals' },
  { id: 'data-science', label: 'Data Science', icon: '📊', desc: 'ML, Statistics, Python, SQL, Analytics' },
  { id: 'product-management', label: 'Product Management', icon: '🚀', desc: 'Strategy, Metrics, Prioritization, User Research' },
  { id: 'ui-ux-design', label: 'UI/UX Design', icon: '🎨', desc: 'Design Thinking, Figma, User Research, Prototyping' },
  { id: 'marketing', label: 'Marketing', icon: '📣', desc: 'Digital Marketing, SEO, Campaigns, Analytics' },
  { id: 'finance', label: 'Finance & Accounting', icon: '💰', desc: 'Financial Analysis, Modeling, Accounting' },
  { id: 'hr', label: 'Human Resources', icon: '👥', desc: 'Recruitment, Performance, Culture, Compliance' },
  { id: 'sales', label: 'Sales', icon: '🤝', desc: 'CRM, Negotiation, Pipeline, Customer Success' },
  { id: 'devops', label: 'DevOps / Cloud', icon: '☁️', desc: 'AWS, Docker, Kubernetes, CI/CD, Infrastructure' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: '🔒', desc: 'Network Security, Ethical Hacking, Compliance' },
  { id: 'general', label: 'General / Behavioral', icon: '🎯', desc: 'Communication, Leadership, Problem Solving' },
  { id: 'resume-based', label: 'Based on My Resume', icon: '📄', desc: 'Personalized questions from your resume', special: true },
];

export default function Interview() {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState(location.state?.role || '');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);

  const hasResume = !!user.resume;

  const handleStart = () => {
    if (!selectedRole) return;
    navigate('/interview/session', {
      state: { role: selectedRole, difficulty, questionCount }
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Start Interview</h1>
        <p style={{ color: 'var(--text3)' }}>Choose your role, difficulty, and let our AI avatar guide your practice session</p>
      </div>

      {/* Role selection */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={16} color="var(--accent2)" /> Select Interview Role
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => {
                if (role.id === 'resume-based' && !hasResume) return;
                setSelectedRole(role.id);
              }}
              className={`role-card ${selectedRole === role.id ? 'selected' : ''} ${role.id === 'resume-based' && !hasResume ? '' : ''}`}
              style={{
                opacity: role.id === 'resume-based' && !hasResume ? 0.5 : 1,
                cursor: role.id === 'resume-based' && !hasResume ? 'not-allowed' : 'pointer',
                position: 'relative',
                ...(role.special ? { border: '2px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.05)' } : {})
              }}
            >
              <div className="icon">{role.icon}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.25rem' }}>{role.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{role.desc}</div>
              {role.id === 'resume-based' && !hasResume && (
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'var(--bg3)', borderRadius: 99, padding: '0.15rem 0.5rem', fontSize: '0.7rem', color: 'var(--text3)' }}>
                  Upload resume first
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Settings row */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Difficulty */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Difficulty Level</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`diff-btn ${d} ${difficulty === d ? 'active' : ''}`}
              >
                {d === 'easy' && '🟢'} {d === 'medium' && '🟡'} {d === 'hard' && '🔴'}
                <br />
                <span style={{ textTransform: 'capitalize' }}>{d}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg3)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text3)' }}>
            {difficulty === 'easy' && '✅ Fundamental concepts, basic problem solving, introductory questions'}
            {difficulty === 'medium' && '⚡ Intermediate challenges, practical scenarios, moderate complexity'}
            {difficulty === 'hard' && '🔥 Advanced topics, complex problems, expert-level questions'}
          </div>
        </div>

        {/* Number of questions */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Number of Questions</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[3, 5, 7, 10].map(n => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className="btn"
                style={{
                  flex: 1,
                  background: questionCount === n ? 'var(--accent)' : 'var(--bg3)',
                  color: questionCount === n ? 'white' : 'var(--text2)',
                  border: `1px solid ${questionCount === n ? 'var(--accent)' : 'var(--border)'}`,
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text3)' }}>
            Estimated time: ~{questionCount * 3}–{questionCount * 5} minutes
          </p>

          {/* Resume info */}
          {hasResume && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--green)' }}>
              <FileText size={14} /> Resume detected — AI will personalize questions
            </div>
          )}
        </div>
      </div>

      {/* Start button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleStart}
          className="btn btn-primary btn-lg"
          disabled={!selectedRole}
          style={{ minWidth: 220, justifyContent: 'center', fontSize: '1rem' }}
        >
          Begin Interview <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
