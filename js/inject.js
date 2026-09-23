const fs = require('fs');
const path = 'c:/Users/diseño web/Desktop/Landing HTML/';

const indexContent = fs.readFileSync(path + 'LionTech.html', 'utf8');

// Extract CSS
const cssMatch = indexContent.match(/(\/\* ==========================================================\s*NOSOTROS[\s\S]*?)(\/\* ==========================================================\s*SEDES)/);
let css = cssMatch[1];

// Extract HTML
const htmlMatch = indexContent.match(/(<section class="about-section" id="nosotros">[\s\S]*?<\/section>)/);
let html = htmlMatch[1];

// Extract JS
const jsMatch = indexContent.match(/(\/\/ ---- Carrusel de fotos del equipo[\s\S]*?)(?=\/\/ ==========================================================)/);
let js = jsMatch[1];

function inject(filename, config) {
  let file = path + filename;
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Check if already injected
  if (content.includes('<section class="about-section" id="nosotros">')) {
    console.log('Already injected in ' + filename);
    return;
  }

  // 2. Replace CSS
  let fileCss = css.replace(/var\(--lion-navy\)/g, config.bg)
                   .replace(/#6db4f0/g, config.accent)
                   .replace(/#9fd3ff/g, config.accentHover)
                   .replace(/rgba\(12, 108, 192, 0\.35\)/g, config.badgeBg);
                   
  content = content.replace(/(<\/style>)/i, '\n' + fileCss + '\n$1');
  
  // 3. Replace HTML
  let fileHtml = html;
  content = content.replace(/(<!-- ==================== FOOTER ==================== -->|<footer|<\!-- FOOTER -->)/i, fileHtml + '\n\n  $1');
  
  // 4. Replace JS
  if (filename === 'lion-tech-care.html') {
    content = content.replace(/(}\);\s*<\/script>)/, js + '\n$1');
  } else if (filename === 'mechanic-ve.html') {
    let lastClosureIdx = content.lastIndexOf('})();');
    if (lastClosureIdx !== -1) {
       content = content.substring(0, lastClosureIdx) + '\n\n' + js + '\n' + content.substring(lastClosureIdx);
    } else {
       let lastScriptIdx = content.lastIndexOf('</script>');
       content = content.substring(0, lastScriptIdx) + '\n\n' + js + '\n' + content.substring(lastScriptIdx);
    }
  } else if (filename === 'hi-treek.html') {
    let lastScriptIdx = content.lastIndexOf('</script>');
    content = content.substring(0, lastScriptIdx) + '\n\n' + js + '\n' + content.substring(lastScriptIdx);
  }
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
}

inject('lion-tech-care.html', {
  bg: 'var(--blue-dark)',
  accent: 'var(--accent-cyan)',
  accentHover: '#ffffff',
  badgeBg: 'rgba(0, 229, 255, 0.15)'
});

inject('hi-treek.html', {
  bg: 'var(--treek-teal-dark)',
  accent: 'var(--treek-accent)',
  accentHover: 'var(--treek-light)',
  badgeBg: 'var(--treek-glow)'
});

inject('mechanic-ve.html', {
  bg: 'var(--graphite-deep)',
  accent: 'var(--yellow)',
  accentHover: '#ffffff',
  badgeBg: 'rgba(255, 255, 1, 0.15)'
});
