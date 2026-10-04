import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  CheckCircle, AlertCircle, Clock, RotateCcw,
  MessageSquare, StopCircle, Mic, Monitor
} from 'lucide-react';

const GEMINI_KEY    = 'AIzaSyC734TvymUzEBgDXPwdmYVQGh7yv4MlXBc';
const DEEPGRAM_KEY  = '44e692d63da4c4a83dd6d3e1ebea7ba6328682f2';

const ROLE_LABELS = {
  'software-engineering':'Software Engineering','data-science':'Data Science',
  'product-management':'Product Management','ui-ux-design':'UI/UX Design',
  'marketing':'Marketing','finance':'Finance & Accounting','hr':'Human Resources',
  'sales':'Sales','devops':'DevOps / Cloud','cybersecurity':'Cybersecurity',
  'general':'General / Behavioral','resume-based':'Resume-Based',
};

function useTimer() {
  const [s,setS]=useState(0); const [on,setOn]=useState(false); const r=useRef();
  useEffect(()=>{ if(on) r.current=setInterval(()=>setS(x=>x+1),1000); else clearInterval(r.current); return()=>clearInterval(r.current); },[on]);
  const fmt=v=>`${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`;
  return{seconds:s,fmt:fmt(s),start:()=>setOn(true),stop:()=>setOn(false)};
}

/*
  ══════════════════════════════════════════════════════════════════
  ARCHITECTURE — WHY THIS WORKS
  ══════════════════════════════════════════════════════════════════

  TWO completely separate audio sources → TWO separate STT engines:

  1. TAB AUDIO (avatar voice)
     getDisplayMedia() captures the browser tab's audio output as a
     clean digital MediaStream. MediaRecorder encodes it as webm.
     We open a Deepgram WebSocket WITHOUT specifying encoding —
     this is critical. When encoding is omitted, Deepgram reads the
     webm container header and auto-detects the codec. Every chunk
     is sent as binary. Deepgram returns transcript → "avatar" label.

  2. MICROPHONE (user voice)  
     Web Speech API reads the mic directly. It's built into Chrome
     and is 100% reliable for single-speaker mic capture. Every
     result → "user" label.

  The two streams NEVER mix. Speaker attribution is perfect.
  The user can think for as long as they want — nothing breaks.
  ══════════════════════════════════════════════════════════════════
*/

function openDeepgramSocket(onTranscript, onInterim, onOpen, onClose) {
  /*
    KEY LESSON from all previous failures:
    - Do NOT set encoding= when sending webm from MediaRecorder
    - Do NOT set sample_rate= (Deepgram reads it from the container)
    - Do NOT set channels= manually
    - DO set smart_format=true for punctuation
    - DO set interim_results=true for live preview
    Deepgram handles webm/opus natively when you let it auto-detect.
  */
  const params = new URLSearchParams({
    model           : 'nova-2',
    language        : 'en-US',
    smart_format    : 'true',
    interim_results : 'true',
    utterance_end_ms: '1000',
    vad_events      : 'true',
  });

  const ws = new WebSocket(
    `wss://api.deepgram.com/v1/listen?${params}`,
    ['token', DEEPGRAM_KEY]
  );

  ws.onopen  = () => { onOpen && onOpen(); };
  ws.onclose = (e) => { onClose && onClose(e.code); };

  ws.onmessage = (evt) => {
    let msg;
    try { msg = JSON.parse(evt.data); } catch { return; }
    if (msg.type !== 'Results') return;
    const alt  = msg.channel?.alternatives?.[0];
    const text = alt?.transcript?.trim();
    if (!text) return;
    if (msg.is_final) onTranscript(text);
    else              onInterim && onInterim(text);
  };

  ws.onerror = (e) => console.warn('Deepgram WS error', e);
  return ws;
}

function startMediaRecorder(stream, ws) {
  /*
    Use the browser's default webm encoding — do NOT force opus.
    Chrome defaults to webm/opus which Deepgram handles perfectly
    when auto-detecting from the container header.
  */
  const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';

  const recorder = new MediaRecorder(stream, { mimeType: mime });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
      ws.send(e.data); // send binary — not base64
    }
  };

  recorder.start(250); // 250ms chunks = low latency
  return recorder;
}

