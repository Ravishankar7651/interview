import React,{useState,useRef} from 'react';
import {useApp} from '../context/AppContext';
import {Upload,User,Briefcase,GraduationCap,Plus,X,CheckCircle,FileText,Phone,Mail} from 'lucide-react';

/* 
  Resume parsing uses Gemini 1.5 Flash which accepts multimodal input
  including PDF documents directly via the Files API or inline base64.
  For plain text / doc files we extract text first then send to Gemini.
  This avoids CORS issues that plague Anthropic's API in the browser.
*/
const GEMINI_KEY='AIzaSyC734TvymUzEBgDXPwdmYVQGh7yv4MlXBc';

async function extractTextFromFile(file){
  /* For text-based files read directly */
  if(file.name.match(/\.(txt|md)$/i)){
    return await file.text();
  }
  /* For PDF — use FileReader to get base64 then send to Gemini vision */
  if(file.name.match(/\.pdf$/i)){
    return null; // handled separately with base64
  }
  /* For doc/docx — try reading as text (basic extraction) */
  try{ return await file.text(); }catch{ return ''; }
}

async function parseResumeWithGemini(textOrBase64,isPDF=false,mimeType='text/plain'){
  let parts=[];
  if(isPDF){
    parts=[
      {inline_data:{mime_type:mimeType,data:textOrBase64}},
      {text:`Extract all information from this resume PDF and return ONLY valid JSON (no markdown, no explanation):
{
  "bio": "2-3 sentence professional summary",
  "skills": ["skill1","skill2","skill3"],
  "experience": "work experience as a paragraph",
  "education": "education as a paragraph",
  "phone": "phone number or empty string",
  "email": "email address or empty string",
  "name": "full name or empty string"
}`}
    ];
  }else{
    parts=[{text:`Extract information from this resume text and return ONLY valid JSON (no markdown, no explanation):
{
  "bio": "2-3 sentence professional summary based on the content",
  "skills": ["skill1","skill2","up to 15 skills"],
  "experience": "work experience summary as a paragraph",
  "education": "education summary as a paragraph",
  "phone": "phone number or empty string",
  "email": "email address or empty string",
  "name": "full name or empty string"
}

Resume text:
${textOrBase64.substring(0,4000)}`}
    ];
  }

  const resp=await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        contents:[{parts}],
        generationConfig:{temperature:0.1,maxOutputTokens:1500}
      })
    }
  );
  const data=await resp.json();
  const raw=(data.candidates?.[0]?.content?.parts?.[0]?.text||'').replace(/```json|```/g,'').trim();
  const si=raw.indexOf('{'),ei=raw.lastIndexOf('}');
  if(si===-1)throw new Error('No JSON in response');
  return JSON.parse(raw.slice(si,ei+1));
}

