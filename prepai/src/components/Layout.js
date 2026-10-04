import React,{useState} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import {useApp} from '../context/AppContext';
import {LayoutDashboard,User,Mic,History,Shield,LogOut,Menu,X,Brain,ChevronRight} from 'lucide-react';

const NAV=[
  {path:'/dashboard',label:'Dashboard',icon:LayoutDashboard},
  {path:'/profile',label:'Profile',icon:User},
  {path:'/interview',label:'Start Interview',icon:Mic},
  {path:'/history',label:'My History',icon:History},
];

export default function Layout({children,fullWidth}){
  const{user,logout}=useApp();
  const navigate=useNavigate();
  const location=useLocation();
  const[open,setOpen]=useState(false);

  return(
    <div className="layout">
      {open&&<div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:99}}/>}
      <aside className={`sidebar ${open?'open':''}`} style={{transition:'transform .3s'}}>
        <div style={{padding:'1.4rem 1.1rem',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
            <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Brain size={19} color="white"/>
            </div>
            <div>
              <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.1rem'}}>PrepAI</div>
              <div style={{fontSize:'.7rem',color:'var(--text3)'}}>Interview System</div>
            </div>
          </div>
        </div>
        <div style={{padding:'1rem 1.1rem',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'.7rem'}}>
            <div style={{width:37,height:37,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:700,fontSize:'.9rem',color:'white',flexShrink:0}}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{overflow:'hidden'}}>
              <div style={{fontSize:'.87rem',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name}</div>
              <div style={{fontSize:'.72rem',color:'var(--text3)'}}>{user?.role==='admin'?'👑 Admin':'Candidate'}</div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:'.65rem 0',overflowY:'auto'}}>
          {NAV.map(({path,label,icon:Icon})=>(
            <button key={path} onClick={()=>{navigate(path);setOpen(false);}} className={`nav-item ${location.pathname===path?'active':''}`}>
              <Icon size={17}/><span>{label}</span>
              {location.pathname===path&&<ChevronRight size={13} style={{marginLeft:'auto',opacity:.5}}/>}
            </button>
          ))}
          {user?.role==='admin'&&(
            <button onClick={()=>{navigate('/admin');setOpen(false);}} className={`nav-item ${location.pathname==='/admin'?'active':''}`} style={{marginTop:'.5rem',borderTop:'1px solid var(--border)',paddingTop:'.85rem',borderRadius:0}}>
              <Shield size={17}/><span>Admin Panel</span>
            </button>
          )}
        </nav>
        <div style={{padding:'.9rem .45rem',borderTop:'1px solid var(--border)'}}>
          <button onClick={logout} className="nav-item" style={{color:'var(--red)',width:'calc(100% - .9rem)'}}>
            <LogOut size={17}/><span>Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className={fullWidth?'':' page animate-in'}>{children}</div>
      </main>
    </div>
  );
}
