import React,{createContext,useContext,useState,useEffect} from 'react';
const AppContext=createContext();

function init(){
  if(!localStorage.getItem('prepai_users'))
    localStorage.setItem('prepai_users',JSON.stringify([{id:'admin',email:'admin@prepai.com',password:'admin123',name:'Admin',role:'admin',createdAt:new Date().toISOString()}]));
  if(!localStorage.getItem('prepai_interviews'))
    localStorage.setItem('prepai_interviews',JSON.stringify([]));
}

export function AppProvider({children}){
  const[user,setUser]=useState(null);
  const[loading,setLoading]=useState(true);
  const[toasts,setToasts]=useState([]);

  useEffect(()=>{
    init();
    const s=localStorage.getItem('prepai_session');
    if(s){try{const u=JSON.parse(s);const all=getUsers();const fresh=all.find(x=>x.id===u.id);setUser(fresh||u);}catch{}}
    setLoading(false);
  },[]);

  const getUsers=()=>{try{return JSON.parse(localStorage.getItem('prepai_users')||'[]');}catch{return[];}};
  const saveUsers=u=>localStorage.setItem('prepai_users',JSON.stringify(u));
  const getAllInterviews=()=>{try{return JSON.parse(localStorage.getItem('prepai_interviews')||'[]');}catch{return[];}};
  const saveAllInterviews=a=>localStorage.setItem('prepai_interviews',JSON.stringify(a));

  const login=(email,password)=>{
    const found=getUsers().find(u=>u.email===email&&u.password===password);
    if(!found)return{error:'Invalid email or password'};
    setUser(found);localStorage.setItem('prepai_session',JSON.stringify(found));
    return{user:found};
  };

  const register=(name,email,password)=>{
    const users=getUsers();
    if(users.find(u=>u.email===email))return{error:'Email already registered'};
    const nu={id:Date.now().toString(),email,password,name,role:'user',createdAt:new Date().toISOString(),profile:{bio:'',skills:[],experience:'',education:'',phone:''},resume:null};
    saveUsers([...users,nu]);setUser(nu);localStorage.setItem('prepai_session',JSON.stringify(nu));
    return{user:nu};
  };

  const logout=()=>{setUser(null);localStorage.removeItem('prepai_session');};

  const updateUser=updates=>{
    const users=getUsers();const idx=users.findIndex(u=>u.id===user.id);
    if(idx===-1)return;
    const updated={...users[idx],...updates};users[idx]=updated;
    saveUsers(users);setUser(updated);localStorage.setItem('prepai_session',JSON.stringify(updated));
    return updated;
  };

  const saveInterview=interview=>{
    try{
      const all=JSON.parse(localStorage.getItem('prepai_interviews')||'[]');
      localStorage.setItem('prepai_interviews',JSON.stringify([...all,{...interview,savedAt:new Date().toISOString()}]));
    }catch(e){console.error('saveInterview error',e);}
  };

  const getUserInterviews=userId=>{try{return JSON.parse(localStorage.getItem('prepai_interviews')||'[]').filter(i=>i.userId===userId);}catch{return[];}};
  const removeUser=userId=>{saveUsers(getUsers().filter(u=>u.id!==userId));saveAllInterviews(getAllInterviews().filter(i=>i.userId!==userId));};

  const toast=(msg,type='info')=>{
    const id=Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3800);
  };

  return(
    <AppContext.Provider value={{user,loading,login,register,logout,updateUser,saveInterview,getUserInterviews,getAllInterviews,removeUser,getUsers,toasts,toast}}>
      {children}
    </AppContext.Provider>
  );
}
export const useApp=()=>useContext(AppContext);
