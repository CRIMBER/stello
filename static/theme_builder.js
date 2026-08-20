/* ═══════════════════════════════════════
   STELLO — Theme Builder REVAMP
   Fix: switching back to preset themes
   now properly clears all custom vars
═══════════════════════════════════════ */

// ── STATE ──
let tbCurrentTheme = {
  name: 'My Theme',
  bg1: '#0a0a0f', bg2: '#1a1a2e',
  accent: '#4a90ff', accent2: '#80b8ff',
  style: 'glass', particles: 'dots',
  radius: 12, font: 'syne',
};

const TB_STYLE_PRESETS = {
  glass:   { '--sur':'rgba(255,255,255,0.05)', '--surh':'rgba(255,255,255,0.09)', '--bdr':'rgba(255,255,255,0.1)',  '--bdra':'rgba(255,255,255,0.25)', '--bbub':'rgba(255,255,255,0.06)', '--ubub':'rgba(255,255,255,0.12)', '--ibg':'rgba(255,255,255,0.06)',  '--sbg':'rgba(10,10,20,0.96)',   '--tbar':'rgba(10,10,20,0.85)' },
  brutal:  { '--sur':'rgba(0,0,0,0)',          '--surh':'rgba(255,255,255,0.05)', '--bdr':'rgba(255,255,255,0.9)', '--bdra':'rgba(255,255,255,1)',    '--bbub':'rgba(0,0,0,0)',         '--ubub':'rgba(255,255,255,0.15)','--ibg':'rgba(0,0,0,0)',          '--sbg':'rgba(0,0,0,0.98)',      '--tbar':'rgba(0,0,0,0.95)' },
  neo:     { '--sur':'rgba(255,255,255,0.03)', '--surh':'rgba(255,255,255,0.06)', '--bdr':'rgba(255,255,255,0.04)','--bdra':'rgba(255,255,255,0.08)', '--bbub':'rgba(255,255,255,0.04)','--ubub':'rgba(255,255,255,0.08)','--ibg':'rgba(255,255,255,0.03)', '--sbg':'rgba(15,15,25,0.99)',   '--tbar':'rgba(12,12,22,0.95)' },
  neon:    { '--sur':'rgba(255,255,255,0.03)', '--surh':'rgba(255,255,255,0.07)', '--bdr':'rgba(74,144,255,0.3)',  '--bdra':'rgba(74,144,255,0.7)',   '--bbub':'rgba(74,144,255,0.05)', '--ubub':'rgba(74,144,255,0.18)', '--ibg':'rgba(74,144,255,0.05)', '--sbg':'rgba(5,5,15,0.98)',     '--tbar':'rgba(5,5,15,0.92)' },
  minimal: { '--sur':'rgba(255,255,255,0.03)', '--surh':'rgba(255,255,255,0.06)', '--bdr':'rgba(255,255,255,0.06)','--bdra':'rgba(255,255,255,0.12)', '--bbub':'rgba(255,255,255,0.04)','--ubub':'rgba(255,255,255,0.08)','--ibg':'rgba(255,255,255,0.03)', '--sbg':'rgba(8,8,12,0.99)',     '--tbar':'rgba(8,8,12,0.95)' },
};

const TB_FONTS = {
  syne:     "'Syne', sans-serif",
  mono:     "'DM Mono', monospace",
  serif:    "'Playfair Display', serif",
  jp:       "'Noto Serif JP', serif",
  rajdhani: "'Rajdhani', sans-serif",
};

// ALL CSS vars the builder can touch — so we can cleanly remove them
const TB_ALL_VARS = [
  '--bg','--ac','--ac2','--tx','--txm','--txd','--glow','--sg',
  '--rc','--fd','--st','--ac-rgb','--sur','--surh','--bdr','--bdra',
  '--bbub','--ubub','--ibg','--sbg','--tbar','--bg2g','--bbdr',
];

// ── KEY FIX: clear all custom vars when switching to preset ──
function tbClearCustomVars() {
  const root = document.documentElement;
  TB_ALL_VARS.forEach(v => root.style.removeProperty(v));
  root.style.removeProperty('background');
  document.body.style.removeProperty('background');
  localStorage.removeItem('stello_custom_theme');
}

