import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Mic, BarChart2, FileText, ChevronRight,
  Zap, Shield, Users, ArrowRight, Play, Sparkles,
  GraduationCap, BookOpen, Cpu, MessageSquare, Target, Star, Check
} from 'lucide-react';

const ROLES = [
  'Software Engineering','Data Science','Product Management','UI/UX Design',
  'DevOps / Cloud','Cybersecurity','Marketing','Finance','Human Resources','Sales',
];

function useCountUp(target, duration = 1600, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let iv;
    const step = target / (duration / 16);
    let cur = 0;
    iv = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(iv); }
      else setVal(Number.isInteger(target) ? Math.floor(cur) : parseFloat(cur.toFixed(1)));
    }, 16);
    return () => clearInterval(iv);
  }, [target, duration, start]);
  return val;
}

function StatCard({ num, suffix, label, delay = 0, inView }) {
  const val = useCountUp(num, 1500, inView);
  return (
    <div style={{ textAlign: 'center', animation: 'fadeIn .6s ease both', animationDelay: `${delay}ms` }}>
      <div style={{ fontSize: '2.8rem', fontFamily: 'var(--font-display)', fontWeight: 800, background: 'linear-gradient(135deg,#fff,var(--accent3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
        {val}{suffix}
      </div>
      <div style={{ fontSize: '.85rem', color: 'var(--text3)', marginTop: '.4rem' }}>{label}</div>
    </div>
  );
}

const FEATURES = [
  { icon: Mic, color: 'var(--accent)', bg: 'rgba(99,102,241,.12)', title: 'AI Avatar Interviewer', desc: 'Practice with our Beyond Presence 3D avatar. It asks real interview questions using LLM-generated content — just like a genuine interview panel.' },
  { icon: FileText, color: 'var(--green)', bg: 'rgba(16,185,129,.12)', title: 'Resume Intelligence', desc: 'Upload your resume and our AI extracts your skills, experience, and education using NER to generate tailored, personalised questions.' },
  { icon: Zap, color: 'var(--yellow)', bg: 'rgba(245,158,11,.12)', title: 'Real-Time Transcription', desc: 'Every word spoken — yours and the avatar\'s — is captured live using Deepgram nova-2, creating an accurate labelled conversation record.' },
  { icon: BarChart2, color: 'var(--purple)', bg: 'rgba(139,92,246,.12)', title: 'Gemini AI Feedback', desc: 'After each session, Gemini 1.5 Flash analyses the full transcript and scores you across 5 dimensions with specific, actionable advice.' },
  { icon: Shield, color: 'var(--orange)', bg: 'rgba(249,115,22,.12)', title: '3 Difficulty Levels', desc: 'Easy, medium, or hard — each level adapts question complexity so you practice at exactly the right challenge level for your career stage.' },
  { icon: Users, color: 'var(--accent2)', bg: 'rgba(129,140,248,.12)', title: '12 Career Roles', desc: 'Software engineering to finance, HR to cybersecurity — choose your exact target role and get questions curated specifically for that field.' },
];

const STEPS = [
  { num: '01', icon: FileText, title: 'Upload Your Resume', desc: 'Sign up, upload your resume, and AI automatically extracts your skills, projects, and experience using Named Entity Recognition.' },
  { num: '02', icon: Target, title: 'Choose Role & Difficulty', desc: 'Select from 12 career roles and 3 difficulty levels. Enable resume-based mode for fully personalised, context-aware questions.' },
  { num: '03', icon: Mic, title: 'Interview with the Avatar', desc: 'The 3D AI avatar conducts the interview live using voice. Speak naturally — Deepgram captures everything in real time.' },
  { num: '04', icon: BarChart2, title: 'Get Detailed Feedback', desc: 'Gemini AI scores your communication, technical depth, clarity, confidence, and problem solving with specific improvement tips.' },
];

const TECH_STACK = [
  { name: 'React.js', purpose: 'Frontend UI', color: 'rgba(99,102,241,.15)', border: 'rgba(99,102,241,.3)' },
  { name: 'Gemini 1.5 Flash', purpose: 'Question Gen & Feedback', color: 'rgba(16,185,129,.15)', border: 'rgba(16,185,129,.3)' },
  { name: 'Deepgram nova-2', purpose: 'Real-time STT', color: 'rgba(245,158,11,.15)', border: 'rgba(245,158,11,.3)' },
  { name: 'Beyond Presence', purpose: '3D Avatar', color: 'rgba(139,92,246,.15)', border: 'rgba(139,92,246,.3)' },
  { name: 'Web Speech API', purpose: 'Mic Transcription', color: 'rgba(249,115,22,.15)', border: 'rgba(249,115,22,.3)' },
  { name: 'NER / spaCy', purpose: 'Resume Parsing', color: 'rgba(239,68,68,.15)', border: 'rgba(239,68,68,.3)' },
];

const RESULTS = [
  { label: 'Communication', score: 76, color: 'var(--accent2)' },
  { label: 'Technical', score: 81, color: 'var(--green)' },
  { label: 'Problem Solving', score: 77, color: 'var(--yellow)' },
  { label: 'Confidence', score: 80, color: 'var(--purple)' },
  { label: 'Clarity', score: 75, color: 'var(--orange)' },
];

const TEAM = [
  { name: 'Ravishankar Singh', role: 'B.Tech Scholar', dept: 'Department of Data Science (CSE)', avatar: 'RS', gradient: 'linear-gradient(135deg,var(--accent),#7c3aed)', bio: 'B.Tech student specialising in Data Science and AI at SRMC&M. Core developer of the PrepAI system architecture and frontend implementation.' },
  { name: 'Rishabh Singh', role: 'B.Tech Scholar', dept: 'Department of Data Science (CSE)', avatar: 'RI', gradient: 'linear-gradient(135deg,var(--green),#059669)', bio: 'B.Tech student in Data Science at SRMC&M. Contributed to the AI pipeline design, LLM integration, and evaluation framework of PrepAI.' },
  { name: 'Himanshi Singh', role: 'Assistant Professor', dept: 'Department of Data Science (CSE)', avatar: 'HS', gradient: 'linear-gradient(135deg,var(--yellow),var(--orange))', bio: 'Faculty guide at SRMC&M with expertise in NLP and machine learning. Supervised the research design and system evaluation methodology.' },
  { name: 'Ratan Rajan Srivastava', role: 'Assistant Professor', dept: 'Department of CSE', avatar: 'RR', gradient: 'linear-gradient(135deg,var(--purple),var(--accent))', bio: 'Faculty co-guide at SRMC&M specialising in software engineering and AI systems. Contributed to architecture design and technical oversight.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);
  const [roleIdx, setRoleIdx] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsInView(true); }, { threshold: .3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setRoleIdx(i => (i + 1) % ROLES.length), 2200);
    return () => clearInterval(t);
  }, []);

  const NAV_LINKS = ['Features', 'How it Works', 'Results', 'About Us'];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, borderBottom: '1px solid rgba(99,102,241,.1)', backdropFilter: 'blur(16px)', background: 'rgba(6,6,15,.88)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem' }}>PrepAI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            {NAV_LINKS.map(l => (
              <a key={l} href={'#' + l.toLowerCase().replace(/ /g, '-')}
                style={{ fontSize: '.87rem', color: 'var(--text2)', transition: 'color .2s', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = 'var(--text)'}
                onMouseLeave={e => e.target.style.color = 'var(--text2)'}>
                {l}
              </a>
            ))}
            <button onClick={() => navigate('/login')} className="btn btn-ghost btn-sm">Sign In</button>
            <button onClick={() => navigate('/register')} className="btn btn-primary btn-sm">
              Get Started <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '7rem 2rem 4rem', overflow: 'hidden' }}>
        <div className="landing-hero-glow" style={{ top: '-200px', left: '-200px' }} />
        <div className="landing-hero-glow" style={{ bottom: '-200px', right: '-200px', background: 'radial-gradient(circle,rgba(129,140,248,.1) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.25)', borderRadius: 99, padding: '.35rem 1rem', marginBottom: '2rem', fontSize: '.8rem', color: 'var(--accent3)' }}>
            <Sparkles size={12} /> Research project · Shri Ramswaroop Memorial College of Engineering &amp; Management
          </div>

          <h1 style={{ fontSize: 'clamp(2.8rem,6vw,5rem)', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.08, marginBottom: '1.5rem', letterSpacing: '-.02em' }}>
            AI-Powered Interview<br />
            <span className="gradient-text">Practice Platform</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem,2vw,1.18rem)', color: 'var(--text2)', maxWidth: 640, margin: '0 auto 1.5rem', lineHeight: 1.75 }}>
            A research-developed system combining 3D avatar technology, real-time speech transcription, and Gemini AI feedback to help you ace your next interview.
          </p>

          <div style={{ marginBottom: '2.5rem', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem' }}>
            <span style={{ color: 'var(--text3)', fontSize: '.93rem' }}>Designed for</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(99,102,241,.1)', border: '1px solid var(--border2)', borderRadius: 8, padding: '.2rem .85rem' }}>
              <span key={roleIdx} style={{ color: 'var(--accent3)', fontWeight: 600, fontSize: '.93rem', animation: 'fadeIn .4s ease' }}>
                {ROLES[roleIdx]}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4.5rem' }}>
            <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg" style={{ gap: '.6rem', fontSize: '1.05rem', padding: '.9rem 2.2rem', boxShadow: '0 8px 32px rgba(99,102,241,.4)' }}>
              Start Practising Free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')} className="btn btn-outline btn-lg" style={{ gap: '.6rem', fontSize: '1.05rem', padding: '.9rem 2rem' }}>
              <Play size={16} /> Sign In
            </button>
          </div>

          {/* Mock UI */}
          <div style={{ maxWidth: 860, margin: '0 auto', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,.6)' }}>
            <div style={{ height: 44, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '.5rem' }}>
              {['#ef4444','#f59e0b','#10b981'].map((c,i) => <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: 'var(--bg3)', borderRadius: 99, padding: '.2rem 1.2rem', fontSize: '.75rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} /> prepai.app/interview/session
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg2)' }}>
              <div style={{ background: 'var(--surface)', borderRadius: 12, aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border2)', position: 'relative' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--purple))', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(99,102,241,.4)' }}>
                    <Brain size={32} color="white" />
                  </div>
                  <div style={{ fontSize: '.82rem', color: 'var(--accent3)', fontWeight: 600, marginBottom: '.4rem' }}>AI Avatar Interviewer</div>
                  <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                    {[0,1,2,3,4].map(j => <div key={j} className="waveform-bar" style={{ animationDelay: `${j*.14}s`, background: 'var(--accent)' }} />)}
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(239,68,68,.9)', borderRadius: 6, padding: '.2rem .5rem', display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.7rem', color: 'white', fontWeight: 700 }}>
                  <span className="rec-dot active" style={{ width: 6, height: 6, background: 'white' }} /> LIVE
                </div>
              </div>
              <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.7rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} /> Live Transcript
                </div>
                {[
                  { who: 'AI', text: 'Tell me about a challenging project you worked on recently.', isAI: true },
                  { who: 'ME', text: 'I led the migration of our data pipeline to microservices...', isAI: false },
                  { who: 'AI', text: 'How did you handle data consistency across distributed services?', isAI: true },
                ].map((l, i) => (
                  <div key={i} style={{ display: 'flex', gap: '.4rem', flexDirection: l.isAI ? 'row' : 'row-reverse', alignItems: 'flex-start', marginBottom: '.5rem' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: l.isAI ? 'rgba(99,102,241,.2)' : 'rgba(16,185,129,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.58rem', fontWeight: 800, color: l.isAI ? 'var(--accent2)' : 'var(--green)' }}>{l.who}</div>
                    <div style={{ background: l.isAI ? 'rgba(99,102,241,.08)' : 'rgba(16,185,129,.08)', border: `1px solid ${l.isAI ? 'rgba(99,102,241,.15)' : 'rgba(16,185,129,.15)'}`, borderRadius: l.isAI ? '3px 8px 8px 8px' : '8px 3px 8px 8px', padding: '.35rem .6rem', maxWidth: '85%' }}>
                      <p style={{ fontSize: '.73rem', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>{l.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ padding: '5rem 2rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--text3)', marginBottom: '2.5rem', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>
            Results from published research evaluation
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2rem' }}>
            <StatCard num={75}  suffix="%" label="Average interview score"   inView={statsInView} />
            <StatCard num={83}  suffix="%" label="Best score achieved"       inView={statsInView} delay={150} />
            <StatCard num={12}  suffix=""  label="Career roles supported"    inView={statsInView} delay={300} />
            <StatCard num={5}   suffix=""  label="Skill dimensions evaluated" inView={statsInView} delay={450} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '7rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'rgba(99,102,241,.08)', border: '1px solid var(--border2)', borderRadius: 99, padding: '.3rem .9rem', marginBottom: '1rem', fontSize: '.8rem', color: 'var(--accent3)' }}>
              <Zap size={12} /> Core capabilities
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', marginBottom: '1rem' }}>Everything in one<br />unified platform</h2>
            <p style={{ color: 'var(--text2)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>Combining resume intelligence, generative AI, real-time speech processing, and immersive 3D interaction — all in your browser, no installation needed.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1.25rem' }}>
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }, i) => (
              <div key={i} className="glass-card card-hover" style={{ padding: '1.75rem', transition: 'all .25s' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.1rem' }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '.5rem', fontFamily: 'var(--font-display)' }}>{title}</h3>
                <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '7rem 2rem', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1050, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 99, padding: '.3rem .9rem', marginBottom: '1rem', fontSize: '.8rem', color: 'var(--green)' }}>
              <Play size={12} /> Simple 4-step process
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', marginBottom: '1rem' }}>From upload to offer<br />in days, not months</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem' }}>
            {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: 28, left: 'calc(100% + .5rem)', width: 'calc(100% - 1rem)', height: 1, background: 'linear-gradient(90deg,var(--border2),transparent)', zIndex: 0 }} />
                )}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', height: '100%', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} color="var(--accent2)" />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--border2)' }}>{num}</span>
                  </div>
                  <h3 style={{ fontSize: '.95rem', marginBottom: '.5rem', fontFamily: 'var(--font-display)' }}>{title}</h3>
                  <p style={{ fontSize: '.82rem', color: 'var(--text2)', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section id="results" style={{ padding: '7rem 2rem' }}>
        <div style={{ maxWidth: 1050, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 99, padding: '.3rem .9rem', marginBottom: '1rem', fontSize: '.8rem', color: 'var(--purple)' }}>
              <Star size={12} /> Research evaluation results
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', marginBottom: '1rem' }}>Proven results from<br />real evaluation</h2>
            <p style={{ color: 'var(--text2)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              PrepAI was evaluated over 7 interview sessions in published research. Below are the actual skill scores and qualitative findings from that evaluation.
            </p>
          </div>
          <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <BarChart2 size={16} color="var(--accent2)" /> Skill Breakdown — Research Evaluation
              </h3>
              {RESULTS.map(({ label, score, color }) => (
                <div key={label} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem' }}>
                    <span style={{ fontSize: '.88rem', color: 'var(--text2)' }}>{label}</span>
                    <span style={{ fontWeight: 700, color, fontSize: '.9rem' }}>{score}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '1.25rem', padding: '.85rem 1rem', background: 'rgba(99,102,241,.06)', border: '1px solid var(--border2)', borderRadius: 9, fontSize: '.82rem', color: 'var(--text2)' }}>
                <strong style={{ color: 'var(--accent3)' }}>Average Score: 75% · Best Score: 83%</strong><br />
                Measured over 7 sessions — performance improved consistently.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card">
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--green)' }}>✅ Identified Strengths</h3>
                {['Clear verbal communication throughout sessions','Strong ability to stay focused on questions','Professional and composed tone maintained'].map((s,i) => (
                  <div key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', marginBottom: '.6rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                    <Check size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />{s}
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--yellow)' }}>⚡ Areas for Improvement</h3>
                {['Add specific metrics and numbers to answers','Use the STAR method for behavioural questions','Increase depth of technical explanations'].map((s,i) => (
                  <div key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', marginBottom: '.6rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                    <Check size={14} color="var(--yellow)" style={{ flexShrink: 0, marginTop: 2 }} />{s}
                  </div>
                ))}
              </div>
              <div className="card" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.08),rgba(129,140,248,.04))' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '.75rem' }}>📋 System Effectiveness</h3>
                <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.7 }}>
                  PrepAI demonstrated <strong style={{ color: 'var(--text)' }}>personalisation</strong> (questions from candidate background), <strong style={{ color: 'var(--text)' }}>realistic simulation</strong> (avatar + voice), and <strong style={{ color: 'var(--text)' }}>scalability</strong> (entirely browser-based, no human intervention).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section style={{ padding: '5rem 2rem', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: '2rem' }}>Technologies powering PrepAI</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', justifyContent: 'center' }}>
            {TECH_STACK.map(({ name, purpose, color, border }) => (
              <div key={name} style={{ background: color, border: `1px solid ${border}`, borderRadius: 10, padding: '.6rem 1.1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.2rem' }}>
                <span style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--text)' }}>{name}</span>
                <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{purpose}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about-us" style={{ padding: '7rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 99, padding: '.3rem .9rem', marginBottom: '1rem', fontSize: '.8rem', color: 'var(--green)' }}>
              <GraduationCap size={12} /> Research Team
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', marginBottom: '1rem' }}>About Us</h2>
            <p style={{ color: 'var(--text2)', maxWidth: 680, margin: '0 auto', lineHeight: 1.75 }}>
              PrepAI was developed as a research project at the <strong style={{ color: 'var(--text)' }}>Department of Data Science (CSE), Shri Ramswaroop Memorial College of Engineering &amp; Management, India</strong>. Our goal is to bridge the gap between traditional interview preparation and modern AI-driven personalised practice.
            </p>
          </div>

          {/* Institution */}
          <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg,rgba(99,102,241,.08),rgba(129,140,248,.04))', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={28} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '.35rem' }}>Shri Ramswaroop Memorial College of Engineering &amp; Management</h3>
              <p style={{ fontSize: '.87rem', color: 'var(--text2)', lineHeight: 1.65 }}>
                This system was conceptualised and developed under the <strong style={{ color: 'var(--text)' }}>Department of Data Science (CSE)</strong> and <strong style={{ color: 'var(--text)' }}>Department of Computer Science &amp; Engineering</strong>, integrating NLP, speech processing, LLMs, and immersive 3D avatar technology into one unified platform.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', flexShrink: 0 }}>
              {['NLP & Resume Parsing','Generative AI / LLMs','Speech Processing','3D Avatar Interaction'].map((t,i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.78rem', color: 'var(--accent3)' }}>
                  <Cpu size={11} /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {TEAM.map(({ name, role, dept, avatar, gradient, bio }) => (
              <div key={name} className="glass-card card-hover" style={{ padding: '1.5rem', transition: 'all .25s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem', marginBottom: '1rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.88rem', color: 'white', flexShrink: 0 }}>
                    {avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.92rem', lineHeight: 1.25 }}>{name}</div>
                    <div style={{ fontSize: '.74rem', color: 'var(--accent3)', marginTop: '.15rem' }}>{role}</div>
                  </div>
                </div>
                <div style={{ fontSize: '.74rem', color: 'var(--text3)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                  <GraduationCap size={11} /> {dept}
                </div>
                <p style={{ fontSize: '.82rem', color: 'var(--text2)', lineHeight: 1.6 }}>{bio}</p>
              </div>
            ))}
          </div>

          {/* Abstract */}
          <div style={{ padding: '1.75rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
              <MessageSquare size={16} color="var(--accent2)" />
              <span style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--accent2)' }}>Research Abstract</span>
            </div>
            <p style={{ fontSize: '.87rem', color: 'var(--text2)', lineHeight: 1.85, fontStyle: 'italic' }}>
              "Students moving from school to work life face the important step of job interviews. Practice interviews help a lot but they do not scale well and lack personal feedback. This paper looks at current digital tools for interview practice and identifies missing key features. We discuss the main technologies used — resume analysis with Named Entity Recognition, question generation using Large Language Models, speech processing with tools like Whisper and Deepgram, and answer evaluation. While these technologies work well alone, they are not combined into one complete platform. We suggest a new framework for an AI-powered 3D interview practice system."
            </p>
            <p style={{ marginTop: '1rem', fontSize: '.8rem', color: 'var(--text3)' }}>
              — Ravishankar Singh, Rishabh Singh, Himanshi Singh, Ratan Rajan Srivastava · SRMC&amp;M, India
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '7rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
        <div className="landing-hero-glow" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)', marginBottom: '1.25rem', lineHeight: 1.15 }}>
            Ready to <span className="gradient-text">ace your interview?</span>
          </h2>
          <p style={{ color: 'var(--text2)', marginBottom: '2.5rem', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 2.5rem' }}>
            Start practising today with our research-backed AI platform. Free to use — no credit card required.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg" style={{ fontSize: '1.05rem', padding: '.9rem 2.5rem', boxShadow: '0 10px 40px rgba(99,102,241,.45)' }}>
              Get Started Free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')} className="btn btn-outline btn-lg" style={{ fontSize: '1.05rem', padding: '.9rem 2rem' }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2.25rem 2rem', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={15} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>PrepAI</span>
            <span style={{ color: 'var(--text3)', fontSize: '.78rem', marginLeft: '.2rem' }}>· Research Project · SRMC&amp;M, India</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {NAV_LINKS.map(l => (
              <a key={l} href={'#' + l.toLowerCase().replace(/ /g,'-')}
                style={{ fontSize: '.83rem', color: 'var(--text3)', transition: 'color .2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text2)'}
                onMouseLeave={e => e.target.style.color = 'var(--text3)'}>
                {l}
              </a>
            ))}
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--text3)' }}>© 2025 PrepAI. Department of Data Science, SRMC&amp;M.</p>
        </div>
      </footer>
    </div>
  );
}
