/* ═══════════════════════════════════════
   STELLO — Theme Revamp Patch
   ⚡ Electric Arcs (DC, Avengers) — NEW
   💀 Bone Dust (Skeleton) — NEW
   🎨 Unique particle character per theme
═══════════════════════════════════════ */

// ── FAMILY MAP ──
const TR_FAMILY = {
  oni:'mercury', sith:'mercury', f1:'mercury', 'stranger-things':'mercury',
  dc:'electric', avengers:'electric',
  'breaking-bad':'ember', jungle:'ember', coffee:'ember',
  skeleton:'bonedust',
  space:'starfield', starwars:'starfield', cosmic:'starfield', mythical:'starfield',
  disney:'glitter', 'harry-potter':'glitter', friends:'glitter',
  ink:'inkdrift', matcha:'inkdrift', 'zen-garden':'inkdrift',
  'dark-academia':'inkdrift', 'vintage-scholar':'inkdrift',
};

// ── UNIQUE PARTICLE CHARACTER PER THEME ──
const TR_PCHAR = {
  ink:'墨', oni:'鬼', coffee:'☕', matcha:'抹', 'dark-academia':'✦',
  'breaking-bad':'⚗', f1:'▲', sith:'☠', jungle:'🌿', skeleton:'☠',
  starwars:'✦', space:'✦', 'harry-potter':'⚡', cosmic:'◈',
  'zen-garden':'●', friends:'☕', 'stranger-things':'👁', avengers:'⚡',
  dc:'⚡', disney:'✨', 'vintage-scholar':'📜', mythical:'龍',
};

// Themes where character particles look better than plain dots
const TR_USE_CHAR = new Set([
  'ink','oni','harry-potter','avengers','dc','disney','mythical',
  'stranger-things','breaking-bad','skeleton','f1',
]);

// ── OVERRIDE initParticles — add character shapes ──
const _trOrigInitParticles = window.initParticles;
window.initParticles = function() {
  const dark=['oni','coffee','breaking-bad','f1','sith','jungle','starwars','space','harry-potter','cosmic','stranger-things','avengers','dc','disney','vintage-scholar','mythical','dark-academia','friends'];
  const isDark=dark.includes(currentTheme);
  if(window._p){try{window._p.destroy();}catch(e){}window._p=null;}

  const cols = (typeof PCOLS !== 'undefined' && PCOLS[currentTheme]) ? PCOLS[currentTheme] : ['#888'];
  const useChar = TR_USE_CHAR.has(currentTheme);
  const ch = TR_PCHAR[currentTheme] || '●';

  const baseConfig = {
    particles:{
      number:{value:isDark?24:12,density:{enable:true,value_area:900}},
      color:{value:cols},
      opacity:{value:isDark?.28:.13,random:true,anim:{enable:true,speed:.3,opacity_min:.03}},
      links:{enable:['space','starwars','cosmic','dc'].includes(currentTheme),distance:120,opacity:.07,width:.5},
      move:{enable:true,speed:isDark?.26:.11,random:true,out_mode:'out'},
      size:{value:{min:isDark?8:6,max:isDark?16:11},random:true},
    },
    detectRetina:true
  };

  if (useChar) {
    baseConfig.particles.shape = {
      type: 'char',
      character: { value: ch, font: 'sans-serif', style: '', weight: '400', fill: true }
    };
    baseConfig.particles.rotate = { value: 0, random: true, direction: 'random', animation: { enable: true, speed: 2 } };
  } else {
    baseConfig.particles.size = { value:{min:1,max:isDark?3:2}, random:true };
  }

  tsParticles.load('particles', baseConfig).then(p => window._p = p);
};

// ── FX CANVAS — handles mercury / electric / bonedust ──
let trFxRaf = null;
let trElectricBolts = [];
let trDustParticles = [];

