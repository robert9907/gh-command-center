export default function ContentStudio({ isDark = true }) {
  return (
    <div style={{padding:"32px",color:isDark?"#fff":"#000"}}>
      <h2 style={{fontSize:24,fontWeight:700,marginBottom:8}}>✍️ Content Studio</h2>
      <p style={{color:"#94a3b8"}}>AI content pipeline — migrating from File B next session.</p>
    </div>
  );
}