// ── PATCH setTheme to always clear custom vars first ──
const _tbOrigSetTheme = window.setTheme;
window.setTheme = function(theme, save = true) {
  // Always clear custom CSS overrides before applying any theme
  tbClearCustomVars();
  // Remove custom data-theme if switching to preset
  if (theme !== 'custom') {
    document.documentElement.removeAttribute('data-theme');
  }
  // Call original
  if (typeof _tbOrigSetTheme === 'function') {
    _tbOrigSetTheme(theme, save);
  }
  // Update builder tab active state in settings if open
  document.querySelectorAll('.theme-card').forEach(c =>
    c.classList.toggle('active', c.dataset.theme === theme)
  );
};

// ── INJECT BUILDER TAB INTO SETTINGS ──
function tbInject() {
  const panel = document.querySelector('.settings-panel');
  if (!panel) return;

  // Add tab button ONLY if one doesn't already exist in the HTML
  const tabs = panel.querySelector('.sp-tabs');
  const existingBuilderTab = tabs ? tabs.querySelector('[data-tab="builder"]') : null;
  if (tabs && !existingBuilderTab) {
    const btn = document.createElement('button');
    btn.className = 'sp-tab';
    btn.id = 'tbTabBtn';
    btn.dataset.tab = 'builder';
    btn.textContent = '🎨 Builder';
    btn.onclick = () => tbSwitchToBuilder();
    tabs.appendChild(btn);
  } else if (existingBuilderTab) {
    // Wire up the hardcoded tab from index.html
    existingBuilderTab.onclick = () => tbSwitchToBuilder();
    // Remove any duplicate we may have injected earlier
    const dupe = document.getElementById('tbTabBtn');
    if (dupe && dupe !== existingBuilderTab) dupe.remove();
  }

  // Add content panel if missing
  if (!document.getElementById('tab-builder')) {
    const div = document.createElement('div');
    div.className = 'sp-content';
    div.id = 'tab-builder';
    div.style.display = 'none';
    div.innerHTML = tbBuildHTML();
    panel.appendChild(div);
    tbBindEvents();
  }
}

function tbSwitchToBuilder() {
  tbInject();
  // Hide all other tabs
  ['themes','models','personality'].forEach(id => {
    const el = document.getElementById('tab-' + id);
    if (el) el.style.display = 'none';
  });
  document.getElementById('tab-builder').style.display = 'flex';
  // Update tab active states
  document.querySelectorAll('.sp-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === 'builder')
  );
  // Load saved themes list
  tbRenderSaved();
}

// Patch openSettings to inject builder
const _tbOrigOpen = window.openSettings;
window.openSettings = function(tab) {
  if (typeof _tbOrigOpen === 'function') _tbOrigOpen(tab || 'themes');
  tbInject();
  if (tab === 'builder') tbSwitchToBuilder();
};

// Patch switchTab to handle builder
const _tbOrigSwitch = window.switchTab;
window.switchTab = function(tab) {
  if (tab === 'builder') { tbSwitchToBuilder(); return; }
  // Hide builder panel when switching away
  const bl = document.getElementById('tab-builder');
  if (bl) bl.style.display = 'none';
  if (typeof _tbOrigSwitch === 'function') _tbOrigSwitch(tab);
};

