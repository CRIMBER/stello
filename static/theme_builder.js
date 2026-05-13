/* ═══════════════════════════════════════
   STELLO — Theme Builder (Patch A)
   Live preview · AI generator · Save/load
═══════════════════════════════════════ */

// ── THEME BUILDER STATE ──
let tbOpen = false;
let customThemes = {};  // saved custom themes
let currentTB = {
  name: 'My Theme',
  bg1: '#0a0a0f',
  bg2: '#1a1a2e',
  accent: '#4a90ff',
  accent2: '#80b8ff',
  style: 'glass',      // glass | brutal | neo | neon | minimal
  particles: 'dots',   // dots | stars | embers | none
  radius: 12,
  font: 'syne',
};

const STYLE_PRESETS = {
  glass: {
    '--sur':      'rgba(255,255,255,0.05)',
    '--surh':     'rgba(255,255,255,0.09)',
    '--bdr':      'rgba(255,255,255,0.1)',
    '--bdra':     'rgba(255,255,255,0.25)',
    '--bbub':     'rgba(255,255,255,0.06)',
    '--ubub':     'rgba(255,255,255,0.12)',
    '--ibg':      'rgba(255,255,255,0.06)',
    '--sbg':      'rgba(10,10,20,0.96)',
    '--tbar':     'rgba(10,10,20,0.85)',
    'backdrop':   'blur(20px)',
  },
  brutal: {
    '--sur':      'rgba(255,255,255,0)',
    '--surh':     'rgba(255,255,255,0.05)',
    '--bdr':      'rgba(255,255,255,0.9)',
    '--bdra':     'rgba(255,255,255,1)',
    '--bbub':     'rgba(0,0,0,0)',
    '--ubub':     'rgba(255,255,255,0.15)',
    '--ibg':      'rgba(0,0,0,0)',
    '--sbg':      'rgba(0,0,0,0.98)',
    '--tbar':     'rgba(0,0,0,0.95)',
    'backdrop':   'none',
  },
  neo: {
    '--sur':      'rgba(255,255,255,0.03)',
    '--surh':     'rgba(255,255,255,0.06)',
    '--bdr':      'rgba(255,255,255,0.04)',
    '--bdra':     'rgba(255,255,255,0.08)',
    '--bbub':     'rgba(255,255,255,0.04)',
    '--ubub':     'rgba(255,255,255,0.08)',
    '--ibg':      'rgba(255,255,255,0.03)',
    '--sbg':      'rgba(15,15,25,0.99)',
    '--tbar':     'rgba(12,12,22,0.95)',
    'backdrop':   'blur(30px)',
  },
  neon: {
    '--sur':      'rgba(255,255,255,0.03)',
    '--surh':     'rgba(255,255,255,0.07)',
    '--bdr':      'rgba(var(--ac-rgb),0.3)',
    '--bdra':     'rgba(var(--ac-rgb),0.7)',
    '--bbub':     'rgba(var(--ac-rgb),0.05)',
    '--ubub':     'rgba(var(--ac-rgb),0.18)',
    '--ibg':      'rgba(var(--ac-rgb),0.05)',
    '--sbg':      'rgba(5,5,15,0.98)',
    '--tbar':     'rgba(5,5,15,0.92)',
    'backdrop':   'blur(16px)',
  },
  minimal: {
    '--sur':      'rgba(255,255,255,0.03)',
    '--surh':     'rgba(255,255,255,0.06)',
    '--bdr':      'rgba(255,255,255,0.06)',
    '--bdra':     'rgba(255,255,255,0.12)',
    '--bbub':     'rgba(255,255,255,0.04)',
    '--ubub':     'rgba(255,255,255,0.08)',
    '--ibg':      'rgba(255,255,255,0.03)',
    '--sbg':      'rgba(8,8,12,0.99)',
    '--tbar':     'rgba(8,8,12,0.95)',
    'backdrop':   'blur(8px)',
  },
};