function trInitFxCanvas() {
  const canvas = document.getElementById('liquidCanvas');
  if (!canvas) return;
  if (trFxRaf) { cancelAnimationFrame(trFxRaf); trFxRaf = null; }

  const family = TR_FAMILY[currentTheme];
  const canvasFamilies = ['mercury','electric','bonedust'];
  if (!canvasFamilies.includes(family)) {
    canvas.style.opacity = '0';
    return;
  }

  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth; canvas.height = innerHeight;
  canvas.style.opacity = family === 'electric' ? '0.9' : '0.7';

  if (family === 'mercury') trDrawMercury(ctx, canvas);
  else if (family === 'electric') trDrawElectric(ctx, canvas);
  else if (family === 'bonedust') trDrawBoneDust(ctx, canvas);
}

// ── MERCURY (existing liquid blob logic, kept) ──
function trDrawMercury(ctx, canvas) {
  const cols = {oni:'204,34,0',sith:'180,0,0',f1:'220,0,0','stranger-things':'170,0,238'};
  const col = cols[currentTheme] || '200,0,0';
  const W = canvas.width, H = canvas.height;
  const blobs = Array.from({length:5}, (_,i) => ({
    x: W*(0.15+i*0.17)+(Math.random()-.5)*60, y: H*(0.3+Math.sin(i*1.2)*0.3),
    vx: (Math.random()-.5)*.55, vy: (Math.random()-.5)*.38,
    r: Math.min(W,H)*(0.07+i*0.01)
  }));
  function draw() {
    ctx.clearRect(0,0,W,H);
    blobs.forEach(b => {
      b.x+=b.vx; b.y+=b.vy;
      if(b.x<b.r||b.x>W-b.r) b.vx*=-1;
      if(b.y<b.r||b.y>H-b.r) b.vy*=-1;
      const g = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*1.3);
      g.addColorStop(0,`rgba(${col},.17)`); g.addColorStop(.5,`rgba(${col},.08)`); g.addColorStop(1,`rgba(${col},0)`);
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r*1.3,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    });
    for(let i=0;i<blobs.length;i++) for(let j=i+1;j<blobs.length;j++) {
      const a=blobs[i], b=blobs[j], dx=b.x-a.x, dy=b.y-a.y, d=Math.sqrt(dx*dx+dy*dy), maxD=a.r+b.r+100;
      if(d<maxD) {
        const al=.07*(1-d/maxD);
        const lg = ctx.createLinearGradient(a.x,a.y,b.x,b.y);
        lg.addColorStop(0,`rgba(${col},${al})`); lg.addColorStop(.5,`rgba(${col},${al*1.6})`); lg.addColorStop(1,`rgba(${col},${al})`);
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=lg; ctx.lineWidth=Math.max(1,(a.r+b.r)*.12*(1-d/maxD)); ctx.stroke();
      }
    }
    trFxRaf = requestAnimationFrame(draw);
  }
  draw();
}

