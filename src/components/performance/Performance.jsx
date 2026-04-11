import { useState } from 'react';
const SKEY='gh-cc-perf';
function sget(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return null;}}
function sset(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
const SEED=[
  {weekOf:'2025-12-01',users:59,organic:15,chatgpt:21,direct:27,social:3,impressions:1434,clicks:21,calls:0,aiCited:0},
  {weekOf:'2025-12-08',users:65,organic:17,chatgpt:23,direct:30,social:3,impressions:1581,clicks:12,calls:0,aiCited:0},
  {weekOf:'2026-01-05',users:123,organic:32,chatgpt:43,direct:56,social:5,impressions:2962,clicks:22,calls:0,aiCited:0},
  {weekOf:'2026-01-12',users:129,organic:33,chatgpt:45,direct:60,social:6,impressions:3120,clicks:20,calls:0,aiCited:0},
  {weekOf:'2026-01-19',users:143,organic:37,chatgpt:50,direct:66,social:6,impressions:3458,clicks:23,calls:0,aiCited:0},
  {weekOf:'2026-01-26',users:127,organic:33,chatgpt:44,direct:58,social:6,impressions:3060,clicks:17,calls:0,aiCited:0},
  {weekOf:'2026-02-02',users:132,organic:34,chatgpt:46,direct:61,social:6,impressions:3189,clicks:26,calls:0,aiCited:0},
  {weekOf:'2026-02-09',users:96,organic:25,chatgpt:34,direct:44,social:4,impressions:2321,clicks:41,calls:0,aiCited:0},
  {weekOf:'2026-02-16',users:77,organic:20,chatgpt:27,direct:36,social:3,impressions:1869,clicks:23,calls:0,aiCited:0},
];
function arw(c,p){if(!p)return{s:'-',col:'#687788'};const d=((c-p)/p*100).toFixed(0);return d>0?{s:'up '+d+'%',col:'#16A34A'}:{s:'dn '+Math.abs(d)+'%',col:'#EF4444'};}
export default function Performance(){
  const card='var(--gh-panel)',bdr='var(--gh-border)',tc='var(--gh-text)',mc='var(--gh-text-muted)',teal='#14B8A6';
  const [data,setDataRaw]=useState(()=>sget(SKEY)||SEED);
  const [tab,setTab]=useState('dashboard');
  const [entry,setEntry]=useState({weekOf:'',users:0,organic:0,chatgpt:0,direct:0,social:0,impressions:0,clicks:0,calls:0,aiCited:0});
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [aiText,setAiText]=useState('');
  const [aiLoading,setAiLoading]=useState(false);
  const setData=v=>{const n=typeof v==='function'?v(data):v;setDataRaw(n);sset(SKEY,n);};
  const weeks=[...data].sort((a,b)=>a.weekOf.localeCompare(b.weekOf));
  const lat=weeks[weeks.length-1],prv=weeks[weeks.length-2];
  const save=()=>{setData(p=>{const i=p.findIndex(e=>e.weekOf===entry.weekOf);if(i>=0){const n=[...p];n[i]=entry;return n;}return[...p,entry];});setEntry({weekOf:'',users:0,organic:0,chatgpt:0,direct:0,social:0,impressions:0,clicks:0,calls:0,aiCited:0});setShowForm(false);setEditing(null);};
  const del=wk=>{if(window.confirm('Delete '+wk))setData(p=>p.filter(e=>e.weekOf!==wk));};
  const brief=async()=>{setAiLoading(true);setAiText('');try{const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:500,system:'Performance analyst for Rob Simm, Medicare broker Durham NC. Sections: WHERE YOU ARE, WHATS WORKING, THIS WEEK PRIORITIES. Specific numbers. Under 300 words.',messages:[{role:'user',content:'Data: '+JSON.stringify(weeks.slice(-8))+'. Generate briefing.'}]})});const d=await r.json();setAiText(d.content?.[0]?.text||'Error');}catch(e){setAiText('Error: '+e.message);}setAiLoading(false);};
  const tbtn=t=>({padding:'6px 16px',borderRadius:20,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,background:tab===t?teal:'transparent',color:tab===t?'#fff':mc});
  const btns=(col='#0071E3')=>({padding:'8px 18px',borderRadius:8,border:'none',background:col,color:'#fff',fontWeight:600,fontSize:13,cursor:'pointer'});
  const inp={width:'100%',background:'var(--gh-border)',border:'1px solid var(--gh-border)',borderRadius:8,padding:'8px 12px',color:tc,fontSize:14,outline:'none',boxSizing:'border-box'};
  const SC=({l,v,p})=>{const a=arw(v,p);return(<div style={{background:card,border:'1px solid '+bdr,borderRadius:12,padding:'16px 20px'}}><div style={{fontSize:11,color:mc,textTransform:'uppercase',marginBottom:6}}>{l}</div><div style={{fontSize:26,fontWeight:700,color:tc,marginBottom:4}}>{v!=null?v.toLocaleString():'--'}</div><div style={{fontSize:12,color:a.col,fontWeight:600}}>{a.s}</div></div>);};
  return(<div style={{background:'var(--gh-bg)',minHeight:'100vh',padding:'24px 28px',color:tc}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
      <div><h2 style={{fontSize:22,fontWeight:700,margin:0}}>Performance</h2><p style={{fontSize:13,color:mc,margin:'4px 0 0'}}>{weeks.length} weeks logged</p></div>
      <div style={{display:'flex',gap:8}}>{['dashboard','table','log'].map(t=><button key={t} style={tbtn(t)} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}</div>
    </div>
    {tab==='dashboard'&&<div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:24}}>
        <SC l='Users' v={lat?.users} p={prv?.users}/>
        <SC l='Impressions' v={lat?.impressions} p={prv?.impressions}/>
        <SC l='Clicks' v={lat?.clicks} p={prv?.clicks}/>
        <SC l='ChatGPT' v={lat?.chatgpt} p={prv?.chatgpt}/>
        <SC l='Calls' v={lat?.calls} p={prv?.calls}/>
        <SC l='AI Cited' v={lat?.aiCited} p={prv?.aiCited}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{background:card,border:'1px solid '+bdr,borderRadius:12,padding:20}}>
          <div style={{fontSize:12,fontWeight:600,color:mc,marginBottom:16,textTransform:'uppercase'}}>Traffic Sources</div>
          {lat&&[{l:'Organic',v:lat.organic,c:'#16A34A'},{l:'ChatGPT',v:lat.chatgpt,c:'#f59e0b'},{l:'Direct',v:lat.direct,c:'#3b82f6'},{l:'Social',v:lat.social,c:'#a855f7'}].map(({l,v,c})=>{const pct=lat.users>0?Math.round(v/lat.users*100):0;return(<div key={l} style={{marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}><span style={{color:tc}}>{l}</span><span style={{color:mc}}>{v} <span style={{color:c}}>{pct}%</span></span></div><div style={{background:'var(--gh-border)',borderRadius:4,height:6}}><div style={{width:pct+'%',background:c,height:6,borderRadius:4}}/></div></div>);})}
        </div>
        <div style={{background:card,border:'1px solid '+bdr,borderRadius:12,padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><div style={{fontSize:12,fontWeight:600,color:mc,textTransform:'uppercase'}}>AI Briefing</div><button style={btns()} onClick={brief} disabled={aiLoading}>{aiLoading?'Analyzing...':'Generate'}</button></div>
          {aiText?<div style={{fontSize:13,color:tc,lineHeight:1.7,whiteSpace:'pre-wrap',maxHeight:220,overflowY:'auto'}}>{aiText}</div>:<div style={{color:mc,fontSize:13,fontStyle:'italic'}}>Click Generate for your weekly AI briefing.</div>}
        </div>
      </div>
    </div>}
    {tab==='table'&&<div style={{background:card,border:'1px solid '+bdr,borderRadius:12,overflow:'hidden'}}><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr style={{borderBottom:'1px solid '+bdr}}>{['Week','Users','Organic','ChatGPT','Direct','Impr','Clicks','Calls','AI',''].map(h=><th key={h} style={{padding:'12px 14px',textAlign:'left',color:mc,fontWeight:600,fontSize:11,textTransform:'uppercase'}}>{h}</th>)}</tr></thead><tbody>{[...weeks].reverse().map((w,i)=>{const p2=weeks[weeks.indexOf(w)-1];const a=arw(w.users,p2?.users);return(<tr key={w.weekOf} style={{borderBottom:'1px solid '+bdr}}><td style={{padding:'10px 14px',fontWeight:600,color:i===0?teal:tc}}>{w.weekOf}</td><td style={{padding:'10px 14px'}}>{w.users} <span style={{fontSize:11,color:a.col}}>{a.s}</span></td><td style={{padding:'10px 14px'}}>{w.organic}</td><td style={{padding:'10px 14px',color:'#f59e0b'}}>{w.chatgpt}</td><td style={{padding:'10px 14px'}}>{w.direct}</td><td style={{padding:'10px 14px'}}>{w.impressions?.toLocaleString()}</td><td style={{padding:'10px 14px'}}>{w.clicks}</td><td style={{padding:'10px 14px',color:w.calls>0?'#16A34A':mc}}>{w.calls}</td><td style={{padding:'10px 14px',color:teal}}>{w.aiCited}</td><td style={{padding:'10px 8px'}}><button onClick={()=>{setEntry({...w});setEditing(w.weekOf);setTab('log');setShowForm(true);}} style={{background:'none',border:'none',color:'#3b82f6',cursor:'pointer',fontSize:12}}>Edit</button> <button onClick={()=>del(w.weekOf)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>Del</button></td></tr>);})}</tbody></table></div></div>}
    {tab==='log'&&<div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}><div style={{fontSize:14,color:mc}}>{editing?'Editing: '+editing:'Log a new week'}</div>{!showForm&&<button style={btns()} onClick={()=>{setEntry({weekOf:'',users:0,organic:0,chatgpt:0,direct:0,social:0,impressions:0,clicks:0,calls:0,aiCited:0});setEditing(null);setShowForm(true);}}>+ Log Week</button>}</div>
      {showForm&&<div style={{background:card,border:'1px solid '+bdr,borderRadius:12,padding:24,marginBottom:24}}><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:16}}>{[{k:'weekOf',l:'Week Of',t:'date'},{k:'users',l:'Users',t:'number'},{k:'organic',l:'Organic',t:'number'},{k:'chatgpt',l:'ChatGPT',t:'number'},{k:'direct',l:'Direct',t:'number'},{k:'social',l:'Social',t:'number'},{k:'impressions',l:'Impressions',t:'number'},{k:'clicks',l:'Clicks',t:'number'},{k:'calls',l:'Calls',t:'number'},{k:'aiCited',l:'AI Cited',t:'number'}].map(({k,l,t})=><div key={k}><label style={{fontSize:12,color:mc,marginBottom:3,display:'block'}}>{l}</label><input type={t} value={entry[k]!=null?entry[k]:''} onChange={e=>setEntry(p=>({...p,[k]:t==='number'?parseInt(e.target.value)||0:e.target.value}))} style={inp}/></div>)}</div><div style={{display:'flex',gap:8,marginTop:20}}><button style={btns()} onClick={save}>Save</button><button style={btns('#64748b')} onClick={()=>{setShowForm(false);setEditing(null);}}>Cancel</button></div></div>}
      <div style={{display:'flex',flexDirection:'column',gap:8}}>{[...weeks].reverse().slice(0,10).map(w=><div key={w.weekOf} style={{background:card,border:'1px solid '+bdr,borderRadius:8,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><span style={{fontWeight:600,color:tc,marginRight:16}}>{w.weekOf}</span><span style={{fontSize:13,color:mc}}>Users: {w.users} Impr: {w.impressions?.toLocaleString()} AI: {w.chatgpt} Calls: {w.calls}</span></div><div style={{display:'flex',gap:8}}><button onClick={()=>{setEntry({...w});setEditing(w.weekOf);setShowForm(true);}} style={btns('#3b82f6')}>Edit</button><button onClick={()=>del(w.weekOf)} style={btns('#ef4444')}>Del</button></div></div>)}</div>
    </div>}
  </div>);
}