const FONTS = {
  syne:    "'Syne', sans-serif",
  mono:    "'DM Mono', monospace",
  serif:   "'Playfair Display', serif",
  jp:      "'Noto Serif JP', serif",
  rajdhani:"'Rajdhani', sans-serif",
};

// ── INJECT THEME BUILDER INTO SETTINGS ──
function injectThemeBuilder() {
  // Tab is already in HTML — just populate content if empty
  const panel = document.getElementById('tab-builder');
  if (!panel) return;
  if (!panel.innerHTML.trim()) {
    panel.innerHTML = buildThemeBuilderHTML();
    bindThemeBuilderEvents();
  }
}

function buildThemeBuilderHTML() {
  return `
<div class="tb-wrap">
  <!-- AI Generator -->
  <div class="tb-section">
    <div class="tb-section-title">✨ AI Theme Generator</div>
    <p class="tb-desc">Describe your vibe and STELLO will cook up theme options for you.</p>
    <textarea id="tbAiPrompt" class="tb-textarea" placeholder="e.g. dark ocean vibes, inspired by Interstellar, cyberpunk Tokyo at night, pastel anime aesthetic..."></textarea>
    <button class="tb-btn-ai" id="tbAiGenBtn" onclick="generateAITheme()">
      <span id="tbAiBtnText">✨ Generate Theme Options</span>
    </button>
    <div id="tbAiResults" class="tb-ai-results" style="display:none"></div>
  </div>

  <div class="tb-divider">— or build manually —</div>

  <!-- Name -->
  <div class="tb-section">
    <div class="tb-section-title">Theme Name</div>
    <input id="tbName" class="tb-input" value="My Theme" placeholder="Name your theme..." maxlength="30"/>
  </div>

  <!-- Background -->
  <div class="tb-section">
    <div class="tb-section-title">Background Colors</div>
    <div class="tb-color-row">
      <div class="tb-color-item">
        <label class="tb-color-label">Primary</label>
        <div class="tb-color-wrap">
          <input type="color" id="tbBg1" class="tb-color" value="#0a0a0f" oninput="previewTheme()"/>
          <span class="tb-color-val" id="tbBg1Val">#0a0a0f</span>
        </div>
      </div>
      <div class="tb-color-item">
        <label class="tb-color-label">Secondary</label>
        <div class="tb-color-wrap">
          <input type="color" id="tbBg2" class="tb-color" value="#1a1a2e" oninput="previewTheme()"/>
          <span class="tb-color-val" id="tbBg2Val">#1a1a2e</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Accent -->
  <div class="tb-section">
    <div class="tb-section-title">Accent Colors</div>
    <div class="tb-color-row">
      <div class="tb-color-item">
        <label class="tb-color-label">Primary</label>
        <div class="tb-color-wrap">
          <input type="color" id="tbAccent" class="tb-color" value="#4a90ff" oninput="previewTheme()"/>
          <span class="tb-color-val" id="tbAccentVal">#4a90ff</span>
        </div>
      </div>
      <div class="tb-color-item">
        <label class="tb-color-label">Secondary</label>
        <div class="tb-color-wrap">
          <input type="color" id="tbAccent2" class="tb-color" value="#80b8ff" oninput="previewTheme()"/>
          <span class="tb-color-val" id="tbAccent2Val">#80b8ff</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Style -->
  <div class="tb-section">
    <div class="tb-section-title">Style Preset</div>
    <div class="tb-style-row">
      <button class="tb-style-btn active" data-style="glass" onclick="setStyle('glass',this)">
        <span>🪟</span><span>Glass</span>
      </button>
      <button class="tb-style-btn" data-style="brutal" onclick="setStyle('brutal',this)">
        <span>⬛</span><span>Brutal</span>
      </button>
      <button class="tb-style-btn" data-style="neo" onclick="setStyle('neo',this)">
        <span>🌫️</span><span>Neo</span>
      </button>
      <button class="tb-style-btn" data-style="neon" onclick="setStyle('neon',this)">
        <span>💜</span><span>Neon</span>
      </button>
      <button class="tb-style-btn" data-style="minimal" onclick="setStyle('minimal',this)">
        <span>◻️</span><span>Minimal</span>
      </button>
    </div>
  </div>

  <!-- Particles -->
  <div class="tb-section">
    <div class="tb-section-title">Particles</div>
    <div class="tb-style-row">
      <button class="tb-style-btn active" data-p="dots" onclick="setParticles('dots',this)">
        <span>·</span><span>Dots</span>
      </button>
      <button class="tb-style-btn" data-p="stars" onclick="setParticles('stars',this)">
        <span>★</span><span>Stars</span>
      </button>
      <button class="tb-style-btn" data-p="embers" onclick="setParticles('embers',this)">
        <span>🔥</span><span>Embers</span>
      </button>
      <button class="tb-style-btn" data-p="none" onclick="setParticles('none',this)">
        <span>○</span><span>None</span>
      </button>
    </div>
  </div>

  <!-- Border Radius -->
  <div class="tb-section">
    <div class="tb-section-title">Border Radius — <span id="tbRadiusVal">12px</span></div>
    <input type="range" id="tbRadius" class="tb-slider" min="0" max="24" value="12" oninput="previewTheme()"/>
    <div class="tb-radius-labels"><span>Sharp</span><span>Round</span></div>
  </div>

  <!-- Font -->
  <div class="tb-section">
    <div class="tb-section-title">Font</div>
    <div class="tb-font-row">
      <button class="tb-font-btn active" data-font="syne" onclick="setFont('syne',this)" style="font-family:'Syne',sans-serif">Syne</button>
      <button class="tb-font-btn" data-font="mono" onclick="setFont('mono',this)" style="font-family:'DM Mono',monospace">Mono</button>
      <button class="tb-font-btn" data-font="serif" onclick="setFont('serif',this)" style="font-family:'Playfair Display',serif">Serif</button>
      <button class="tb-font-btn" data-font="jp" onclick="setFont('jp',this)" style="font-family:'Noto Serif JP',serif">和</button>
      <button class="tb-font-btn" data-font="rajdhani" onclick="setFont('rajdhani',this)" style="font-family:'Rajdhani',sans-serif">Raj</button>
    </div>
  </div>

  <!-- Preview -->
  <div class="tb-section">
    <div class="tb-section-title">Live Preview</div>
    <div class="tb-preview" id="tbPreview">
      <div class="tb-prev-bubble tb-prev-user">Hey STELLO, this looks fire 🔥</div>
      <div class="tb-prev-bubble tb-prev-bot">fr bro, you just cooked a legendary theme 🎨</div>
      <div class="tb-prev-input">
        <span style="flex:1;opacity:.4;font-size:13px">speak your mind...</span>
        <div class="tb-prev-send">→</div>
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="tb-actions">
    <button class="tb-btn-save" onclick="saveCustomTheme()">💾 Save Theme</button>
    <button class="tb-btn-apply" onclick="applyCustomTheme()">✓ Apply Now</button>
  </div>

  <!-- Saved themes -->
  <div class="tb-section" id="tbSavedSection" style="display:none">
    <div class="tb-section-title">Your Saved Themes</div>
    <div id="tbSavedList" class="tb-saved-list"></div>
  </div>
</div>`;
}