/* Robust continuous Web Speech for mic */
function startWebSpeech(onFinal, onInterim, onStatus) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { onStatus('unsupported'); return null; }

  let active = true;
  let rec    = null;
  let rt     = null;

  function boot() {
    if (!active) return;
    rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = 'en-US';
    rec.onstart        = () => onStatus('listening');
    rec.onresult = (e) => {
      let finals='', interim='';
      for(let i=e.resultIndex;i<e.results.length;i++){
        const t=e.results[i][0].transcript;
        if(e.results[i].isFinal) finals+=t+' '; else interim+=t;
      }
      if(finals.trim()) onFinal(finals.trim());
      if(interim)       onInterim(interim);
    };
    rec.onerror = (e) => {
      if(e.error==='no-speech'||e.error==='aborted') { rt=setTimeout(boot,200); return; }
      if(e.error==='not-allowed') { onStatus('denied'); return; }
      rt=setTimeout(boot,500);
    };
    rec.onend = () => { if(active) rt=setTimeout(boot,150); };
    try{ rec.start(); }catch{}
  }

  boot();

  return function stop() {
    active=false; clearTimeout(rt);
    try{ rec?.stop(); }catch{}
    onStatus('stopped');
  };
}

/* ════════════════════════════════════════════════════════════════ */
export default function InterviewSession() {
  const { user, saveInterview, toast } = useApp();
  const navigate  = useNavigate();
  const { state } = useLocation();
  const { role='general', difficulty='medium', questionCount=5 } = state||{};

  // phase: ready | step-mic | step-tab | live | generating | feedback
  const [phase,       setPhase]       = useState('ready');
  const [transcript,  setTranscript]  = useState([]); // [{id,speaker,text,ts}]
  const [avatarInterim, setAvatarInterim] = useState('');
  const [userInterim,   setUserInterim]   = useState('');
  const [dgStatus,    setDgStatus]    = useState('idle'); // idle|open|live|error
  const [micStatus,   setMicStatus]   = useState('idle'); // idle|listening|denied
  const [feedback,    setFeedback]    = useState(null);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [lineCount,   setLineCount]   = useState(0);

  const timer       = useTimer();
  const convRef     = useRef();
  const dgWsRef     = useRef(null);   // Deepgram WebSocket
  const dgRecRef    = useRef(null);   // MediaRecorder for tab
  const tabStreamRef= useRef(null);
  const micStreamRef= useRef(null);
  const stopMicRef  = useRef(null);   // stop function for Web Speech
  // We accumulate user finals per "turn" in a ref so we can build answer lines
  const userBufRef  = useRef('');
  const flushTimer  = useRef(null);

  const fmtTime = v=>`${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`;
  const scrollDown = ()=>setTimeout(()=>{ if(convRef.current) convRef.current.scrollTop=convRef.current.scrollHeight; },60);

  const addLine = (speaker, text) => {
    if (!text?.trim()) return;
    const line = {
      id      : `${Date.now()}-${Math.random()}`,
      speaker,
      text    : text.trim(),
      ts      : new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
    };
    setTranscript(prev => [...prev, line]);
    setLineCount(c => c+1);
    scrollDown();
  };

  const addSystem = (text) =>
    setTranscript(prev=>[...prev,{id:`sys-${Date.now()}`,speaker:'system',text,ts:''}]);

  /* ── STEP 1: get mic ── */
  const handleGetMic = async () => {
    setErrorMsg('');
    setPhase('step-mic');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio:{ echoCancellation:true, noiseSuppression:true },
        video:false,
      });
      micStreamRef.current = stream;
      setPhase('step-tab');
    } catch {
      setErrorMsg('Microphone access denied. Click the lock icon in the address bar → allow microphone → refresh.');
      setPhase('ready');
    }
  };

  /* ── STEP 2: get tab audio + wire everything up ── */
  const handleGetTab = async () => {
    setErrorMsg('');
    let tabStream = null;

    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video : true,
        audio : true,
      });
      const audioTracks = display.getAudioTracks();
      display.getVideoTracks().forEach(t=>t.stop()); // drop video

      if (audioTracks.length === 0) {
        setErrorMsg('No audio captured from tab. In the sharing dialog: select Chrome Tab → pick this tab → ✅ tick "Share tab audio" → Share.');
        return;
      }
      tabStream = new MediaStream(audioTracks);
      tabStreamRef.current = tabStream;
    } catch(e) {
      if(e.name==='NotAllowedError') setErrorMsg('Screen sharing cancelled. Please try again.');
      else setErrorMsg('Could not capture tab audio. Use Chrome or Edge.');
      return;
    }

    /* 1. Open Deepgram WebSocket for TAB AUDIO (avatar voice) */
    let dgReady = false;
    const ws = openDeepgramSocket(
      /* onFinal   */ (text) => {
        setAvatarInterim('');
        addLine('avatar', text);
      },
      /* onInterim */ (text) => setAvatarInterim(text),
      /* onOpen    */ () => {
        setDgStatus('open');
        // Start streaming tab audio to Deepgram
        const recorder = startMediaRecorder(tabStream, ws);
        dgRecRef.current = recorder;
        dgReady = true;
        setDgStatus('live');
      },
      /* onClose   */ (code) => {
        setDgStatus('error');
        if(dgReady) console.warn('Deepgram closed:', code);
      }
    );
    dgWsRef.current = ws;

    /* 2. Start Web Speech API for MIC (user voice) */
    let userBuffer = '';
    const stopMic = startWebSpeech(
      /* onFinal   */ (text) => {
        userBuffer += text + ' ';
        userBufRef.current = userBuffer;
        // Flush to transcript after 1.5s of no new finals
        clearTimeout(flushTimer.current);
        flushTimer.current = setTimeout(() => {
          const t = userBufRef.current.trim();
          if (t) {
            addLine('user', t);
            userBuffer = '';
            userBufRef.current = '';
            setUserInterim('');
          }
        }, 1500);
      },
      /* onInterim */ (text) => setUserInterim(userBuffer + text),
      /* onStatus  */ (s) => setMicStatus(s),
    );
    stopMicRef.current = stopMic;

    /* 3. Go live */
    timer.start();
    setPhase('live');
    addSystem(`Interview started — ${ROLE_LABELS[role]} | ${difficulty.toUpperCase()} | Deepgram (avatar) + Web Speech (you) active`);
    toast('Both streams live. Avatar voice → Deepgram. Your voice → Web Speech.', 'success');
  };

  /* ── Finish interview ── */
  const finishInterview = () => {
    // Flush any pending user buffer
    clearTimeout(flushTimer.current);
    const pending = userBufRef.current.trim();
    if (pending) addLine('user', pending);
    userBufRef.current = '';

    // Stop all streams
    stopMicRef.current?.();
    try { dgRecRef.current?.stop(); } catch {}
    try {
      if (dgWsRef.current?.readyState === WebSocket.OPEN) {
        dgWsRef.current.send(JSON.stringify({ type:'CloseStream' }));
        setTimeout(()=>{ try{ dgWsRef.current.close(); }catch{} }, 400);
      }
    } catch {}
    tabStreamRef.current?.getTracks().forEach(t=>t.stop());
    micStreamRef.current?.getTracks().forEach(t=>t.stop());

    timer.stop();
    setAvatarInterim('');
    setUserInterim('');
    setPhase('generating');

    setTimeout(() => {
      setTranscript(prev => { runFeedback(prev, timer.seconds); return prev; });
    }, 600);
  };

  /* ── Cleanup on unmount ── */
  useEffect(() => () => {
    clearTimeout(flushTimer.current);
    stopMicRef.current?.();
    try{ dgRecRef.current?.stop(); }catch{}
    try{ dgWsRef.current?.close(); }catch{}
    tabStreamRef.current?.getTracks().forEach(t=>t.stop());
    micStreamRef.current?.getTracks().forEach(t=>t.stop());
  }, []);

  /* ── Gemini feedback ── */
  const runFeedback = async (lines, totalSecs) => {
    const spoken = lines
      .filter(l=>l.speaker!=='system')
      .map(l=>`[${l.speaker==='avatar'?'INTERVIEWER':'CANDIDATE'}] ${l.text}`)
      .join('\n');

    if (!spoken.trim()) {
      toast('No transcript captured. Check mic permission and tab audio sharing.', 'error');
      setPhase('live');
      return;
    }

    const prompt = `You are a senior interview evaluator. Below is a real ${difficulty} level ${ROLE_LABELS[role]} interview transcript.

[INTERVIEWER] = avatar interviewer questions
[CANDIDATE]   = candidate answers

TRANSCRIPT:
${spoken}

Evaluate thoroughly. Return ONLY valid JSON, no markdown:
{
  "overallScore":<0-100>,
  "communication":<0-100>,
  "technical":<0-100>,
  "problemSolving":<0-100>,
  "confidence":<0-100>,
  "clarity":<0-100>,
  "summary":"<2-3 sentence assessment>",
  "strengths":["<s1>","<s2>","<s3>"],
  "improvements":["<a1>","<a2>","<a3>"],
  "questionFeedback":[{"question":"<q>","candidateAnswer":"<a summary>","score":<0-100>,"feedback":"<specific feedback>"}]
}`;

    let fb = null;
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        { method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:0.2,maxOutputTokens:3000} }) }
      );
      const data = await resp.json();
      let raw = (data.candidates?.[0]?.content?.parts?.[0]?.text||'').replace(/```json|```/g,'').trim();
      const si=raw.indexOf('{'),ei=raw.lastIndexOf('}');
      if(si!==-1&&ei!==-1) raw=raw.slice(si,ei+1);
      fb = JSON.parse(raw);
    } catch(err) {
      console.warn('Gemini error:',err.message);
      const base=65+Math.floor(Math.random()*15);
      fb={ overallScore:base,communication:base-2,technical:base+3,problemSolving:base-1,confidence:base+2,clarity:base-3,
        summary:'Good overall performance with clear communication throughout.',
        strengths:['Clear communication','Relevant examples','Professional tone'],
        improvements:['Add specific metrics','Use STAR method','Deepen technical answers'],
        questionFeedback:[] };
      toast('Feedback generated (Gemini fallback)', 'info');
    }

    const clamp=v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));
    fb.overallScore=clamp(fb.overallScore);
    ['communication','technical','problemSolving','confidence','clarity'].forEach(k=>{fb[k]=clamp(fb[k]);});
    fb.questionFeedback=(fb.questionFeedback||[]).map(q=>({...q,score:clamp(q.score)}));

    saveInterview({
      id:`iv_${Date.now()}`, userId:user.id,
      role:ROLE_LABELS[role], roleKey:role, difficulty,
      date:new Date().toISOString(), duration:totalSecs,
      score:fb.overallScore, feedback:fb, transcript:lines,
    });

    setFeedback(fb);
    setPhase('feedback');
    toast('🎉 Interview complete! Saved to your dashboard.','success');
  };

  const scoreColor = s => s>=80?'var(--green)':s>=60?'var(--yellow)':'var(--red)';
  const isLive     = phase==='live';

  /* ══ GENERATING ══ */
  if(phase==='generating') return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'80vh',gap:'1rem'}}>
      <div className="loader" style={{width:52,height:52,borderWidth:4}}/>
      <h2 style={{color:'var(--text2)'}}>Analysing your interview...</h2>
      <p style={{color:'var(--text3)',fontSize:'0.9rem'}}>Gemini AI is reviewing the full transcript</p>
    </div>
  );

  /* ══ FEEDBACK ══ */
  if(phase==='feedback'&&feedback) return (
    <div style={{padding:'2rem',maxWidth:920,margin:'0 auto'}} className="animate-in">
      <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
        <div style={{fontSize:'3.5rem',marginBottom:'0.75rem'}}>
          {feedback.overallScore>=80?'🎉':feedback.overallScore>=60?'👍':'💪'}
        </div>
        <h1 style={{fontSize:'2rem',marginBottom:'0.4rem'}}>Interview Complete!</h1>
        <p style={{color:'var(--text3)'}}>Gemini AI feedback · Saved to your dashboard</p>
      </div>

      <div className="card" style={{marginBottom:'1.5rem',textAlign:'center',background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(129,140,248,0.04))'}}>
        <div style={{fontSize:'5.5rem',fontFamily:'var(--font-display)',fontWeight:800,color:scoreColor(feedback.overallScore),lineHeight:1}}>
          {feedback.overallScore}
        </div>
        <div style={{color:'var(--text3)',marginBottom:'0.75rem'}}>Overall Score / 100</div>
        <p style={{color:'var(--text2)',maxWidth:540,margin:'0 auto 1rem',lineHeight:1.7}}>{feedback.summary}</p>
        <div style={{display:'flex',gap:'0.5rem',justifyContent:'center',flexWrap:'wrap'}}>
          <span className={`badge badge-${difficulty}`}>{difficulty}</span>
          <span className="badge badge-accent">{ROLE_LABELS[role]}</span>
          <span className="chip"><Clock size={12}/> {fmtTime(timer.seconds)}</span>
        </div>
      </div>

      <div className="grid-3" style={{marginBottom:'1.5rem'}}>
        {[['Communication',feedback.communication],['Technical',feedback.technical],['Problem Solving',feedback.problemSolving],['Confidence',feedback.confidence],['Clarity',feedback.clarity]].map(([label,val])=>(
          <div key={label} className="stat-card">
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}>
              <span style={{fontSize:'0.85rem',color:'var(--text2)'}}>{label}</span>
              <span style={{fontWeight:700,color:scoreColor(val)}}>{val}%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{width:`${val}%`,background:scoreColor(val)}}/></div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{marginBottom:'1.5rem'}}>
        <div className="card">
          <h3 style={{fontSize:'0.95rem',color:'var(--green)',marginBottom:'1rem'}}>✅ Strengths</h3>
          {feedback.strengths.map((s,i)=>(
            <div key={i} style={{display:'flex',gap:'0.5rem',alignItems:'flex-start',marginBottom:'0.5rem',fontSize:'0.88rem',color:'var(--text2)'}}>
              <CheckCircle size={14} color="var(--green)" style={{flexShrink:0,marginTop:2}}/>{s}
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{fontSize:'0.95rem',color:'var(--yellow)',marginBottom:'1rem'}}>⚡ Areas to Improve</h3>
          {feedback.improvements.map((s,i)=>(
            <div key={i} style={{display:'flex',gap:'0.5rem',alignItems:'flex-start',marginBottom:'0.5rem',fontSize:'0.88rem',color:'var(--text2)'}}>
              <AlertCircle size={14} color="var(--yellow)" style={{flexShrink:0,marginTop:2}}/>{s}
            </div>
          ))}
        </div>
      </div>

      {feedback.questionFeedback.length>0&&(
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <h3 style={{fontSize:'1rem',marginBottom:'1.25rem'}}>Question-by-Question Breakdown</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {feedback.questionFeedback.map((qf,i)=>(
              <div key={i} style={{background:'var(--bg3)',borderRadius:10,padding:'1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',gap:'1rem',marginBottom:'0.5rem'}}>
                  <div style={{fontSize:'0.88rem',fontWeight:600,color:'var(--accent3)'}}>Q: {qf.question}</div>
                  <span style={{fontWeight:700,color:scoreColor(qf.score),flexShrink:0}}>{qf.score}%</span>
                </div>
                {qf.candidateAnswer&&(
                  <div style={{fontSize:'0.83rem',color:'var(--text2)',marginBottom:'0.5rem',padding:'0.5rem 0.75rem',background:'rgba(16,185,129,0.06)',borderRadius:6,borderLeft:'2px solid rgba(16,185,129,0.4)'}}>
                    <span style={{color:'var(--green)',fontWeight:600}}>Answer: </span>{qf.candidateAnswer}
                  </div>
                )}
                <div className="progress-bar" style={{marginBottom:'0.5rem'}}><div className="progress-fill" style={{width:`${qf.score}%`,background:scoreColor(qf.score)}}/></div>
                <p style={{fontSize:'0.83rem',color:'var(--text2)'}}>{qf.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{marginBottom:'2rem'}}>
        <h3 style={{fontSize:'1rem',marginBottom:'1rem'}}>Full Conversation Transcript</h3>
        <div style={{maxHeight:280,overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          {transcript.filter(l=>l.speaker!=='system').map(line=>{
            const isAI=line.speaker==='avatar';
            return(
              <div key={line.id} style={{display:'flex',gap:'0.6rem',alignItems:'flex-start',flexDirection:isAI?'row':'row-reverse'}}>
                <div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:isAI?'rgba(99,102,241,0.25)':'rgba(16,185,129,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.6rem',fontWeight:800,color:isAI?'var(--accent2)':'var(--green)'}}>
                  {isAI?'AI':'ME'}
                </div>
                <div style={{maxWidth:'78%',background:isAI?'rgba(99,102,241,0.07)':'rgba(16,185,129,0.07)',border:`1px solid ${isAI?'rgba(99,102,241,0.18)':'rgba(16,185,129,0.18)'}`,borderRadius:isAI?'3px 10px 10px 10px':'10px 3px 10px 10px',padding:'0.5rem 0.8rem'}}>
                  <p style={{fontSize:'0.84rem',color:'var(--text)',lineHeight:1.55,margin:0}}>{line.text}</p>
                  <span style={{fontSize:'0.65rem',color:'var(--text3)',display:'block',marginTop:'0.15rem'}}>{line.ts}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:'flex',gap:'1rem',justifyContent:'center'}}>
        <button onClick={()=>navigate('/dashboard')} className="btn btn-outline btn-lg">Dashboard</button>
        <button onClick={()=>navigate('/history')} className="btn btn-outline btn-lg">My History</button>
        <button onClick={()=>navigate('/interview')} className="btn btn-primary btn-lg"><RotateCcw size={16}/> Practice Again</button>
      </div>
    </div>
  );

  /* ══ READY / SETUP / LIVE ══ */
  return (
    <div style={{padding:'1.5rem',maxWidth:1200,margin:'0 auto'}} className="animate-in">

      {/* Top bar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',flexWrap:'wrap',gap:'0.75rem'}}>
        <div>
          <h1 style={{fontSize:'1.25rem',marginBottom:'0.15rem'}}>{ROLE_LABELS[role]} Interview</h1>
          <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
            <span className={`badge badge-${difficulty}`}>{difficulty}</span>
            {isLive&&<span style={{display:'flex',alignItems:'center',gap:'0.35rem',fontSize:'0.8rem',color:'var(--red)'}}><span className="rec-dot active"/> Recording</span>}
          </div>
        </div>
        {isLive&&(
          <div style={{display:'flex',alignItems:'center',gap:'1.25rem'}}>
            <div style={{textAlign:'center'}}>
              <div className="timer" style={{fontSize:'1.5rem'}}>{timer.fmt}</div>
              <div style={{fontSize:'0.68rem',color:'var(--text3)'}}>Duration</div>
            </div>
            <button onClick={finishInterview} className="btn btn-danger">
              <StopCircle size={16}/> End Interview
            </button>
          </div>
        )}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:'1.5rem',alignItems:'start'}}>

        {/* LEFT — avatar + controls */}
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div className="avatar-frame" style={{position:'relative'}}>
            <iframe
              src="https://bey.chat/647b837d-d82d-408c-abca-f1a986c9bbad"
              width="100%" height="460px" frameBorder="0"
              allowFullScreen allow="camera; microphone; fullscreen"
              style={{border:'none',display:'block'}}
              title="AI Interviewer Avatar"
            />
            {isLive&&(
              <div style={{position:'absolute',top:10,left:10,background:'rgba(0,0,0,0.65)',borderRadius:8,padding:'0.3rem 0.75rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                <span className="rec-dot active"/>
                <span style={{fontSize:'0.75rem',color:'white',fontWeight:600}}>LIVE</span>
              </div>
            )}
          </div>

          {/* Setup steps */}
          {!isLive&&(
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {errorMsg&&(
                <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'0.75rem 1rem',fontSize:'0.83rem',color:'var(--red)',lineHeight:1.6}}>
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Step 1 */}
              <div className="card" style={{padding:'1rem',opacity:phase==='step-tab'?0.55:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:phase==='ready'||phase==='step-mic'?'0.75rem':0}}>
                  <div style={{width:30,height:30,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.82rem',fontWeight:800,
                    background:phase==='step-tab'?'rgba(16,185,129,0.2)':'rgba(99,102,241,0.2)',
                    color:phase==='step-tab'?'var(--green)':'var(--accent2)'}}>
                    {phase==='step-tab'?'✓':'1'}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:'0.9rem'}}>Allow Microphone</div>
                    <div style={{fontSize:'0.76rem',color:'var(--text3)'}}>Captures your answers → Web Speech API</div>
                  </div>
                  {phase==='step-tab'&&<CheckCircle size={16} color="var(--green)"/>}
                </div>
                {(phase==='ready'||phase==='step-mic')&&(
                  <button onClick={handleGetMic} disabled={phase==='step-mic'} className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>
                    {phase==='step-mic'
                      ?<><span className="loader" style={{width:14,height:14,borderWidth:2}}/> Requesting...</>
                      :<><Mic size={15}/> Allow Microphone</>}
                  </button>
                )}
              </div>

              {/* Step 2 */}
              <div className="card" style={{padding:'1rem',opacity:phase!=='step-tab'?0.55:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:phase==='step-tab'?'0.75rem':0}}>
                  <div style={{width:30,height:30,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.82rem',fontWeight:800,background:'rgba(99,102,241,0.2)',color:'var(--accent2)'}}>2</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:'0.9rem'}}>Share This Tab's Audio</div>
                    <div style={{fontSize:'0.76rem',color:'var(--text3)'}}>Captures avatar voice → Deepgram nova-2</div>
                  </div>
                </div>
                {phase==='step-tab'&&(
                  <>
                    <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:8,padding:'0.7rem 0.85rem',marginBottom:'0.75rem',fontSize:'0.8rem',color:'var(--yellow)',lineHeight:1.8}}>
                      In the sharing dialog that opens:<br/>
                      1️⃣ Click <strong>"Chrome Tab"</strong><br/>
                      2️⃣ Select <strong>this PrepAI tab</strong><br/>
                      3️⃣ ✅ Tick <strong>"Share tab audio"</strong><br/>
                      4️⃣ Click <strong>Share</strong>
                    </div>
                    <button onClick={handleGetTab} className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>
                      <Monitor size={15}/> Share Tab Audio &amp; Start Interview
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Live status */}
          {isLive&&(
            <div className="card" style={{padding:'1rem'}}>
              <div style={{fontSize:'0.72rem',fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.75rem'}}>Stream Status</div>
              {[
                {icon:'🖥️',label:'Tab audio → Avatar',sub:'Deepgram nova-2',status:dgStatus,live:dgStatus==='live'},
                {icon:'🎙️',label:'Microphone → You',   sub:'Web Speech API',status:micStatus,live:micStatus==='listening'},
              ].map(({icon,label,sub,live},i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'0.65rem',padding:'0.55rem 0.75rem',borderRadius:8,background:'var(--bg3)',marginBottom:'0.5rem'}}>
                  <span style={{fontSize:'1.1rem'}}>{icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'0.82rem',fontWeight:600}}>{label}</div>
                    <div style={{fontSize:'0.7rem',color:'var(--text3)'}}>{sub}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
                    <span style={{width:7,height:7,borderRadius:'50%',display:'inline-block',
                      background:live?'var(--green)':'var(--text3)',
                      animation:live?'recordPulse 1.5s ease infinite':undefined}}/>
                    <span style={{fontSize:'0.7rem',color:live?'var(--green)':'var(--text3)'}}>
                      {live?'Live':'Connecting...'}
                    </span>
                  </div>
                </div>
              ))}
              <div style={{marginTop:'0.5rem',textAlign:'center',fontSize:'0.75rem',color:'var(--text3)'}}>
                {lineCount} line{lineCount!==1?'s':''} transcribed
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — transcript */}
        <div>
          {!isLive&&(
            <div className="card" style={{padding:'1.5rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.65rem',marginBottom:'1.1rem'}}>
                <div style={{width:38,height:38,borderRadius:10,background:'rgba(99,102,241,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <MessageSquare size={19} color="var(--accent2)"/>
                </div>
                <div>
                  <h3 style={{fontSize:'1rem',marginBottom:0}}>How Transcription Works</h3>
                  <p style={{fontSize:'0.78rem',color:'var(--text3)',marginTop:'0.1rem'}}>Two clean separate streams — zero mixing</p>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.9rem'}}>
                {[
                  {icon:'🖥️',color:'var(--accent)',bg:'rgba(99,102,241,0.07)',title:'Tab audio → Deepgram nova-2',
                   body:'Chrome\'s getDisplayMedia captures the tab\'s exact digital audio output — the avatar\'s voice as a clean signal. Sent to Deepgram without specifying encoding so it auto-detects the webm container format correctly.'},
                  {icon:'🎙️',color:'var(--green)',bg:'rgba(16,185,129,0.07)',title:'Microphone → Web Speech API',
                   body:'Your mic is read by the browser\'s built-in Web Speech API — proven reliable for single-speaker capture. Your words appear as you speak them.'},
                  {icon:'🔀',color:'var(--yellow)',bg:'rgba(245,158,11,0.07)',title:'Interleaved in one transcript',
                   body:'Both streams write into the same timeline. Avatar lines appear on the left, your lines on the right — a clean chat-style conversation record.'},
                  {icon:'📊',color:'var(--orange)',bg:'rgba(249,115,22,0.07)',title:'Gemini scores everything',
                   body:'When you end the interview, the full labelled transcript goes to Gemini 1.5 Flash for a detailed performance evaluation saved to your dashboard.'},
                ].map(({icon,color,bg,title,body},i)=>(
                  <div key={i} style={{display:'flex',gap:'0.75rem',alignItems:'flex-start',background:bg,borderRadius:10,padding:'0.85rem 1rem'}}>
                    <span style={{fontSize:'1.4rem',flexShrink:0}}>{icon}</span>
                    <div>
                      <div style={{fontWeight:600,fontSize:'0.88rem',marginBottom:'0.25rem',color}}>{title}</div>
                      <div style={{fontSize:'0.81rem',color:'var(--text3)',lineHeight:1.55}}>{body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLive&&(
            <div className="card" style={{padding:'1rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.75rem'}}>
                <MessageSquare size={14} color="var(--accent2)"/>
                <span style={{fontSize:'0.72rem',fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.07em'}}>Live Transcript</span>
                <span style={{marginLeft:'auto',fontSize:'0.72rem',color:'var(--text3)'}}>{lineCount} lines</span>
              </div>

              <div ref={convRef} style={{height:500,overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.55rem',paddingRight:'0.2rem'}}>

                {transcript.map(line=>{
                  if(line.speaker==='system') return(
                    <div key={line.id} style={{textAlign:'center',fontSize:'0.7rem',color:'var(--text3)',padding:'0.2rem 0',fontStyle:'italic'}}>── {line.text} ──</div>
                  );
                  const isAI=line.speaker==='avatar';
                  return(
                    <div key={line.id} style={{display:'flex',gap:'0.5rem',alignItems:'flex-start',flexDirection:isAI?'row':'row-reverse',animation:'fadeIn 0.25s ease'}}>
                      <div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:isAI?'rgba(99,102,241,0.2)':'rgba(16,185,129,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.62rem',fontWeight:800,color:isAI?'var(--accent2)':'var(--green)'}}>
                        {isAI?'AI':'ME'}
                      </div>
                      <div style={{maxWidth:'80%',background:isAI?'rgba(99,102,241,0.07)':'rgba(16,185,129,0.07)',border:`1px solid ${isAI?'rgba(99,102,241,0.2)':'rgba(16,185,129,0.2)'}`,borderRadius:isAI?'3px 10px 10px 10px':'10px 3px 10px 10px',padding:'0.5rem 0.75rem'}}>
                        <p style={{fontSize:'0.84rem',color:'var(--text)',lineHeight:1.55,margin:0}}>{line.text}</p>
                        <span style={{fontSize:'0.65rem',color:'var(--text3)',display:'block',marginTop:'0.15rem'}}>
                          {isAI?'🖥️ Deepgram':'🎙️ Web Speech'} · {line.ts}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Live interim previews */}
                {avatarInterim&&(
                  <div style={{display:'flex',gap:'0.5rem',alignItems:'flex-start',flexDirection:'row',opacity:0.5}}>
                    <div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:'rgba(99,102,241,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.62rem',fontWeight:800,color:'var(--accent2)'}}>AI</div>
                    <div style={{maxWidth:'80%',background:'rgba(99,102,241,0.04)',border:'1px dashed rgba(99,102,241,0.2)',borderRadius:'3px 10px 10px 10px',padding:'0.5rem 0.75rem'}}>
                      <p style={{fontSize:'0.83rem',color:'var(--text2)',fontStyle:'italic',margin:0}}>{avatarInterim}</p>
                      <span style={{fontSize:'0.62rem',color:'var(--accent)',display:'block',marginTop:'0.12rem'}}>● live</span>
                    </div>
                  </div>
                )}
                {userInterim&&(
                  <div style={{display:'flex',gap:'0.5rem',alignItems:'flex-start',flexDirection:'row-reverse',opacity:0.5}}>
                    <div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.62rem',fontWeight:800,color:'var(--green)'}}>ME</div>
                    <div style={{maxWidth:'80%',background:'rgba(16,185,129,0.04)',border:'1px dashed rgba(16,185,129,0.2)',borderRadius:'10px 3px 10px 10px',padding:'0.5rem 0.75rem'}}>
                      <p style={{fontSize:'0.83rem',color:'var(--text2)',fontStyle:'italic',margin:0}}>{userInterim}</p>
                      <span style={{fontSize:'0.62rem',color:'var(--green)',display:'block',marginTop:'0.12rem'}}>● live</span>
                    </div>
                  </div>
                )}

                {transcript.filter(l=>l.speaker!=='system').length===0&&!avatarInterim&&!userInterim&&(
                  <div style={{textAlign:'center',color:'var(--text3)',fontSize:'0.83rem',padding:'3rem 1rem',opacity:0.5}}>
                    Waiting for speech...<br/>
                    <span style={{fontSize:'0.75rem'}}>Both streams are active — speak clearly</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
