import { useState } from 'react';
const VOICE = 'You are Rob Simm, independent Medicare/ACA broker in Durham NC. NC License #10447418, AHIP Certified. You talk like a knowledgeable neighbor - straight, warm, local. No 1-800 call center energy. You simplify Medicare by making people picture real situations. You use NEPQ: open with an emotional situation question, then give Robs real answer, then a soft CTA. Always mention Durham or North Carolina. Phone: (828) 761-3326. Website: generationhealth.me.';
const PLATFORMS = [
  {id:'fb',label:'Facebook',icon:'📘',color:'#1877F2',charLimit:2000,tone:'NEPQ story format. Open with an emotional situation the reader is already living. Two short paragraphs of Robs voice. Close with soft CTA and phone number. Scroll-stopper energy. 150-250 words.'},
  {id:'gmb',label:'Google Business',icon:'📍',color:'#34A853',charLimit:500,tone:'Short, local, punchy. One sentence on the topic, one sentence establishing Rob as the Durham neighbor who has the answer, phone number, link to the page. Under 150 words. No hashtags.'},
  {id:'li',label:'LinkedIn',icon:'💼',color:'#0A66C2',charLimit:1300,tone:'Professional credibility. Open with a Medicare fact or stat relevant to the topic. Build to Robs expertise angle. Close with an insight question that invites engagement. More polished than Facebook but still Robs voice. 120-180 words.'},
  {id:'email',label:'Email',icon:'📧',color:'#14B8A6',charLimit:0,tone:'Personal, direct, helpful. Subject line first. Short paragraphs. One clear ask or insight per email. Sign off as Rob. 200-300 words.'},
];
const TOPICS = ['Medicare Advantage vs Medigap','Turning 65 in NC','Open Enrollment mistakes','Duke Health network coverage','Part D drug costs 2026','IRMAA and income brackets','Medicare Supplement Plan G vs N','Special Enrollment Periods','ACA marketplace subsidies','Medicare and working past 65'];
export default function ContentStudio(){
  const card='var(--gh-panel)',bdr='var(--gh-border)',tc='var(--gh-text)',mc='var(--gh-text-muted)',teal='#14B8A6';
  const [platform,setPlatform]=useState('fb');
  const [topic,setTopic]=useState('');
  const [customTopic,setCustomTopic]=useState('');
  const [output,setOutput]=useState('');
  const [loading,setLoading]=useState(false);
  const [copied,setCopied]=useState(false);
  const [history,setHistory]=useState([]);
  const plat=PLATFORMS.find(p=>p.id===platform);
  const activeTopic=topic==='custom'?customTopic:topic;
  const generate=async()=>{
    if(!activeTopic.trim())return;
    setLoading(true);setOutput('');
    try{
      const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:VOICE,messages:[{role:'user',content:'Write a '+plat.label+' post about: '+activeTopic+'. Tone guide: '+plat.tone+(plat.charLimit?' Keep under '+plat.charLimit+' characters.':'')}]})});
      const d=await r.json();
      const text=d.content?.[0]?.text||'Error generating content.';
      setOutput(text);
      setHistory(h=>[{platform:plat.label,topic:activeTopic,text,ts:new Date().toLocaleTimeString()},...h].slice(0,10));
    }catch(e){setOutput('Error: '+e.message);}
    setLoading(false);
  };
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const inp={width:'100%',background:'var(--gh-border)',border:'1px solid var(--gh-border)',borderRadius:8,padding:'10px 14px',color:tc,fontSize:14,outline:'none',boxSizing:'border-box'};
  const btns=(col=teal)=>({padding:'10px 24px',borderRadius:8,border:'none',background:col,color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'});
  return(<div style={{background:'var(--gh-bg)',minHeight:'100vh',padding:'24px 28px',color:tc}}>
    <div style={{marginBottom:24}}><h2 style={{fontSize:22,fontWeight:700,margin:0}}>Content Studio</h2><p style={{fontSize:13,color:mc,margin:'4px 0 0'}}>NEPQ-powered content for every platform</p></div>
    <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:20}}>
      <div>
        <div style={{background:card,border:'1px solid '+bdr,borderRadius:12,padding:20,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:600,color:mc,textTransform:'uppercase',marginBottom:12}}>Platform</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {PLATFORMS.map(p=><button key={p.id} onClick={()=>setPlatform(p.id)} style={{padding:'10px 14px',borderRadius:8,border:'2px solid '+(platform===p.id?p.color:bdr),background:platform===p.id?p.color+'18':'transparent',color:platform===p.id?p.color:mc,fontWeight:600,fontSize:13,cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:8}}><span>{p.icon}</span>{p.label}{p.charLimit?<span style={{marginLeft:'auto',fontSize:11,opacity:0.7}}>{p.charLimit} chars</span>:null}</button>)}
          </div>
        </div>
        <div style={{background:card,border:'1px solid '+bdr,borderRadius:12,padding:20}}>
          <div style={{fontSize:12,fontWeight:600,color:mc,textTransform:'uppercase',marginBottom:12}}>Topic</div>
          <select value={topic} onChange={e=>setTopic(e.target.value)} style={{...inp,marginBottom:10}}>
            <option value=''>Select a topic...</option>
            {TOPICS.map(t=><option key={t} value={t}>{t}</option>)}
            <option value='custom'>Custom topic...</option>
          </select>
          {topic==='custom'&&<input placeholder='Enter your topic...' value={customTopic} onChange={e=>setCustomTopic(e.target.value)} style={inp}/>}
          <button style={{...btns(),width:'100%',marginTop:12}} onClick={generate} disabled={loading||!activeTopic.trim()}>{loading?'Generating...':'Generate'}</button>
        </div>
      </div>
      <div>
        <div style={{background:card,border:'1px solid '+bdr,borderRadius:12,padding:20,minHeight:300}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:mc,textTransform:'uppercase'}}>{plat.label} Output {output&&<span style={{color:mc,fontWeight:400}}>({output.length} chars)</span>}</div>
            {output&&<button style={btns(copied?'#16A34A':'#64748b')} onClick={copy}>{copied?'Copied':'Copy'}</button>}
          </div>
          {loading?<div style={{color:mc,fontStyle:'italic',padding:'40px 0',textAlign:'center'}}>Generating {plat.label} content...</div>:output?<div style={{fontSize:14,color:tc,lineHeight:1.8,whiteSpace:'pre-wrap',borderLeft:'3px solid '+plat.color,paddingLeft:16}}>{output}</div>:<div style={{color:mc,fontSize:13,fontStyle:'italic',padding:'40px 0',textAlign:'center'}}>Select a platform and topic, then click Generate.</div>}
        </div>
        {history.length>0&&<div style={{marginTop:16}}>
          <div style={{fontSize:12,fontWeight:600,color:mc,textTransform:'uppercase',marginBottom:10}}>Recent</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {history.map((h,i)=><div key={i} style={{background:card,border:'1px solid '+bdr,borderRadius:8,padding:'10px 14px',cursor:'pointer'}} onClick={()=>setOutput(h.text)}><div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:mc,marginBottom:4}}><span>{h.platform}</span><span>{h.ts}</span></div><div style={{fontSize:13,color:tc,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.topic}</div></div>)}
          </div>
        </div>}
      </div>
    </div>
  </div>);
}