function bindThemeBuilderEvents() {
  // Sync color value displays
  ['tbBg1','tbBg2','tbAccent','tbAccent2'].forEach(id => {
    const el = document.getElementById(id);
    const val = document.getElementById(id+'Val');
    if(el && val) el.addEventListener('input', () => { val.textContent = el.value; });
  });
  const radius = document.getElementById('tbRadius');
  const radiusVal = document.getElementById('tbRadiusVal');
  if(radius && radiusVal) radius.addEventListener('input', () => { radiusVal.textContent = radius.value+'px'; });
  const nameEl = document.getElementById('tbName');
  if(nameEl) nameEl.addEventListener('input', () => { currentTB.name = nameEl.value || 'My Theme'; });
  // Load saved themes
  renderSavedThemes();
}

// ── LIVE PREVIEW ──
function previewTheme() {
  currentTB.bg1    = document.getElementById('tbBg1')?.value || currentTB.bg1;
  currentTB.bg2    = document.getElementById('tbBg2')?.value || currentTB.bg2;
  currentTB.accent = document.getElementById('tbAccent')?.value || currentTB.accent;
  currentTB.accent2= document.getElementById('tbAccent2')?.value || currentTB.accent2;
  currentTB.radius = parseInt(document.getElementById('tbRadius')?.value || 12);

  const preview = document.getElementById('tbPreview');
  if (!preview) return;

  const preset = STYLE_PRESETS[currentTB.style] || STYLE_PRESETS.glass;
  const acRGB = hexToRGB(currentTB.accent);

  preview.style.background = `linear-gradient(135deg,${currentTB.bg1},${currentTB.bg2})`;
  preview.style.borderRadius = currentTB.radius + 'px';
  preview.style.borderColor = currentTB.accent + '44';

  const userBub = preview.querySelector('.tb-prev-user');
  const botBub = preview.querySelector('.tb-prev-bot');
  const inp = preview.querySelector('.tb-prev-input');
  const send = preview.querySelector('.tb-prev-send');

  if(userBub){
    userBub.style.background = currentTB.accent + '22';
    userBub.style.borderColor = currentTB.accent + '66';
    userBub.style.borderRadius = currentTB.radius + 'px';
    userBub.style.color = '#fff';
  }
  if(botBub){
    botBub.style.background = preset['--bbub'] || 'rgba(255,255,255,0.06)';
    botBub.style.borderColor = preset['--bdr'] || 'rgba(255,255,255,0.1)';
    botBub.style.borderRadius = currentTB.radius + 'px';
    botBub.style.color = '#fff';
  }
  if(inp){
    inp.style.background = preset['--ibg'] || 'rgba(255,255,255,0.06)';
    inp.style.borderColor = preset['--bdr'] || 'rgba(255,255,255,0.1)';
    inp.style.borderRadius = currentTB.radius + 'px';
    inp.style.color = '#fff';
  }
  if(send){
    send.style.background = `linear-gradient(135deg,${currentTB.accent},${currentTB.accent2})`;
    send.style.borderRadius = Math.min(currentTB.radius, 10) + 'px';
  }
}

