import { useState } from "react";

const SKEY_PERF = "gh-cc-perf";
function safeLSGet(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}}
function safeLSSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

export default function Performance({ isDark = true }) {
  const [perfData] = useState(() => safeLSGet(SKEY_PERF) || []);
  return (
    <div style={{padding:"32px",color:isDark?"#fff":"#000"}}>
      <h2 style={{fontSize:24,fontWeight:700,marginBottom:8}}>📊 Performance</h2>
      <p style={{color:"#94a3b8",marginBottom:24}}>Full dashboard — next session.</p>
      <p style={{color:"#14B8A6",fontWeight:600}}>{perfData.length} weeks of data loaded</p>
    </div>
  );
}
