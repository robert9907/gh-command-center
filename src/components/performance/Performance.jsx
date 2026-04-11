import { useState } from "react";

const SKEY_PERF = "gh-cc-perf";
const SEED_PERF = [];

function safeLSGet(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}}
function safeLSSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

export default function Performance({ isDark = true }) {
  const [perfData, setPerfDataRaw] = useState(() => safeLSGet(SKEY_PERF) || SEED_PERF);
  const bg = isDark ? "#0F2440" : "#fff";
  const tc = isDark ? "#fff" : "#000";

  return (
    <div style={{padding:"32px",color:tc,background:bg,minHeight:"100vh"}}>
      <h2 style={{fontSize:24,fontWeight:700,marginBottom:8}}>📊 Performance</h2>
      <p style={{color:"#94a3b8",marginBottom:24}}>Full dashboard migrating from File B — coming next session.</p>
      <div style={{background:"rgba(255,255,255,0.05)",borderRadius:12,padding:20}}>
        <p style={{color:"#14B8A6",fontWeight:600}}>{perfData.length} weeks of data loaded</p>
        {perfData.slice(-4).map((w,i) => (
          <div key={i} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.08)",fontSize:13}}>
            <span style={{color:"#94a3b8",marginRight:12}}>{w.weekOf}</span>
            <span style={{marginRight:16}}>👥 {w.users} users</span>
            <span style={{marginRight:16}}>📈 {w.impressions} impr</span>
            <span>🤖 {w.chatgpt} ChatGPT</span>
          </div>
        ))}
      </div>
    </div>
  );
}
