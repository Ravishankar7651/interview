import React from 'react';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import {AppProvider,useApp} from './context/AppContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Interview from './pages/Interview';
import InterviewSession from './pages/InterviewSession';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import Toast from './components/Toast';

function Guard({children,adminOnly=false}){
  const{user,loading}=useApp();
  if(loading)return<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="loader"/></div>;
  if(!user)return<Navigate to="/login" replace/>;
  if(adminOnly&&user.role!=='admin')return<Navigate to="/dashboard" replace/>;
  return children;
}

function AppRoutes(){
  const{user,loading}=useApp();
  if(loading)return<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="loader"/></div>;
  return(
    <>
      <Routes>
        <Route path="/" element={user?<Navigate to="/dashboard"/>:<LandingPage/>}/>
        <Route path="/login" element={user?<Navigate to="/dashboard"/>:<AuthPage mode="login"/>}/>
        <Route path="/register" element={user?<Navigate to="/dashboard"/>:<AuthPage mode="register"/>}/>
        <Route path="/dashboard" element={<Guard><Layout><Dashboard/></Layout></Guard>}/>
        <Route path="/profile" element={<Guard><Layout><Profile/></Layout></Guard>}/>
        <Route path="/interview" element={<Guard><Layout><Interview/></Layout></Guard>}/>
        <Route path="/interview/session" element={<Guard><Layout fullWidth><InterviewSession/></Layout></Guard>}/>
        <Route path="/history" element={<Guard><Layout><History/></Layout></Guard>}/>
        <Route path="/admin" element={<Guard adminOnly><Layout><AdminDashboard/></Layout></Guard>}/>
        <Route path="*" element={<Navigate to="/"/>}/>
      </Routes>
      <Toast/>
    </>
  );
}

export default function App(){
  return<AppProvider><BrowserRouter><AppRoutes/></BrowserRouter></AppProvider>;
}