// ── ELECTRIC ARCS (NEW — DC, Avengers) ──
function trDrawElectric(ctx, canvas) {
  const cols = { dc:'0,120,255', avengers:'232,200,20' };
  const col = cols[currentTheme] || '100,180,255';
  const W = canvas.width, H = canvas.height;

  // Anchor nodes the lightning jumps between
  const nodes = Array.from({length:6}, () => ({
    x: Math.random()*W, y: Math.random()*H,
  }));

  trElectricBolts = [];
  function spawnBolt() {
    const a = nodes[Math.floor(Math.random()*nodes.length)];
    const b = nodes[Math.floor(Math.random()*nodes.length)];
    if (a === b) return;
    // Generate jagged path
    const segs = 8;
    const pts = [];
    for (let i=0; i<=segs; i++) {
      const t = i/segs;
      const jitter = (Math.random()-.5) * 40 * Math.sin(t*Math.PI);
      pts.push({
        x: a.x + (b.x-a.x)*t + jitter,
        y: a.y + (b.y-a.y)*t + jitter,
      });
    }
    trElectricBolts.push({ pts, life: 1, maxLife: 1 });
  }

  let frame = 0;
  function draw() {
    frame++;
    ctx.clearRect(0,0,W,H);

    // Slowly drift nodes
    nodes.forEach(n => {
      n.x += (Math.random()-.5)*.6;
      n.y += (Math.random()-.5)*.6;
      n.x = Math.max(0,Math.min(W,n.x));
      n.y = Math.max(0,Math.min(H,n.y));
    });

    if (frame % 40 === 0 && Math.random() > 0.3) spawnBolt();

    trElectricBolts = trElectricBolts.filter(bolt => bolt.life > 0);
    trElectricBolts.forEach(bolt => {
      bolt.life -= 0.035;
      const alpha = Math.max(0, bolt.life) * 0.5;
      ctx.beginPath();
      ctx.moveTo(bolt.pts[0].x, bolt.pts[0].y);
      for (let i=1;i<bolt.pts.length;i++) ctx.lineTo(bolt.pts[i].x, bolt.pts[i].y);
      ctx.strokeStyle = `rgba(${col},${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(${col},${alpha})`;
      ctx.stroke();
      // Bright core
      ctx.strokeStyle = `rgba(255,255,255,${alpha*0.8})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Faint glow nodes
    nodes.forEach(n => {
      const g = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,30);
      g.addColorStop(0,`rgba(${col},.06)`); g.addColorStop(1,`rgba(${col},0)`);
      ctx.beginPath(); ctx.arc(n.x,n.y,30,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    });

    trFxRaf = requestAnimationFrame(draw);
  }
  draw();
}

// ── BONE DUST (NEW — Skeleton) ──
function trDrawBoneDust(ctx, canvas) {
  const W = canvas.width, H = canvas.height;
  const col = '60,70,90';

  trDustParticles = Array.from({length:60}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    vx: (Math.random()-.5)*.15, vy: Math.random()*.12+.02,
    r: Math.random()*1.8+.4, alpha: Math.random()*.3+.05,
  }));

  // Static fracture lines drawn once into an offscreen-style pass, redrawn faintly
  const cracks = Array.from({length:5}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    segs: Array.from({length: 4+Math.floor(Math.random()*3)}, () => ({
      dx: (Math.random()-.5)*120, dy: (Math.random()-.5)*120
    }))
  }));

  function draw() {
    ctx.clearRect(0,0,W,H);

    // Fracture cracks (very faint, static-ish, subtle flicker)
    cracks.forEach(c => {
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      let cx = c.x, cy = c.y;
      c.segs.forEach(s => {
        cx += s.dx * 0.15; cy += s.dy * 0.15;
        ctx.lineTo(cx, cy);
      });
      ctx.strokeStyle = `rgba(${col},${0.04 + Math.random()*0.02})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    });

    // Drifting dust/ash
    trDustParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y > H) { p.y = -5; p.x = Math.random()*W; }
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${col},${p.alpha})`;
      ctx.fill();
    });

    trFxRaf = requestAnimationFrame(draw);
  }
  draw();
}

// ── HOOK: override globals ──
window.initLiquid = trInitFxCanvas;

// CRITICAL FIX: script.js uses function declarations, so setTheme() calls the
// LOCAL initLiquid/initParticles — not our window overrides. We must wrap
// setTheme itself so our versions fire on every theme switch, no refresh needed.
const _trOrigSetTheme = window.setTheme;
window.setTheme = function(theme, save = true) {
  if (typeof _trOrigSetTheme === 'function') {
    _trOrigSetTheme(theme, save);
  }
  // Fire our revamped effects AFTER the original finishes its own timeout (80ms)
  setTimeout(() => {
    try { window.initParticles(); } catch(e) {}
    try { trInitFxCanvas(); } catch(e) {}
  }, 120);
};

// Also re-run on window resize so canvases stay correct
let _trResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_trResizeTimer);
  _trResizeTimer = setTimeout(() => {
    try { trInitFxCanvas(); } catch(e) {}
  }, 200);
});

// ── BOOT: run immediately on first paint, no refresh required ──
function trBoot() {
  // Read whatever theme is active right now
  const active = localStorage.getItem('stello_theme') || 'ink';
  if (typeof currentTheme === 'undefined' || !currentTheme) {
    try { window.currentTheme = active; } catch(e) {}
  }
  try { window.initParticles(); } catch(e) {}
  try { trInitFxCanvas(); } catch(e) {}
}

// Fire on every possible entry point so animations are live instantly
if (document.readyState === 'complete') {
  trBoot();
} else {
  window.addEventListener('load', trBoot);
}
// Extra safety net — catches cases where script.js finishes after us
setTimeout(trBoot, 400);
setTimeout(trBoot, 1000);