export default function Profile(){
  const{user,updateUser,toast}=useApp();
  const[profile,setProfile]=useState({
    bio:user.profile?.bio||'',phone:user.profile?.phone||'',
    skills:user.profile?.skills||[],experience:user.profile?.experience||'',
    education:user.profile?.education||'',...(user.profile||{})
  });
  const[skillInput,setSkillInput]=useState('');
  const[uploading,setUploading]=useState(false);
  const[saving,setSaving]=useState(false);
  const[uploadStatus,setUploadStatus]=useState('');
  const fileRef=useRef();

  const handleFile=async file=>{
    if(!file)return;
    const validTypes=/\.(pdf|txt|doc|docx|md)$/i;
    if(!validTypes.test(file.name)){toast('Please upload PDF, TXT, DOC, or DOCX file','error');return;}
    if(file.size>10*1024*1024){toast('File too large (max 10MB)','error');return;}

    setUploading(true);
    setUploadStatus('Reading file...');

    try{
      let extracted=null;

      if(file.name.match(/\.pdf$/i)){
        setUploadStatus('Extracting data from PDF with Gemini AI...');
        const base64=await new Promise((res,rej)=>{
          const r=new FileReader();
          r.onload=()=>res(r.result.split(',')[1]);
          r.onerror=rej;
          r.readAsDataURL(file);
        });
        extracted=await parseResumeWithGemini(base64,true,'application/pdf');
      }else{
        setUploadStatus('Reading text content...');
        const text=await file.text();
        if(!text.trim()){toast('File appears to be empty','error');setUploading(false);return;}
        setUploadStatus('Analysing resume with Gemini AI...');
        extracted=await parseResumeWithGemini(text,false);
      }

      if(!extracted)throw new Error('Could not extract data');

      const updated={
        ...profile,
        bio:extracted.bio||profile.bio,
        skills:extracted.skills?.slice(0,15)||profile.skills,
        experience:extracted.experience||profile.experience,
        education:extracted.education||profile.education,
        phone:extracted.phone||profile.phone,
      };
      setProfile(updated);

      // Read raw text for storage
      let rawText='';
      try{ rawText=file.name.match(/\.pdf$/i)?'[PDF - data extracted by Gemini]':await file.text(); }catch{}

      updateUser({
        profile:updated,
        resume:{name:file.name,text:rawText,uploadedAt:new Date().toISOString(),extractedName:extracted.name}
      });
      toast('✅ Resume parsed successfully! Profile updated.','success');
      setUploadStatus('');
    }catch(err){
      console.error('Resume parse error:',err);
      toast('Failed to parse resume. Please try a different file format.','error');
      setUploadStatus('');
    }
    setUploading(false);
  };

  const handleDrop=e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);};
  const addSkill=()=>{
    const s=skillInput.trim();
    if(!s||profile.skills.includes(s))return;
    setProfile({...profile,skills:[...profile.skills,s]});
    setSkillInput('');
  };
  const removeSkill=s=>setProfile({...profile,skills:profile.skills.filter(x=>x!==s)});
  const save=async()=>{
    setSaving(true);
    await new Promise(r=>setTimeout(r,350));
    updateUser({profile});
    toast('Profile saved!','success');
    setSaving(false);
  };

  return(
    <div>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.8rem',marginBottom:'.25rem'}}>My Profile</h1>
        <p style={{color:'var(--text3)'}}>Manage your profile and upload your resume for personalised AI interviews</p>
      </div>

      <div className="grid-2">
        <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:'1.2rem',marginBottom:'1.5rem'}}>
              <div style={{width:70,height:70,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.7rem',color:'white',flexShrink:0}}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 style={{fontSize:'1.2rem'}}>{user.name}</h2>
                <div style={{display:'flex',alignItems:'center',gap:'.4rem',color:'var(--text3)',fontSize:'.84rem',marginTop:'.15rem'}}>
                  <Mail size={13}/>{user.email}
                </div>
                {profile.phone&&<div style={{display:'flex',alignItems:'center',gap:'.4rem',color:'var(--text3)',fontSize:'.84rem',marginTop:'.15rem'}}><Phone size={13}/>{profile.phone}</div>}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div>
                <label style={{fontSize:'.82rem',color:'var(--text2)',fontWeight:500,display:'flex',alignItems:'center',gap:'.4rem',marginBottom:'.4rem'}}><User size={13}/> Professional Summary</label>
                <textarea value={profile.bio} onChange={e=>setProfile({...profile,bio:e.target.value})} placeholder="Write a brief professional summary..." rows={4}/>
              </div>
              <div>
                <label style={{fontSize:'.82rem',color:'var(--text2)',fontWeight:500,display:'flex',alignItems:'center',gap:'.4rem',marginBottom:'.4rem'}}><Phone size={13}/> Phone Number</label>
                <input type="tel" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} placeholder="+91 98765 43210"/>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{fontSize:'1rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'.5rem'}}><Briefcase size={15} color="var(--accent2)"/> Work Experience</h3>
            <textarea value={profile.experience} onChange={e=>setProfile({...profile,experience:e.target.value})} placeholder="Describe your work experience..." rows={5}/>
          </div>

          <div className="card">
            <h3 style={{fontSize:'1rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'.5rem'}}><GraduationCap size={15} color="var(--accent2)"/> Education</h3>
            <textarea value={profile.education} onChange={e=>setProfile({...profile,education:e.target.value})} placeholder="Your educational background..." rows={4}/>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
          <div className="card">
            <h3 style={{fontSize:'1rem',marginBottom:'1.25rem',display:'flex',alignItems:'center',gap:'.5rem'}}><FileText size={15} color="var(--accent2)"/> Resume Upload</h3>

            {user.resume&&(
              <div style={{display:'flex',alignItems:'center',gap:'.75rem',background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.25)',borderRadius:9,padding:'.75rem 1rem',marginBottom:'1rem'}}>
                <CheckCircle size={17} color="var(--green)"/>
                <div style={{flex:1}}>
                  <div style={{fontSize:'.88rem',fontWeight:600,color:'var(--green)'}}>{user.resume.name}</div>
                  <div style={{fontSize:'.74rem',color:'var(--text3)'}}>Uploaded {new Date(user.resume.uploadedAt).toLocaleDateString()}</div>
                </div>
              </div>
            )}

            <div
              className={`upload-zone ${uploading?'drag-over':''}`}
              onDrop={handleDrop}
              onDragOver={e=>e.preventDefault()}
              onClick={()=>!uploading&&fileRef.current.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx,.md" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
              {uploading?(
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'.75rem'}}>
                  <div className="loader"/>
                  <p style={{color:'var(--text2)',fontSize:'.9rem'}}>{uploadStatus||'Processing...'}</p>
                </div>
              ):(
                <>
                  <Upload size={30} color="var(--accent2)" style={{marginBottom:'.75rem'}}/>
                  <p style={{color:'var(--text2)',fontSize:'.9rem',marginBottom:'.3rem'}}>
                    Drop your resume or <span style={{color:'var(--accent2)',fontWeight:600}}>click to browse</span>
                  </p>
                  <p style={{color:'var(--text3)',fontSize:'.78rem'}}>PDF, TXT, DOC, DOCX · Max 10MB</p>
                  <p style={{color:'var(--text3)',fontSize:'.75rem',marginTop:'.3rem'}}>Gemini AI will extract your skills, experience &amp; education</p>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{fontSize:'1rem',marginBottom:'1.25rem'}}>Skills ({profile.skills.length})</h3>
            <div style={{display:'flex',flexWrap:'wrap',gap:'.35rem',marginBottom:'1rem',minHeight:40}}>
              {profile.skills.map((s,i)=>(
                <span key={i} className="skill-tag">
                  {s}
                  <button onClick={()=>removeSkill(s)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',padding:0,display:'flex',lineHeight:1,marginLeft:'.2rem'}}>
                    <X size={11}/>
                  </button>
                </span>
              ))}
              {profile.skills.length===0&&<p style={{color:'var(--text3)',fontSize:'.85rem',padding:'.2rem 0'}}>No skills yet — upload your resume or add manually</p>}
            </div>
            <div style={{display:'flex',gap:'.5rem'}}>
              <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSkill()} placeholder="Add a skill (e.g. Python, React...)"/>
              <button onClick={addSkill} className="btn btn-primary btn-sm" style={{flexShrink:0}}><Plus size={14}/></button>
            </div>
          </div>

          <button onClick={save} className="btn btn-primary btn-lg" disabled={saving} style={{justifyContent:'center'}}>
            {saving?<span className="loader" style={{width:18,height:18,borderWidth:2}}/>:'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