function setStyle(style, btn) {
  currentTB.style = style;
  document.querySelectorAll('.tb-style-btn[data-style]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  previewTheme();
}

function setParticles(type, btn) {
  currentTB.particles = type;
  document.querySelectorAll('.tb-style-btn[data-p]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function setFont(font, btn) {
  currentTB.font = font;
  document.querySelectorAll('.tb-font-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const preview = document.getElementById('tbPreview');
  if(preview) preview.style.fontFamily = FONTS[font] || FONTS.syne;
}

// ── APPLY CUSTOM THEME ──
function applyCustomTheme() {
  const preset = STYLE_PRESETS[currentTB.style] || STYLE_PRESETS.glass;
  const root = document.documentElement;
  const acRGB = hexToRGB(currentTB.accent);
  const ac2RGB = hexToRGB(currentTB.accent2);
  const txColor = isLight(currentTB.bg1) ? '#0a0a0a' : '#f0f0ff';

  // Set CSS variables
  root.style.setProperty('--bg', currentTB.bg1);
  root.style.setProperty('--ac', currentTB.accent);
  root.style.setProperty('--ac2', currentTB.accent2);
  root.style.setProperty('--tx', txColor);
  root.style.setProperty('--txm', txColor + 'aa');
  root.style.setProperty('--txd', txColor + '55');
  root.style.setProperty('--glow', currentTB.accent + '33');
  root.style.setProperty('--sg', `linear-gradient(135deg,${currentTB.accent},${currentTB.accent2})`);
  root.style.setProperty('--rc', currentTB.radius + 'px');
  root.style.setProperty('--fd', FONTS[currentTB.font] || FONTS.syne);
  root.style.setProperty('--st', currentTB.accent2);
  root.style.setProperty('--ac-rgb', acRGB);

  Object.entries(preset).forEach(([key, val]) => {
    if(key !== 'backdrop') root.style.setProperty(key, val);
  });

  // Set body background gradient
  document.body.style.background = `linear-gradient(135deg,${currentTB.bg1} 0%,${currentTB.bg2} 100%)`;

  // Reinit particles with new accent color
  if(currentTB.particles !== 'none') {
    if(_p){try{_p.destroy();}catch(e){}_p=null;}
    const pColor = [currentTB.accent, currentTB.accent2];
    tsParticles.load('particles',{
      particles:{
        number:{value: currentTB.particles==='embers'?40:20},
        color:{value:pColor},
        opacity:{value:.3,random:true},
        move:{enable:true,speed: currentTB.particles==='embers'?.5:.15,random:true,out_mode:'out',
          direction: currentTB.particles==='embers'?'top':'none'},
        size:{value:{min:1,max: currentTB.particles==='stars'?3:2},random:true},
        links:{enable:false}
      },detectRetina:true
    }).then(p=>_p=p);
  } else {
    if(_p){try{_p.destroy();}catch(e){}_p=null;}
  }

  // Update brand sub
  const brandSub = document.getElementById('brandSub');
  if(brandSub) brandSub.textContent = '✨ ' + currentTB.name.toUpperCase();

  // Store as active custom theme
  localStorage.setItem('stello_custom_theme', JSON.stringify(currentTB));
  localStorage.setItem('stello_theme', 'custom');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.setAttribute('data-theme','custom');

  closeSettings();
  playSound('send');
}

// ── SAVE CUSTOM THEME ──
function saveCustomTheme() {
  const name = document.getElementById('tbName')?.value.trim() || 'My Theme';
  currentTB.name = name;
  const saved = JSON.parse(localStorage.getItem('stello_saved_themes') || '{}');
  saved[name] = {...currentTB};
  localStorage.setItem('stello_saved_themes', JSON.stringify(saved));
  customThemes = saved;
  renderSavedThemes();
  applyCustomTheme();
  if(chatStarted) showSystemMsg('✅ Theme **"'+name+'"** saved and applied!');
}

function renderSavedThemes() {
  const saved = JSON.parse(localStorage.getItem('stello_saved_themes') || '{}');
  customThemes = saved;
  const list = document.getElementById('tbSavedList');
  const section = document.getElementById('tbSavedSection');
  if(!list || !section) return;
  const keys = Object.keys(saved);
  section.style.display = keys.length ? 'block' : 'none';
  list.innerHTML = '';
  keys.forEach(name => {
    const t = saved[name];
    const item = document.createElement('div');
    item.className = 'tb-saved-item';
    item.innerHTML = `
      <div class="tb-saved-swatch" style="background:linear-gradient(135deg,${t.bg1},${t.bg2});border:2px solid ${t.accent}44"></div>
      <div class="tb-saved-info">
        <div class="tb-saved-name">${name}</div>
        <div class="tb-saved-style">${t.style} · ${t.particles}</div>
      </div>
      <div class="tb-saved-btns">
        <button onclick="loadSavedTheme('${name}')" class="tb-saved-apply">Apply</button>
        <button onclick="deleteSavedTheme('${name}')" class="tb-saved-del">✕</button>
      </div>`;
    list.appendChild(item);
  });
}

function loadSavedTheme(name) {
  const saved = JSON.parse(localStorage.getItem('stello_saved_themes') || '{}');
  if(!saved[name]) return;
  currentTB = {...saved[name]};
  // Update UI inputs
  const set = (id, val) => { const el=document.getElementById(id); if(el)el.value=val; };
  set('tbBg1', currentTB.bg1); set('tbBg2', currentTB.bg2);
  set('tbAccent', currentTB.accent); set('tbAccent2', currentTB.accent2);
  set('tbRadius', currentTB.radius); set('tbName', currentTB.name);
  document.getElementById('tbBg1Val').textContent = currentTB.bg1;
  document.getElementById('tbBg2Val').textContent = currentTB.bg2;
  document.getElementById('tbAccentVal').textContent = currentTB.accent;
  document.getElementById('tbAccent2Val').textContent = currentTB.accent2;
  document.getElementById('tbRadiusVal').textContent = currentTB.radius+'px';
  document.querySelectorAll('.tb-style-btn[data-style]').forEach(b=>b.classList.toggle('active',b.dataset.style===currentTB.style));
  document.querySelectorAll('.tb-style-btn[data-p]').forEach(b=>b.classList.toggle('active',b.dataset.p===currentTB.particles));
  document.querySelectorAll('.tb-font-btn').forEach(b=>b.classList.toggle('active',b.dataset.font===currentTB.font));
  previewTheme();
  applyCustomTheme();
}

function deleteSavedTheme(name) {
  const saved = JSON.parse(localStorage.getItem('stello_saved_themes') || '{}');
  delete saved[name];
  localStorage.setItem('stello_saved_themes', JSON.stringify(saved));
  renderSavedThemes();
}

// ── AI THEME GENERATOR ──
async function generateAITheme() {
  const prompt = document.getElementById('tbAiPrompt')?.value.trim();
  if(!prompt) return;
  const btn = document.getElementById('tbAiGenBtn');
  const btnText = document.getElementById('tbAiBtnText');
  const results = document.getElementById('tbAiResults');
  if(btn) btn.disabled = true;
  if(btnText) btnText.innerHTML = '<span class="tb-spin"></span>STELLO is cooking...';
  if(results) results.style.display = 'none';

  try {
    const res = await fetch('/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        message: `Generate 3 unique UI theme options based on this vibe: "${prompt}"

For each theme, respond in this EXACT JSON format (nothing else, just the JSON array):
[
  {
    "name": "Theme Name",
    "description": "One sentence vibe description",
    "bg1": "#hexcolor",
    "bg2": "#hexcolor",
    "accent": "#hexcolor",
    "accent2": "#hexcolor",
    "style": "glass|brutal|neo|neon|minimal",
    "particles": "dots|stars|embers|none",
    "font": "syne|mono|serif|jp|rajdhani",
    "radius": 8
  }
]

Make them visually distinct from each other. Use dark backgrounds unless the vibe is explicitly light. Make accent colors vibrant and beautiful.`,
        model: 'openai/gpt-4o-mini',
        mode: 'chat',
        history: [],
      })
    });
    const data = await res.json();
    const reply = data.reply || '';

    // Parse JSON from reply
    const match = reply.match(/\[[\s\S]*\]/);
    if(!match) throw new Error('No JSON found');
    const themes = JSON.parse(match[0]);

    // Render AI theme options
    results.style.display = 'block';
    results.innerHTML = '<div class="tb-ai-label">✨ Pick one to apply:</div>';
    themes.forEach((t, i) => {
      const card = document.createElement('div');
      card.className = 'tb-ai-card';
      card.innerHTML = `
        <div class="tb-ai-swatch" style="background:linear-gradient(135deg,${t.bg1},${t.bg2})">
          <div class="tb-ai-dot" style="background:${t.accent}"></div>
          <div class="tb-ai-dot" style="background:${t.accent2}"></div>
        </div>
        <div class="tb-ai-info">
          <div class="tb-ai-name">${t.name}</div>
          <div class="tb-ai-desc">${t.description}</div>
          <div class="tb-ai-tags">
            <span class="tb-ai-tag">${t.style}</span>
            <span class="tb-ai-tag">${t.particles}</span>
            <span class="tb-ai-tag">${t.font}</span>
          </div>
        </div>
        <button class="tb-ai-apply" onclick="applyAITheme(${i})">Apply →</button>`;
      results.appendChild(card);
    });

    // Store for later apply
    window._aiThemes = themes;

  } catch(e) {
    if(results) {
      results.style.display = 'block';
      results.innerHTML = '<div style="color:rgba(255,100,100,.8);font-size:12px;font-family:var(--fm)">⚠️ Generation failed. Try a more descriptive prompt.</div>';
    }
  }
  if(btn) btn.disabled = false;
  if(btnText) btnText.textContent = '✨ Generate Theme Options';
}

function applyAITheme(index) {
  const t = window._aiThemes?.[index];
  if(!t) return;
  // Load into builder
  currentTB = {
    name: t.name,
    bg1: t.bg1, bg2: t.bg2,
    accent: t.accent, accent2: t.accent2,
    style: t.style || 'glass',
    particles: t.particles || 'dots',
    font: t.font || 'syne',
    radius: t.radius || 12,
  };
  // Update all inputs
  const set = (id, val) => { const el=document.getElementById(id); if(el)el.value=val; };
  set('tbBg1',currentTB.bg1); set('tbBg2',currentTB.bg2);
  set('tbAccent',currentTB.accent); set('tbAccent2',currentTB.accent2);
  set('tbRadius',currentTB.radius); set('tbName',currentTB.name);
  const upd = (id,val) => { const el=document.getElementById(id+'Val'); if(el)el.textContent=val; };
  upd('tbBg1',currentTB.bg1); upd('tbBg2',currentTB.bg2);
  upd('tbAccent',currentTB.accent); upd('tbAccent2',currentTB.accent2);
  const rv = document.getElementById('tbRadiusVal'); if(rv) rv.textContent=currentTB.radius+'px';
  document.querySelectorAll('.tb-style-btn[data-style]').forEach(b=>b.classList.toggle('active',b.dataset.style===currentTB.style));
  document.querySelectorAll('.tb-style-btn[data-p]').forEach(b=>b.classList.toggle('active',b.dataset.p===currentTB.particles));
  document.querySelectorAll('.tb-font-btn').forEach(b=>b.classList.toggle('active',b.dataset.font===currentTB.font));
  previewTheme();
  applyCustomTheme();
}

// ── HELPERS ──
function hexToRGB(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
function isLight(hex) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return (r*299+g*587+b*114)/1000 > 128;
}

// ── RESTORE CUSTOM THEME ON LOAD ──
function restoreCustomTheme() {
  const saved = localStorage.getItem('stello_custom_theme');
  if(saved && localStorage.getItem('stello_theme')==='custom') {
    try {
      currentTB = JSON.parse(saved);
      applyCustomTheme();
    } catch(e) {}
  }
}

// ── HOOK INTO SETTINGS OPEN ──
const _origOpenSettings = window.openSettings;
window.openSettings = function(tab) {
  _origOpenSettings(tab || 'themes');
  injectThemeBuilder();
  if(tab==='builder') {
    // switch all tabs
    document.querySelectorAll('.sp-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab==='builder'));
    ['themes','models','personality'].forEach(id=>{
      const el=document.getElementById('tab-'+id);if(el)el.style.display='none';
    });
    const bl=document.getElementById('tab-builder');if(bl)bl.style.display='flex';
  }
};

// ── OVERRIDE switchTab to handle builder ──
const _origSwitchTab = window.switchTab;
window.switchTab = function(tab) {
  // Always inject builder content first
  injectThemeBuilder();
  // Call original for themes/models/personality
  if(typeof _origSwitchTab === 'function') _origSwitchTab(tab);
  // Handle builder tab visibility
  const bl = document.getElementById('tab-builder');
  if(bl) bl.style.display = tab==='builder' ? 'flex' : 'none';
  // Mark tab active
  document.querySelectorAll('.sp-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
};

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  restoreCustomTheme();
});
if(document.readyState==='complete') restoreCustomTheme();
