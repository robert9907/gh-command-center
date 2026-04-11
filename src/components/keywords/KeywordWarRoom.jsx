import { useState } from 'react';
const SKEY='gh-cc-kw';
function sget(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return null;}}
function sset(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
const GROUPS=[{id:'medicare',label:'Medicare',color:'#489CD3'},{id:'aca',label:'ACA',color:'#16A34A'},{id:'local',label:'Local',color:'#F97316'}];
const SEED_KW=[
  {keyword:'medicare broker durham nc',group:'medicare',pos:3.2,clicks:45,impr:890,notes:'Top performer'},
  {keyword:'medicare advantage north carolina',group:'medicare',pos:8.1,clicks:23,impr:1240,notes:''},
  {keyword:'best medicare plans durham',group:'medicare',pos:5.4,clicks:31,impr:670,notes:'Good CTR'},
  {keyword:'turning 65 medicare nc',group:'medicare',pos:12.3,clicks:12,impr:980,notes:'Needs content'},
  {keyword:'aca marketplace nc 2026',group:'aca',pos:6.7,clicks:18,impr:445,notes:''},
  {keyword:'obamacare durham nc',group:'aca',pos:4.1,clicks:29,impr:560,notes:'Strong'},
  {keyword:'medicare agent near me',group:'local',pos:2.8,clicks:67,impr:1100,notes:'Top local'},
  {keyword:'insurance broker durham nc',group:'local',pos:4.9,clicks:38,impr:720,notes:''},
];
export default function KeywordWarRoom(){
  const card='var(--gh-panel)',bdr='var(--gh-border)',tc='var(--gh-text)',mc='var(--gh-text-muted)',teal='#14B8A6';
  const [kws,setKwsRaw]=useState(()=>sget(SKEY)||SEED_KW);
  const [filter,setFilter]=useState('all');
  const [search,setSearch]=useState('');
  const [sort,setSort]=useState('clicks');
  const [entry,setEntry]=useState({keyword:'',group:'medicare',pos:0,clicks:0,impr:0,notes:''});
  const [showAdd,setShowAdd]=useState(false);
  const setKws=v=>{const n=typeof v==='function'?v(kws):v;setKwsRaw(n);sset(SKEY,n);};
  const filtered=kws.filter(k=>(filter==='all'||k.group===filter)&&k.keyword.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='pos'?a.pos-b.pos:b[sort]-a[sort]);
  const save=()=>{setKws(p=>{const i=p.findIndex(k=>k.keyword===entry.keyword);if(i>=0){const n=[...p];n[i]=entry;return n;}return[...p,entry];});setEntry({keyword:'',group:'medicare',pos:0,clicks:0,impr:0,notes:''});setShowAdd(false);};
  const del=kw=>setKws(p=>p.filter(k=>k.keyword!==kw));
  const totals={clicks:kws.reduce((a,k)=>a+k.clicks,0),impr:kws.reduce((a,k)=>a+k.impr,0),avgPos:(kws.reduce((a,k)=>a+k.pos,0)/kws.length).toFixed(1)};
  const inp={background:'var(--gh-border)',border:'1px solid var(--gh-border)',borderRadius:6,padding:'7px 11px',color:tc,fontSize:13,outline:'none'};
  const btns=(col=teal)=>({padding:'7px 16px',borderRadius:6,border:'none',background:col,color:'#fff',fontWeight:600,fontSize:12,cursor:'pointer'});
  const posColor=p=>p<=3?'#16A34A':p<=7?'#f59e0b':'#ef4444';
  return(<div style={{background:'var(--gh-bg)',minHeight:'100vh',padding:'24px 28px',color:tc}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:700,margin:0}}>Keyword War Room</h2><p style={{fontSize:13,color:mc,margin:'4px 0 0'}}>{kws.length} keywords tracked</p></div>
      <button style={btns()} onClick={()=>setShowAdd(s=>!s)}>{showAdd?'Cancel':'+ Add Keyword'}</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
      {[{l:'Total Clicks',v:totals.clicks},{l:'Total Impressions',v:totals.impr.toLocaleString()},{l:'Avg Position',v:totals.avgPos}].map(({l,v})=>(
        <div key={l} style={{background:card,border:'1px solid '+bdr,borderRadius:10,padding:'14px 18px'}}><div style={{fontSize:11,color:mc,textTransform:'uppercase',marginBottom:4}}>{l}</div><div style={{fontSize:24,fontWeight:700,color:tc}}>{v}</div></div>
      ))}
    </div>
    {showAdd&&<div style={{background:card,border:'1px solid '+bdr,borderRadius:10,padding:20,marginBottom:20}}>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 2fr',gap:10,marginBottom:12}}>
        {[{k:'keyword',l:'Keyword',t:'text'},{k:'pos',l:'Position',t:'number'},{k:'clicks',l:'Clicks',t:'number'},{k:'impr',l:'Impressions',t:'number'},{k:'notes',l:'Notes',t:'text'}].map(({k,l,t})=>(
          <div key={k}><div style={{fontSize:11,color:mc,marginBottom:3}}>{l}</div><input type={t} value={entry[k]} onChange={e=>setEntry(p=>({...p,[k]:t==='number'?parseFloat(e.target.value)||0:e.target.value}))} style={{...inp,width:'100%',boxSizing:'border-box'}}/></div>
        ))}
        <div><div style={{fontSize:11,color:mc,marginBottom:3}}>Group</div><select value={entry.group} onChange={e=>setEntry(p=>({...p,group:e.target.value}))} style={{...inp,width:'100%'}}>{GROUPS.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></div>
      </div>
      <button style={btns()} onClick={save}>Save</button>
    </div>}
    <div style={{background:card,border:'1px solid '+bdr,borderRadius:10,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid '+bdr,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <input placeholder='Search keywords...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,width:220}}/>
        <div style={{display:'flex',gap:6}}>{[{id:'all',label:'All'},...GROUPS].map(g=><button key={g.id} onClick={()=>setFilter(g.id)} style={{padding:'5px 12px',borderRadius:20,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:filter===g.id?teal:'transparent',color:filter===g.id?'#fff':mc}}>{g.label}</button>)}</div>
        <div style={{marginLeft:'auto',display:'flex',gap:6,alignItems:'center'}}><span style={{fontSize:12,color:mc}}>Sort:</span>{['clicks','impr','pos'].map(s=><button key={s} onClick={()=>setSort(s)} style={{padding:'4px 10px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:sort===s?teal:'transparent',color:sort===s?'#fff':mc}}>{s}</button>)}</div>
      </div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr style={{borderBottom:'1px solid '+bdr}}>{['Keyword','Group','Position','Clicks','Impressions','CTR','Notes',''].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',color:mc,fontWeight:600,fontSize:11,textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map((k,i)=>{const g=GROUPS.find(g=>g.id===k.group);const ctr=k.impr>0?(k.clicks/k.impr*100).toFixed(1):'0';return(<tr key={k.keyword} style={{borderBottom:'1px solid '+bdr,background:i%2===0?'transparent':'rgba(128,128,128,0.04)'}}><td style={{padding:'10px 14px',fontWeight:500,color:tc}}>{k.keyword}</td><td style={{padding:'10px 14px'}}><span style={{padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600,background:g?.color+'22',color:g?.color}}>{g?.label}</span></td><td style={{padding:'10px 14px',color:posColor(k.pos),fontWeight:700}}>{k.pos}</td><td style={{padding:'10px 14px',color:tc}}>{k.clicks}</td><td style={{padding:'10px 14px',color:mc}}>{k.impr.toLocaleString()}</td><td style={{padding:'10px 14px',color:parseFloat(ctr)>3?'#16A34A':mc}}>{ctr}%</td><td style={{padding:'10px 14px',color:mc,fontSize:12}}>{k.notes}</td><td style={{padding:'10px 8px'}}><button onClick={()=>del(k.keyword)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>Del</button></td></tr>);})}</tbody>
      </table></div>
    </div>
  </div>);
}