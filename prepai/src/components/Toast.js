import React from 'react';
import {useApp} from '../context/AppContext';
import {CheckCircle,XCircle,Info} from 'lucide-react';
export default function Toast(){
  const{toasts}=useApp();
  return(
    <div className="toast-container">
      {toasts.map(t=>(
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type==='success'&&<CheckCircle size={15} color="var(--green)"/>}
          {t.type==='error'&&<XCircle size={15} color="var(--red)"/>}
          {t.type==='info'&&<Info size={15} color="var(--accent2)"/>}
          <span style={{fontSize:'.87rem'}}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
