const fs = require('fs');
const path = require('path');

async function build() {
  const babel = require('@babel/core');
  
  const html = fs.readFileSync('index.html', 'utf8');
  
  const babelStart = html.indexOf('<script type="text/babel">');
  const babelEnd = html.indexOf('</script>', babelStart);
  const babelCode = html.slice(babelStart + 26, babelEnd);
  
  console.log(`Compiling Babel block: ${babelCode.length} chars...`);
  
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
  
  const compiled = result.code;
  console.log(`Compiled: ${compiled.length} chars`);
  
  // Replace the babel script block with plain JS
  const newHtml = 
    html.slice(0, babelStart) +
    '<script>' +
    compiled +
    html.slice(babelEnd);
  
  // Write to output directory
  fs.mkdirSync('dist', { recursive: true });
  fs.writeFileSync('dist/index.html', newHtml);
  console.log('✅ Built dist/index.html');
}

build().catch(err => {
  console.error('Build failed:', err.message);
  process.exit(1);
});