// ── BUILD HTML ──
function tbBuildHTML() {
  return `
<div class="tb-wrap">

  <!-- AI Generator -->
  <div class="tb-section">
    <div class="tb-section-title">✨ AI Theme Generator</div>
    <p class="tb-desc">Describe your vibe — STELLO cooks up theme options.</p>
    <textarea id="tbAiPrompt" class="tb-textarea" placeholder="e.g. dark ocean, cyberpunk Tokyo, pastel anime, Interstellar..."></textarea>
    <button class="tb-btn-ai" id="tbAiBtn" onclick="tbGenerateAI()">
      <span id="tbAiBtnTxt">✨ Generate Theme Options</span>
    </button>
    <div id="tbAiResults" style="display:none" class="tb-ai-results"></div>
  </div>

  <div class="tb-divider">— or build manually —</div>

  <!-- Name -->
  <div class="tb-section">
    <div class="tb-section-title">Theme Name</div>
    <input id="tbName" class="tb-input" value="My Theme" placeholder="Name your theme..." maxlength="30"/>
  </div>

  <!-- Background -->
  <div class="tb-section">
    <div class="tb-section-title">Background</div>
    <div class="tb-color-row">
      <div class="tb-color-item">
        <label class="tb-color-label">Primary</label>
        <div class="tb-color-wrap">
          <input type="color" id="tbBg1" class="tb-color" value="#0a0a0f" oninput="tbSyncColor('tbBg1');tbPreview()"/>
          <span class="tb-color-val" id="tbBg1Val">#0a0a0f</span>
        </div>
      </div>
      <div class="tb-color-item">
        <label class="tb-color-label">Secondary</label>
        <div class="tb-color-wrap">
          <input type="color" id="tbBg2" class="tb-color" value="#1a1a2e" oninput="tbSyncColor('tbBg2');tbPreview()"/>
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
          <input type="color" id="tbAccent" class="tb-color" value="#4a90ff" oninput="tbSyncColor('tbAccent');tbPreview()"/>
          <span class="tb-color-val" id="tbAccentVal">#4a90ff</span>
        </div>
      </div>
      <div class="tb-color-item">
        <label class="tb-color-label">Secondary</label>
        <div class="tb-color-wrap">
          <input type="color" id="tbAccent2" class="tb-color" value="#80b8ff" oninput="tbSyncColor('tbAccent2');tbPreview()"/>
          <span class="tb-color-val" id="tbAccent2Val">#80b8ff</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Style -->
  <div class="tb-section">
    <div class="tb-section-title">Style</div>
    <div class="tb-style-row">
      <button class="tb-style-btn active" data-style="glass"   onclick="tbSetStyle('glass',this)">  🪟 Glass</button>
      <button class="tb-style-btn"        data-style="brutal"  onclick="tbSetStyle('brutal',this)"> ⬛ Brutal</button>
      <button class="tb-style-btn"        data-style="neo"     onclick="tbSetStyle('neo',this)">    🌫 Neo</button>
      <button class="tb-style-btn"        data-style="neon"    onclick="tbSetStyle('neon',this)">   💜 Neon</button>
      <button class="tb-style-btn"        data-style="minimal" onclick="tbSetStyle('minimal',this)">◻️ Min</button>
    </div>
  </div>

  <!-- Particles -->
  <div class="tb-section">
    <div class="tb-section-title">Particles</div>
    <div class="tb-style-row">
      <button class="tb-style-btn active" data-p="dots"   onclick="tbSetParticles('dots',this)">  · Dots</button>
      <button class="tb-style-btn"        data-p="stars"  onclick="tbSetParticles('stars',this)"> ★ Stars</button>
      <button class="tb-style-btn"        data-p="embers" onclick="tbSetParticles('embers',this)">🔥 Embers</button>
      <button class="tb-style-btn"        data-p="none"   onclick="tbSetParticles('none',this)">  ○ None</button>
    </div>
  </div>

  <!-- Radius -->
  <div class="tb-section">
    <div class="tb-section-title">Border Radius — <span id="tbRadiusVal">12px</span></div>
    <input type="range" id="tbRadius" class="tb-slider" min="0" max="24" value="12" oninput="tbPreview()"/>
    <div class="tb-radius-labels"><span>Sharp</span><span>Round</span></div>
  </div>

  <!-- Font -->
  <div class="tb-section">
    <div class="tb-section-title">Font</div>
    <div class="tb-font-row">
      <button class="tb-font-btn active" data-font="syne"     onclick="tbSetFont('syne',this)"     style="font-family:'Syne',sans-serif">Syne</button>
      <button class="tb-font-btn"        data-font="mono"     onclick="tbSetFont('mono',this)"     style="font-family:'DM Mono',monospace">Mono</button>
      <button class="tb-font-btn"        data-font="serif"    onclick="tbSetFont('serif',this)"    style="font-family:'Playfair Display',serif">Serif</button>
      <button class="tb-font-btn"        data-font="jp"       onclick="tbSetFont('jp',this)"       style="font-family:'Noto Serif JP',serif">和</button>
      <button class="tb-font-btn"        data-font="rajdhani" onclick="tbSetFont('rajdhani',this)" style="font-family:'Rajdhani',sans-serif">Raj</button>
    </div>
  </div>

  <!-- Preview -->
  <div class="tb-section">
    <div class="tb-section-title">Live Preview</div>
    <div class="tb-preview" id="tbPreviewBox">
      <div class="tb-prev-bubble tb-prev-bot">Hey — this theme looks fire 🔥</div>
      <div class="tb-prev-bubble tb-prev-user">fr bro, you cooked it 🎨</div>
      <div class="tb-prev-input">
        <span style="flex:1;opacity:.35;font-size:13px">speak your mind...</span>
        <div class="tb-prev-send">→</div>
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="tb-actions">
    <button class="tb-btn-save"  onclick="tbSave()">💾 Save</button>
    <button class="tb-btn-apply" onclick="tbApply()">✓ Apply Now</button>
  </div>

  <!-- Saved themes -->
  <div class="tb-section" id="tbSavedSection" style="display:none">
    <div class="tb-section-title">Saved Themes</div>
    <div id="tbSavedList" class="tb-saved-list"></div>
  </div>
</div>`;
}

