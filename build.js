const fs = require('fs');
const path = require('path');

async function build() {
  const babel = require('@babel/core');
  
  const html = fs.readFileSync('index.html', 'utf8');
  
  const babelStart = html.indexOf('<script type="text/babel">');
  const babelEnd = html.indexOf('</script>', babelStart);
  const babelCode = html.slice(babelStart + 26, babelEnd);
  
  console.log(`Compiling Babel block: ${babelCode.length} chars...`);
  
  let compiled;
  try {
    const result = await babel.transformAsync(babelCode, {
      presets: [
        ['@babel/preset-react', { runtime: 'classic' }],
        ['@babel/preset-env', { 
          targets: { browsers: ['last 2 versions'] },
          modules: false
        }]
      ],
      filename: 'app.jsx'
    });
    compiled = result.code;
    console.log(`Compiled successfully: ${compiled.length} chars`);
  } catch(err) {
    console.error('Babel compile error:', err.message);
    // Fallback: serve with Babel standalone (original file)
    compiled = null;
  }
  
  let newHtml;
  if (compiled) {
    newHtml = 
      html.slice(0, babelStart) +
      '<script>' +
      compiled +
      html.slice(babelEnd);
  } else {
    newHtml = html;
  }
  
  fs.mkdirSync('dist', { recursive: true });
  fs.writeFileSync('dist/index.html', newHtml);
  
  // Copy API file
  fs.mkdirSync('dist/api', { recursive: true });
  fs.copyFileSync('api/fetch-page.js', 'dist/api/fetch-page.js');
  
  console.log('Built dist/index.html');
}

build().catch(err => {
  console.error('Build failed:', err.message);
  process.exit(1);
});
