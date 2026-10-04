import React,{useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';
import {useApp} from '../context/AppContext';
import {Brain,Eye,EyeOff,ArrowRight,Sparkles} from 'lucide-react';

export default function AuthPage({mode='login'}){
  const{login,register}=useApp();
  const navigate=useNavigate();
  const[form,setForm]=useState({name:'',email:'',password:''});
  const[err,setErr]=useState('');
  const[loading,setLoading]=useState(false);
  const[show,setShow]=useState(false);
  const isLogin=mode==='login';

  const submit=async e=>{
    e.preventDefault();setErr('');setLoading(true);
    await new Promise(r=>setTimeout(r,380));
    if(isLogin){
      const r=login(form.email,form.password);
      if(r.error)setErr(r.error);
    }else{
      if(!form.name.trim()){setErr('Name is required');setLoading(false);return;}
      if(form.password.length<6){setErr('Password must be at least 6 characters');setLoading(false);return;}
      const r=register(form.name,form.email,form.password);
      if(r.error)setErr(r.error);
    }
    setLoading(false);
  };

  return(
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem',position:'relative',overflow:'hidden'}}>
      {/* background */}
      <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.14) 0%,transparent 70%)',top:'-200px',left:'-200px',pointerEvents:'none'}}/>
      <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(129,140,248,.09) 0%,transparent 70%)',bottom:'-100px',right:'-100px',pointerEvents:'none'}}/>

      <div style={{width:'100%',maxWidth:440,position:'relative',zIndex:1,animation:'fadeIn .5s ease'}}>
        {/* back to landing */}
        <div style={{marginBottom:'1.5rem',textAlign:'center'}}>
          <Link to="/" style={{display:'inline-flex',alignItems:'center',gap:'.5rem',color:'var(--text3)',fontSize:'.85rem',transition:'color .2s'}} onMouseEnter={e=>e.currentTarget.style.color='var(--text2)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}>
            <Brain size={14}/> PrepAI
          </Link>
        </div>

        <div style={{background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:20,padding:'2.5rem',boxShadow:'0 24px 64px rgba(0,0,0,.5)'}}>
          <div style={{textAlign:'center',marginBottom:'2rem'}}>
            <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:54,height:54,borderRadius:15,background:'linear-gradient(135deg,var(--accent),var(--accent2))',marginBottom:'1rem',boxShadow:'0 8px 24px rgba(99,102,241,.4)'}}>
              <Brain size={27} color="white"/>
            </div>
            <h1 style={{fontSize:'1.6rem',marginBottom:'.25rem'}}>{isLogin?'Welcome back':'Create account'}</h1>
            <p style={{color:'var(--text3)',fontSize:'.88rem'}}>{isLogin?'Sign in to your PrepAI account':'Start your interview journey today'}</p>
          </div>

          <div style={{background:'rgba(99,102,241,.07)',border:'1px solid var(--border2)',borderRadius:9,padding:'.6rem 1rem',marginBottom:'1.5rem',fontSize:'.8rem',color:'var(--accent3)',display:'flex',gap:'.5rem',alignItems:'center'}}>
            <Sparkles size={13}/>
            <span>Demo admin: <b>admin@prepai.com</b> / <b>admin123</b></span>
          </div>

          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {!isLogin&&(
              <div>
                <label style={{display:'block',fontSize:'.82rem',color:'var(--text2)',fontWeight:500,marginBottom:'.4rem'}}>Full Name</label>
                <input type="text" placeholder="John Smith" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
              </div>
            )}
            <div>
              <label style={{display:'block',fontSize:'.82rem',color:'var(--text2)',fontWeight:500,marginBottom:'.4rem'}}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'.82rem',color:'var(--text2)',fontWeight:500,marginBottom:'.4rem'}}>Password</label>
              <div style={{position:'relative'}}>
                <input type={show?'text':'password'} placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{paddingRight:'3rem'}} required minLength={6}/>
                <button type="button" onClick={()=>setShow(!show)} style={{position:'absolute',right:'.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text3)',padding:0,cursor:'pointer'}}>
                  {show?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            {err&&<div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:8,padding:'.6rem .9rem',color:'var(--red)',fontSize:'.85rem'}}>{err}</div>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{marginTop:'.4rem',justifyContent:'center'}}>
              {loading?<span className="loader" style={{width:18,height:18,borderWidth:2}}/>:<>{isLogin?'Sign In':'Create Account'}<ArrowRight size={16}/></>}
            </button>
          </form>

          <div className="divider"/>
          <p style={{textAlign:'center',fontSize:'.88rem',color:'var(--text3)'}}>
            {isLogin?"Don't have an account? ":"Already have an account? "}
            <Link to={isLogin?'/register':'/login'} style={{color:'var(--accent2)',fontWeight:600}}>
              {isLogin?'Sign up free':'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