// ── BIND EVENTS ──
function tbBindEvents() {
  const nameEl = document.getElementById('tbName');
  if (nameEl) nameEl.addEventListener('input', () => {
    tbCurrentTheme.name = nameEl.value || 'My Theme';
  });
  const radius = document.getElementById('tbRadius');
  const radVal = document.getElementById('tbRadiusVal');
  if (radius && radVal) radius.addEventListener('input', () => {
    radVal.textContent = radius.value + 'px';
  });
}

function tbSyncColor(id) {
  const el = document.getElementById(id);
  const val = document.getElementById(id + 'Val');
  if (el && val) val.textContent = el.value;
}

// ── STYLE / PARTICLE / FONT SETTERS ──
function tbSetStyle(s, btn) {
  tbCurrentTheme.style = s;
  document.querySelectorAll('.tb-style-btn[data-style]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  tbPreview();
}
function tbSetParticles(p, btn) {
  tbCurrentTheme.particles = p;
  document.querySelectorAll('.tb-style-btn[data-p]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function tbSetFont(f, btn) {
  tbCurrentTheme.font = f;
  document.querySelectorAll('.tb-font-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const preview = document.getElementById('tbPreviewBox');
  if (preview) preview.style.fontFamily = TB_FONTS[f] || TB_FONTS.syne;
}

// ── LIVE PREVIEW ──
function tbPreview() {
  tbCurrentTheme.bg1    = document.getElementById('tbBg1')?.value    || tbCurrentTheme.bg1;
  tbCurrentTheme.bg2    = document.getElementById('tbBg2')?.value    || tbCurrentTheme.bg2;
  tbCurrentTheme.accent = document.getElementById('tbAccent')?.value || tbCurrentTheme.accent;
  tbCurrentTheme.accent2= document.getElementById('tbAccent2')?.value|| tbCurrentTheme.accent2;
  tbCurrentTheme.radius = parseInt(document.getElementById('tbRadius')?.value || 12);

  const rv = document.getElementById('tbRadiusVal');
  if (rv) rv.textContent = tbCurrentTheme.radius + 'px';

  const box = document.getElementById('tbPreviewBox');
  if (!box) return;

  const preset = TB_STYLE_PRESETS[tbCurrentTheme.style] || TB_STYLE_PRESETS.glass;
  const rc = tbCurrentTheme.radius + 'px';

  box.style.background    = `linear-gradient(135deg,${tbCurrentTheme.bg1},${tbCurrentTheme.bg2})`;
  box.style.borderColor   = tbCurrentTheme.accent + '44';
  box.style.borderRadius  = rc;
  box.style.fontFamily    = TB_FONTS[tbCurrentTheme.font] || TB_FONTS.syne;

  const bot  = box.querySelector('.tb-prev-bot');
  const user = box.querySelector('.tb-prev-user');
  const inp  = box.querySelector('.tb-prev-input');
  const send = box.querySelector('.tb-prev-send');

  if (bot)  { bot.style.background  = preset['--bbub'] || 'rgba(255,255,255,.06)'; bot.style.borderColor  = preset['--bdr']  || 'rgba(255,255,255,.1)';  bot.style.borderRadius = rc; }
  if (user) { user.style.background = tbCurrentTheme.accent + '22';                user.style.borderColor = tbCurrentTheme.accent + '66';                user.style.borderRadius = rc; }
  if (inp)  { inp.style.background  = preset['--ibg'] || 'rgba(255,255,255,.06)'; inp.style.borderColor  = preset['--bdr']  || 'rgba(255,255,255,.1)';  inp.style.borderRadius = rc; }
  if (send) { send.style.background = `linear-gradient(135deg,${tbCurrentTheme.accent},${tbCurrentTheme.accent2})`; send.style.borderRadius = Math.min(tbCurrentTheme.radius, 10) + 'px'; }
}

// ── APPLY CUSTOM THEME ──
function tbApply() {
  const t = tbCurrentTheme;
  const preset = TB_STYLE_PRESETS[t.style] || TB_STYLE_PRESETS.glass;
  const root = document.documentElement;
  const txColor = tbIsLight(t.bg1) ? '#0a0a0a' : '#f0f0ff';
  const acRGB = tbHexRGB(t.accent);

  // Set custom theme marker
  root.setAttribute('data-theme', 'custom');
  localStorage.setItem('stello_theme', 'custom');

  // Apply all CSS variables inline
  const vars = {
    '--bg':   t.bg1,
    '--ac':   t.accent,
    '--ac2':  t.accent2,
    '--tx':   txColor,
    '--txm':  txColor + 'aa',
    '--txd':  txColor + '55',
    '--glow': t.accent + '33',
    '--sg':   `linear-gradient(135deg,${t.accent},${t.accent2})`,
    '--rc':   t.radius + 'px',
    '--fd':   TB_FONTS[t.font] || TB_FONTS.syne,
    '--st':   t.accent2,
    '--ac-rgb': acRGB,
    ...preset,
  };
  Object.entries(vars).forEach(([k, v]) => {
    if (k !== 'backdrop') root.style.setProperty(k, v);
  });

  // Body background
  document.body.style.background = `linear-gradient(135deg,${t.bg1} 0%,${t.bg2} 100%)`;

  // Update brand label
  const brandSub = document.getElementById('brandSub');
  if (brandSub) brandSub.textContent = '✨ ' + t.name.toUpperCase();

  // Reinit particles
  if (t.particles !== 'none' && typeof tsParticles !== 'undefined') {
    if (window._p) { try { window._p.destroy(); } catch(e){} window._p = null; }
    tsParticles.load('particles', {
      particles: {
        number: { value: t.particles === 'embers' ? 40 : 20 },
        color: { value: [t.accent, t.accent2] },
        opacity: { value: .3, random: true },
        move: { enable: true, speed: t.particles === 'embers' ? .5 : .15, random: true, out_mode: 'out',
          direction: t.particles === 'embers' ? 'top' : 'none' },
        size: { value: { min: 1, max: t.particles === 'stars' ? 3 : 2 }, random: true },
        links: { enable: false }
      }, detectRetina: true
    }).then(p => window._p = p);
  } else if (t.particles === 'none' && window._p) {
    try { window._p.destroy(); } catch(e){} window._p = null;
  }

  // Save to localStorage
  localStorage.setItem('stello_custom_theme', JSON.stringify(t));

  // Close settings
  if (typeof closeSettings === 'function') closeSettings();
  if (typeof playSound === 'function') playSound('send');
}

// ── SAVE THEME ──
function tbSave() {
  const name = document.getElementById('tbName')?.value.trim() || 'My Theme';
  tbCurrentTheme.name = name;
  const saved = JSON.parse(localStorage.getItem('stello_saved_themes') || '{}');
  saved[name] = { ...tbCurrentTheme };
  localStorage.setItem('stello_saved_themes', JSON.stringify(saved));
  tbRenderSaved();
  tbApply();
}

// ── RENDER SAVED THEMES ──
function tbRenderSaved() {
  const saved = JSON.parse(localStorage.getItem('stello_saved_themes') || '{}');
  const list = document.getElementById('tbSavedList');
  const section = document.getElementById('tbSavedSection');
  if (!list || !section) return;
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
        <button onclick="tbLoadSaved('${name}')" class="tb-saved-apply">Apply</button>
        <button onclick="tbDeleteSaved('${name}')" class="tb-saved-del">✕</button>
      </div>`;
    list.appendChild(item);
  });
}

function tbLoadSaved(name) {
  const saved = JSON.parse(localStorage.getItem('stello_saved_themes') || '{}');
  if (!saved[name]) return;
  tbCurrentTheme = { ...saved[name] };
  tbPopulateInputs();
  tbPreview();
  tbApply();
}

function tbDeleteSaved(name) {
  const saved = JSON.parse(localStorage.getItem('stello_saved_themes') || '{}');
  delete saved[name];
  localStorage.setItem('stello_saved_themes', JSON.stringify(saved));
  tbRenderSaved();
}

function tbPopulateInputs() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  const txt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('tbBg1', tbCurrentTheme.bg1);      txt('tbBg1Val', tbCurrentTheme.bg1);
  set('tbBg2', tbCurrentTheme.bg2);      txt('tbBg2Val', tbCurrentTheme.bg2);
  set('tbAccent', tbCurrentTheme.accent);txt('tbAccentVal', tbCurrentTheme.accent);
  set('tbAccent2',tbCurrentTheme.accent2);txt('tbAccent2Val',tbCurrentTheme.accent2);
  set('tbRadius', tbCurrentTheme.radius);txt('tbRadiusVal', tbCurrentTheme.radius + 'px');
  set('tbName', tbCurrentTheme.name);
  document.querySelectorAll('.tb-style-btn[data-style]').forEach(b => b.classList.toggle('active', b.dataset.style === tbCurrentTheme.style));
  document.querySelectorAll('.tb-style-btn[data-p]').forEach(b => b.classList.toggle('active', b.dataset.p === tbCurrentTheme.particles));
  document.querySelectorAll('.tb-font-btn').forEach(b => b.classList.toggle('active', b.dataset.font === tbCurrentTheme.font));
}

// ── AI GENERATOR ──
async function tbGenerateAI() {
  const prompt = document.getElementById('tbAiPrompt')?.value.trim();
  if (!prompt) return;
  const btn = document.getElementById('tbAiBtn');
  const txt = document.getElementById('tbAiBtnTxt');
  const results = document.getElementById('tbAiResults');
  if (btn) btn.disabled = true;
  if (txt) txt.innerHTML = '<span class="tb-spin"></span>STELLO is cooking...';
  if (results) results.style.display = 'none';

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Generate 3 distinct UI theme options for this vibe: "${prompt}"

Reply ONLY with a valid JSON array, no markdown, no explanation:
[
  {
    "name": "Theme Name",
    "description": "One sentence vibe",
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

Rules: dark backgrounds unless explicitly light. Vibrant accents. All 3 visually distinct.`,
        model: 'openai/gpt-4o-mini',
        mode: 'chat',
        history: [],
      })
    });
    const data = await res.json();
    const reply = data.reply || '';
    const match = reply.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('no JSON');
    const themes = JSON.parse(match[0]);

    results.style.display = 'block';
    results.innerHTML = '<div class="tb-ai-label">✨ Pick one:</div>';
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
          </div>
        </div>
        <button class="tb-ai-apply" onclick="tbApplyAI(${i})">Apply →</button>`;
      results.appendChild(card);
    });
    window._tbAIThemes = themes;
  } catch(e) {
    results.style.display = 'block';
    results.innerHTML = '<div style="color:rgba(255,100,100,.8);font-size:12px;font-family:var(--fm)">⚠️ Generation failed. Try a more descriptive prompt.</div>';
  }
  if (btn) btn.disabled = false;
  if (txt) txt.textContent = '✨ Generate Theme Options';
}

function tbApplyAI(i) {
  const t = window._tbAIThemes?.[i];
  if (!t) return;
  tbCurrentTheme = {
    name: t.name, bg1: t.bg1, bg2: t.bg2,
    accent: t.accent, accent2: t.accent2,
    style: t.style || 'glass', particles: t.particles || 'dots',
    font: t.font || 'syne', radius: t.radius || 12,
  };
  tbPopulateInputs();
  tbPreview();
  tbApply();
}

// ── HELPERS ──
function tbHexRGB(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
function tbIsLight(hex) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return (r*299+g*587+b*114)/1000 > 128;
}

// ── RESTORE CUSTOM THEME ON LOAD ──
function tbRestoreOnLoad() {
  const saved = localStorage.getItem('stello_custom_theme');
  const theme = localStorage.getItem('stello_theme');
  if (saved && theme === 'custom') {
    try {
      tbCurrentTheme = JSON.parse(saved);
      // Don't call tbApply() here — let the original setTheme handle init
      // Just reapply the vars directly
      const t = tbCurrentTheme;
      const preset = TB_STYLE_PRESETS[t.style] || TB_STYLE_PRESETS.glass;
      const root = document.documentElement;
      const txColor = tbIsLight(t.bg1) ? '#0a0a0a' : '#f0f0ff';
      root.setAttribute('data-theme', 'custom');
      const vars = {
        '--bg': t.bg1,'--ac': t.accent,'--ac2': t.accent2,
        '--tx': txColor,'--txm': txColor+'aa','--txd': txColor+'55',
        '--glow': t.accent+'33','--sg': `linear-gradient(135deg,${t.accent},${t.accent2})`,
        '--rc': t.radius+'px','--fd': TB_FONTS[t.font]||TB_FONTS.syne,'--st': t.accent2,
        '--ac-rgb': tbHexRGB(t.accent), ...preset,
      };
      Object.entries(vars).forEach(([k,v]) => { if(k !== 'backdrop') root.style.setProperty(k,v); });
      document.body.style.background = `linear-gradient(135deg,${t.bg1},${t.bg2})`;
    } catch(e) {}
  }
}

// Init
if (document.readyState === 'complete') tbRestoreOnLoad();
else document.addEventListener('DOMContentLoaded', tbRestoreOnLoad);
