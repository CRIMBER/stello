/* ═══════════════════════════════════════
   STELLO — script.js  PATCH 1
   ✅ Bool bug killed in app.py
   ✅ Career Agent mode added
   ✅ + menu fixed (was not opening)
   ✅ Cutscene auto-map per theme
   ✅ Inline image gen fixed
═══════════════════════════════════════ */

let isLoading=false, chatStarted=false, sidebarVisible=true;
let chatHistory=[], allSessions=[], currentSessionId=null;
let ctxTargetId=null, pendingDeleteId=null;
let currentTheme='ink', currentModel='deepseek/deepseek-chat-v3-0324', currentMode='chat';
let pendingImage=null, recognition=null, isListening=false, customPersonality='';
let generatedImageUrl=null, imgSrc='pollinations', exportFmt='txt';
let modeMenuOpen=false;
let posContext={name:'Taufiq',project:'ML thesis on drug dataset retrieval',goals:'',mood:'😐 neutral',streak:0};
let liquidRaf=null;

// ── CUTSCENE MAP ──
const CUTSCENE_MAP={
  ink:'cutscene_ink.html',matcha:'cutscene_ink.html','zen-garden':'cutscene_ink.html',
  'vintage-scholar':'cutscene_ink.html','dark-academia':'cutscene_ink.html',
  skeleton:'cutscene_ink.html',coffee:'cutscene_ink.html',friends:'cutscene_ink.html',
  oni:'cutscene_oni.html',sith:'cutscene_oni.html','breaking-bad':'cutscene_oni.html',
  'stranger-things':'cutscene_oni.html',dc:'cutscene_oni.html',f1:'cutscene_oni.html',
  avengers:'cutscene_oni.html',jungle:'cutscene_oni.html',
  space:'cutscene_space.html',starwars:'cutscene_space.html',cosmic:'cutscene_space.html',
  mythical:'cutscene_space.html','harry-potter':'cutscene_space.html',disney:'cutscene_space.html',
};

// ── THEMES ──
const THEMES={
  'ink':            {label:'墨 INK',        line1:'Ink flows,',           acc:'write your story.',       sub:'brush strokes await',            glyph:'星路',swatch:'linear-gradient(135deg,#f5f0e8,#5c3d1e)'},
  'oni':            {label:'🔴 ONI',         line1:'Demon speaks—',        acc:'what do you dare?',       sub:'demon intelligence online',      glyph:'鬼',  swatch:'linear-gradient(135deg,#060002,#cc2200)'},
  'coffee':         {label:'☕ COFFEE',      line1:'Sip, breathe,',        acc:"what's brewing?",         sub:'brewed for brilliance',          glyph:'◈',   swatch:'linear-gradient(135deg,#1c1008,#c8813a)'},
  'matcha':         {label:'🍃 MATCHA',      line1:'Still water.',         acc:'What ripples?',            sub:'zen mode activated',             glyph:'抹',  swatch:'linear-gradient(135deg,#eef2ea,#3a7a3a)'},
  'dark-academia':  {label:'📚 ACADEMIA',   line1:'The tome opens.',      acc:'What do you seek?',        sub:'knowledge is power',             glyph:'✦',   swatch:'linear-gradient(135deg,#1a1510,#c8a850)'},
  'breaking-bad':   {label:'⚗️ HEISENBERG',line1:'Say my name.',          acc:"Let's cook.",             sub:'blue sky thinking',              glyph:'Br',  swatch:'linear-gradient(135deg,#0a0f08,#7acc2a)'},
  'f1':             {label:'🏎 F1',          line1:'Lights out.',          acc:'Away we go.',              sub:'0 to answer in 3 seconds',       glyph:'◥',   swatch:'linear-gradient(135deg,#080808,#e60000)'},
  'sith':           {label:'⚔️ SITH',       line1:'Your anger',           acc:'is your power.',           sub:'the dark side is stronger',      glyph:'☯',   swatch:'linear-gradient(135deg,#020002,#cc0000)'},
  'jungle':         {label:'🌿 JUNGLE',     line1:'The wild calls.',      acc:'What hunts you?',          sub:"nature's algorithm",             glyph:'❧',   swatch:'linear-gradient(135deg,#020e03,#1ab83a)'},
  'skeleton':       {label:'💀 SKELETON',   line1:'Bare bones.',          acc:'What remains?',            sub:'stripped to the truth',          glyph:'☠',   swatch:'linear-gradient(135deg,#f8f8f8,#444)'},
  'starwars':       {label:'⭐ STAR WARS',  line1:'The Force stirs.',     acc:'What do you feel?',        sub:'may the AI be with you',         glyph:'✦',   swatch:'linear-gradient(135deg,#020408,#f0c000)'},
  'space':          {label:'🌌 SPACE ∞',    line1:'Across the cosmos,',   acc:'what calls you?',          sub:'beyond the edge of stars',       glyph:'◎',   swatch:'linear-gradient(135deg,#000408,#4a90ff)'},
  'harry-potter':   {label:'⚡ HP',         line1:'Mischief managed.',    acc:'What spell?',              sub:'magic meets machine',            glyph:'⚡',  swatch:'linear-gradient(135deg,#0f0a18,#9b59d4)'},
  'cosmic':         {label:'🔮 COSMIC',     line1:'You are stardust.',    acc:'What burns?',              sub:'you are the universe thinking',  glyph:'◈',   swatch:'linear-gradient(135deg,#04000e,#cc44ff)'},
  'zen-garden':     {label:'🪨 ZEN',        line1:'Stone by stone.',      acc:'What settles?',            sub:'peace through precision',        glyph:'無',  swatch:'linear-gradient(135deg,#f4f0e8,#8b6914)'},
  'friends':        {label:'☕ FRIENDS',    line1:'Could this BE',        acc:'any more helpful?',        sub:"I'll be there for you",          glyph:'❤',   swatch:'linear-gradient(135deg,#1a1200,#e8b800)'},
  'stranger-things':{label:'🔦 STRANGER',  line1:'Something stirs',      acc:'in the dark.',             sub:'the world is turning',           glyph:'👁',  swatch:'linear-gradient(135deg,#050008,#aa00ee)'},
  'avengers':       {label:'🦸 AVENGERS',  line1:'Assemble.',            acc:"What's the mission?",      sub:'great AI = great answers',       glyph:'A',   swatch:'linear-gradient(135deg,#06080f,#c8a810)'},
  'dc':             {label:'🦇 DC',         line1:'Gotham needs you.',    acc:"What's the signal?",       sub:'justice will be served',         glyph:'⚡',  swatch:'linear-gradient(135deg,#050208,#0066ff)'},
  'disney':         {label:'✨ DISNEY',     line1:'Wish upon a star.',    acc:'What do you dream?',       sub:'adventure is out there',         glyph:'✨',  swatch:'linear-gradient(135deg,#0a0418,#d458a8)'},
  'vintage-scholar':{label:'📜 VINTAGE',   line1:'From the archives,',   acc:'what do you seek?',        sub:'est. wisdom',                    glyph:'📜',  swatch:'linear-gradient(135deg,#1c1408,#b88a28)'},
  'mythical':       {label:'🐉 MYTHICAL',  line1:'Ancient powers stir.', acc:'Speak your will.',         sub:'where legends breathe',          glyph:'龍',  swatch:'linear-gradient(135deg,#020610,#2299cc)'},
};

// ── MODES — includes Career Agent ──
const MODES={
  chat:        {icon:'💬', name:'Chat',         desc:'Standard STELLO conversation'},
  deep_search: {icon:'🔍', name:'Deep Search',  desc:'Multi-source research synthesis'},
  story:       {icon:'✨', name:'Story Weaver',  desc:'Full creative & fantasy mode'},
  science:     {icon:'🔬', name:'Science',       desc:'Rigorous scientific analysis'},
  career:      {icon:'💼', name:'Career Agent',  desc:'ATS optimizer · LinkedIn · Job readiness'},
};

const MODELS={
  'deepseek/deepseek-chat-v3-0324':{name:'DeepSeek V3',   desc:'Best coding + fast reasoning',       tag:'💻 Top coder · Fast'},
  'deepseek/deepseek-r1':          {name:'DeepSeek R1',   desc:'Deepest reasoning — matches Claude', tag:'🧠 Deepest reasoning'},
  'openai/gpt-4o-mini':            {name:'GPT-4o Mini',   desc:'Fast, reliable, everyday tasks',     tag:'⚡ Fastest · Cheap'},
  'openai/gpt-4o':                 {name:'GPT-4o',        desc:'Vision + deep reasoning',            tag:'🔵 Most capable (OpenAI)'},
  'google/gemini-2.0-flash-001':   {name:'Gemini 2.0',    desc:'Google fast, huge context',          tag:'⚡ Fast · 1M context'},
  'google/gemini-2.5-flash':       {name:'Gemini 2.5',    desc:'Google latest, strong reasoning',    tag:'🔵 Smart · Vision'},
  'meta-llama/llama-4-maverick':   {name:'Llama 4',       desc:'Meta open-source flagship',          tag:'🦙 Open source'},
  'mistralai/mistral-large':       {name:'Mistral Large', desc:'European frontier model',            tag:'🇪🇺 Precise'},
  'qwen/qwen3-235b-a22b':          {name:'Qwen 3 235B',   desc:'Massive model, incredible reasoning',tag:'🧠 Biggest brain'},
  'x-ai/grok-3-mini-beta':         {name:'Grok 3 Mini',   desc:'xAI — witty, fast, capable',        tag:'⚡ Fun · Fast'},
};

const PRESETS={
  default:`Talk like a brilliant close friend — casual, real, honest. Slang naturally. Direct. Light humor. Never start with "Certainly!" Gas Taufiq up when grinding.`,
  chill:`Very relaxed. Short. Minimal. Just answer.`,
  beast:`BEAST MODE. No fluff. Bullets. Data. Results only.`,
  roast:`Roast gently first, then help. Funny angle always.`,
};

// ── AUDIO ──
let audioCtx=null;
function getACtx(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();return audioCtx;}
function playTone(freq,dur=0.12,vol=0.04,delay=0){
  try{const c=getACtx(),o=c.createOscillator(),g=c.createGain();
  o.connect(g);g.connect(c.destination);
  const s=c.currentTime+delay;
  o.frequency.setValueAtTime(freq,s);g.gain.setValueAtTime(vol,s);
  g.gain.exponentialRampToValueAtTime(0.001,s+dur);o.start(s);o.stop(s+dur+0.01);}catch(e){}
}
function playSound(t){
  if(t==='send'){playTone(660,.1);playTone(880,.1,.034,.08);}
  if(t==='recv'){playTone(520,.12,.034);playTone(640,.1,.028,.1);}
}

// ── LIQUID MERCURY ──
function initLiquid(){
  const canvas=document.getElementById('liquidCanvas');if(!canvas)return;
  const mercThemes=['oni','sith','dc','f1','stranger-things'];
  if(liquidRaf){cancelAnimationFrame(liquidRaf);liquidRaf=null;}
  if(!mercThemes.includes(currentTheme)){canvas.style.opacity='0';return;}
  const ctx=canvas.getContext('2d');
  canvas.width=innerWidth;canvas.height=innerHeight;canvas.style.opacity='.6';
  const cols={oni:'204,34,0',sith:'180,0,0',dc:'0,100,220',f1:'220,0,0','stranger-things':'170,0,238'};
  const col=cols[currentTheme]||'200,0,0';
  const W=canvas.width,H=canvas.height;
  const blobs=Array.from({length:5},(_,i)=>({
    x:W*(0.15+i*0.17)+(Math.random()-.5)*60,y:H*(0.3+Math.sin(i*1.2)*0.3),
    vx:(Math.random()-.5)*.55,vy:(Math.random()-.5)*.38,
    r:Math.min(W,H)*(0.07+i*0.01)
  }));
  function draw(){
    ctx.clearRect(0,0,W,H);
    blobs.forEach(b=>{
      b.x+=b.vx;b.y+=b.vy;
      if(b.x<b.r||b.x>W-b.r)b.vx*=-1;
      if(b.y<b.r||b.y>H-b.r)b.vy*=-1;
      const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*1.3);
      g.addColorStop(0,'rgba('+col+',.17)');
      g.addColorStop(.5,'rgba('+col+',.08)');
      g.addColorStop(1,'rgba('+col+',0)');
      ctx.beginPath();ctx.arc(b.x,b.y,b.r*1.3,0,Math.PI*2);
      ctx.fillStyle=g;ctx.fill();
    });
    for(let i=0;i<blobs.length;i++){
      for(let j=i+1;j<blobs.length;j++){
        const a=blobs[i],b=blobs[j];
        const dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy),maxD=a.r+b.r+100;
        if(d<maxD){
          const al=.07*(1-d/maxD);
          const lg=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
          lg.addColorStop(0,'rgba('+col+','+al+')');
          lg.addColorStop(.5,'rgba('+col+','+(al*1.6)+')');
          lg.addColorStop(1,'rgba('+col+','+al+')');
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=lg;
          ctx.lineWidth=Math.max(1,(a.r+b.r)*.12*(1-d/maxD));
          ctx.stroke();
        }
      }
    }
    liquidRaf=requestAnimationFrame(draw);
  }
  draw();
}

// ── PARTICLES ──
const PCOLS={
  ink:['#5c3d1e','#8b0000'],oni:['#cc2200','#ff4422'],coffee:['#c8813a','#f5c880'],
  matcha:['#3a7a3a','#5a9e5a'],'dark-academia':['#c8a850','#e0c070'],
  'breaking-bad':['#7acc2a','#9de84a'],f1:['#e60000','#ff4422'],sith:['#cc0000','#880000'],
  jungle:['#1ab83a','#3ade5a'],skeleton:['#444','#888'],starwars:['#f0c000','#ffd700'],
  space:['#4a90ff','#80b8ff','#fff'],'harry-potter':['#9b59d4','#c07aff','#ffd700'],
  cosmic:['#cc44ff','#ee88ff'],'zen-garden':['#8b6914','#c8a030'],
  friends:['#e8b800','#ffd000'],'stranger-things':['#aa00ee','#dd44ff'],
  avengers:['#c8a810','#e8c830'],dc:['#0066ff','#4499ff'],disney:['#d458a8','#f87ed0'],
  'vintage-scholar':['#b88a28','#d8aa48'],mythical:['#2299cc','#44bbee'],
};
let _p=null;
function initParticles(){
  const dark=['oni','coffee','breaking-bad','f1','sith','jungle','starwars','space',
    'harry-potter','cosmic','stranger-things','avengers','dc','disney','vintage-scholar',
    'mythical','dark-academia','friends'];
  const isDark=dark.includes(currentTheme);
  if(_p){try{_p.destroy();}catch(e){}_p=null;}
  tsParticles.load('particles',{particles:{
    number:{value:isDark?28:13,density:{enable:true,value_area:900}},
    color:{value:PCOLS[currentTheme]||['#888']},
    opacity:{value:isDark?.24:.1,random:true,anim:{enable:true,speed:.3,opacity_min:.02}},
    links:{enable:['space','starwars','cosmic','dc'].includes(currentTheme),distance:120,opacity:.07,width:.5},
    move:{enable:true,speed:isDark?.28:.11,random:true,out_mode:'out'},
    size:{value:{min:1,max:isDark?3:2},random:true}
  },detectRetina:true}).then(p=>_p=p);
}
function initBgCanvas(){
  const canvas=document.getElementById('bgCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');
  canvas.width=innerWidth;canvas.height=innerHeight;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const inkT=['ink','matcha','coffee','dark-academia','zen-garden','vintage-scholar'];
  if(!inkT.includes(currentTheme)){canvas.style.opacity='0';return;}
  canvas.style.opacity='.05';
  const clr={ink:'#1a1209',matcha:'#182416',coffee:'#1c1008','dark-academia':'#2a1a08','zen-garden':'#2a2018','vintage-scholar':'#241808'};
  ctx.strokeStyle=clr[currentTheme]||'#1a1209';
  [{x:28,y:80,l:180,a:-.28},{x:canvas.width-45,y:170,l:135,a:.18},
   {x:55,y:canvas.height-85,l:110,a:-.1},{x:canvas.width-65,y:canvas.height-60,l:95,a:.32}]
  .forEach(s=>{
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.a);
    ctx.lineWidth=Math.random()*7+3;ctx.lineCap='round';
    ctx.globalAlpha=.05+Math.random()*.03;
    ctx.beginPath();ctx.moveTo(0,0);
    for(let i=0;i<s.l;i+=10)ctx.lineTo(i+(Math.random()-.5)*6,(Math.random()-.5)*10);
    ctx.stroke();ctx.restore();
  });
}

// ── INIT ──
window.onload=()=>{
  const urlTheme=new URLSearchParams(location.search).get('theme');
  const saved=localStorage.getItem('stello_theme')||urlTheme||'ink';
  currentModel=localStorage.getItem('stello_model')||'deepseek/deepseek-chat-v3-0324';
  customPersonality=localStorage.getItem('stello_personality')||'';
  const sp=localStorage.getItem('stello_pos');
  if(sp)try{posContext=JSON.parse(sp);}catch(e){}
  updatePOSStrip();
  setTheme(saved,false);setModel(currentModel,false);
  initParticles();initBgCanvas();initLiquid();
  loadSessions();initVoice();initPaste();
  document.getElementById('sidebarToggle').onclick=toggleSidebar;
  ['homeInput','chatInput'].forEach(id=>{
    document.getElementById(id)?.addEventListener('keydown',e=>{
      if(e.key==='Enter'){e.preventDefault();send();}
    });
  });
  document.addEventListener('click',e=>{
    const ctx=document.getElementById('ctxMenu');
    if(ctx&&ctx.classList.contains('show')&&!ctx.contains(e.target))hideCtx();
    if(modeMenuOpen){
      const mm=document.getElementById('modeMenu');
      const mpb=document.getElementById('modePlusBtn');
      if(mm&&!mm.contains(e.target)&&!mpb?.contains(e.target))closeModeMenu();
    }
  });
  window.addEventListener('resize',()=>{initLiquid();initBgCanvas();});
  setTimeout(()=>playSound('send'),300);
  setTimeout(loadProactiveBanner,3500);
};

// ── SET THEME ──
function setTheme(theme,save=true){
  if(!THEMES[theme])return;
  const prev=currentTheme;currentTheme=theme;
  document.documentElement.setAttribute('data-theme',theme);
  if(save)localStorage.setItem('stello_theme',theme);
  const cfg=THEMES[theme];
  const $=id=>document.getElementById(id);
  if($('brandSub'))$('brandSub').textContent=cfg.label;
  if($('heroGlyph'))$('heroGlyph').textContent=cfg.glyph;
  if($('heroLine1'))$('heroLine1').textContent=cfg.line1;
  if($('heroAcc'))$('heroAcc').textContent=cfg.acc;
  if($('heroSub'))$('heroSub').textContent=cfg.sub;
  if($('topbarLabel'))$('topbarLabel').textContent=
    'STELLO · '+cfg.label+' · '+(MODES[currentMode]?.icon||'💬')+' '+(MODES[currentMode]?.name||'Chat');
  document.querySelectorAll('.theme-card').forEach(c=>c.classList.toggle('active',c.dataset.theme===theme));
  setTimeout(()=>{initParticles();initBgCanvas();initLiquid();},80);
  if(save&&prev!==theme)playSound('send');
}

// ── SET MODE — THE FIX ──
function setMode(mode){
  if(!MODES[mode])return;
  currentMode=mode;
  closeModeMenu(); // always close after picking
  const m=MODES[mode];
  const mb=document.getElementById('modeBadge');
  if(mb)mb.textContent=m.icon+' '+m.name;
  const tl=document.getElementById('topbarLabel');
  if(tl)tl.textContent='STELLO · '+(THEMES[currentTheme]?.label||'')+' · '+m.icon+' '+m.name;
  document.querySelectorAll('.mm-item[data-mode]').forEach(i=>
    i.classList.toggle('active-mode',i.dataset.mode===mode));
  const mpb=document.getElementById('modePlusBtn');
  if(mpb)mpb.classList.toggle('mode-active',mode!=='chat');
  playSound('send');
  // Career Agent welcome message
  if(mode==='career'&&chatStarted){
    const area=document.getElementById('chat');
    if(area){
      const msg=document.createElement('div');msg.className='msg bot';
      const inner=document.createElement('div');inner.className='msg-inner';
      const label=document.createElement('span');label.className='msg-label';
      label.textContent='💼 CAREER AGENT';
      const bubble=document.createElement('div');bubble.className='bubble';
      bubble.innerHTML=marked.parse(
        '## 💼 Career Agent Activated\n\nI\'m your personal AI career coach, ATS optimizer, and LinkedIn strategist.\n\n**To get started, share any of these:**\n- Your resume text (paste it here)\n- Your LinkedIn About section\n- A job description you\'re targeting\n- Or just say: *"analyze my profile"*\n\nI\'ll give you a full analysis with **scores, optimizations, and an action plan**.'
      );
      inner.appendChild(label);inner.appendChild(bubble);msg.appendChild(inner);
      area.appendChild(msg);area.scrollTop=area.scrollHeight;
    }
  }
  // If career mode picked from home, open chat first
  if(mode==='career'&&!chatStarted){
    openChat();
    setTimeout(()=>setMode('career'),100);
  }
}

// ── MODE MENU — THE KEY FIX ──
// The old bug: mode menu used display:none/block via style
// which CSS rules couldn't override. Now using a class.
function toggleModeMenu(){
  modeMenuOpen?closeModeMenu():openModeMenu();
}
function openModeMenu(){
  const mm=document.getElementById('modeMenu');
  if(!mm)return;
  mm.style.display='block'; // force show
  mm.classList.add('open');
  modeMenuOpen=true;
  // Mark current mode
  mm.querySelectorAll('.mm-item[data-mode]').forEach(i=>
    i.classList.toggle('active-mode',i.dataset.mode===currentMode));
  document.getElementById('modePlusBtn')?.classList.add('menu-open');
}
function closeModeMenu(){
  const mm=document.getElementById('modeMenu');
  if(!mm)return;
  mm.style.display='none';
  mm.classList.remove('open');
  modeMenuOpen=false;
  document.getElementById('modePlusBtn')?.classList.remove('menu-open');
}

// ── SET MODEL ──
function setModel(modelId,save=true){
  if(!MODELS[modelId])return;currentModel=modelId;
  if(save)localStorage.setItem('stello_model',modelId);
  const m=MODELS[modelId];
  const mb=document.getElementById('modelBadge');if(mb)mb.textContent=m.name;
  document.querySelectorAll('.model-card').forEach(c=>c.classList.toggle('active',c.dataset.model===modelId));
}

// ── PERSONAL OS ──
function updatePOSStrip(){
  const nm=document.getElementById('posName');if(nm)nm.textContent=posContext.name||'You';
  const st=document.getElementById('posStreak');if(st)st.textContent='🔥 '+(posContext.streak||0)+' day streak';
  const md=document.getElementById('posMood');if(md)md.textContent=(posContext.mood||'😐').split(' ')[0];
}
function openPOS(){
  document.getElementById('posOverlay').classList.add('open');
  document.body.style.overflow='hidden';
  const n=document.getElementById('posNameInput');if(n)n.value=posContext.name||'';
  const p=document.getElementById('posProjectInput');if(p)p.value=posContext.project||'';
  const g=document.getElementById('posGoalsInput');if(g)g.value=posContext.goals||'';
  const sd=document.getElementById('streakDisp')||document.getElementById('streakDisplay');
  if(sd)sd.textContent=posContext.streak||0;
  document.querySelectorAll('.mood-btn').forEach(b=>b.classList.toggle('active',b.dataset.mood===posContext.mood));
}
function closePOS(){document.getElementById('posOverlay').classList.remove('open');document.body.style.overflow='';}
function closePOSOutside(e){if(e.target.id==='posOverlay')closePOS();}
function setMood(btn){document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');posContext.mood=btn.dataset.mood;}
function adjStreak(d){
  posContext.streak=Math.max(0,(posContext.streak||0)+d);
  const el=document.getElementById('streakDisp')||document.getElementById('streakDisplay');
  if(el)el.textContent=posContext.streak;
}
function savePOS(){
  posContext.name=document.getElementById('posNameInput')?.value||'Taufiq';
  posContext.project=document.getElementById('posProjectInput')?.value||'';
  posContext.goals=document.getElementById('posGoalsInput')?.value||'';
  localStorage.setItem('stello_pos',JSON.stringify(posContext));
  updatePOSStrip();closePOS();
}
async function getNudge(){
  const el=document.getElementById('nudgeResult');if(!el)return;
  el.style.display='block';el.textContent='Getting your nudge...';
  try{
    const r=await fetch('/proactive',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({context:posContext})});
    const d=await r.json();el.textContent=d.message||'Keep pushing! 💪';
  }catch(e){el.textContent="Can't reach server — but keep pushing! 💪";}
}
async function loadProactiveBanner(){
  if(!posContext.project&&!posContext.goals)return;
  try{
    const r=await fetch('/proactive',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({context:posContext})});
    const d=await r.json();
    const banner=document.getElementById('proactiveBanner');
    const text=document.getElementById('pbText');
    if(banner&&text&&d.message){text.textContent=d.message;banner.style.display='flex';}
  }catch(e){}
}
function closeBanner(){const b=document.getElementById('proactiveBanner');if(b)b.style.display='none';}

// ── SETTINGS ──
function openSettings(tab='themes'){buildSettings();document.getElementById('settingsOverlay').classList.add('open');document.body.style.overflow='hidden';switchTab(tab||'themes');}
function closeSettings(){document.getElementById('settingsOverlay').classList.remove('open');document.body.style.overflow='';}
function closeSettingsOutside(e){if(e.target.id==='settingsOverlay')closeSettings();}
function switchTab(tab){
  document.querySelectorAll('.sp-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  ['themes','models','personality'].forEach(id=>{
    const el=document.getElementById('tab-'+id);if(el)el.style.display=id===tab?'flex':'none';
  });
}
function buildSettings(){
  const grid=document.getElementById('themeGrid');
  if(grid&&grid.children.length===0){
    Object.entries(THEMES).forEach(([key,cfg])=>{
      const c=document.createElement('div');
      c.className='theme-card'+(key===currentTheme?' active':'');
      c.dataset.theme=key;
      c.innerHTML='<div class="tc-swatch" style="background:'+cfg.swatch+'"></div>'
        +'<div class="tc-name">'+cfg.label+'</div>'
        +'<div class="tc-desc">'+cfg.sub+'</div>'
        +'<div class="tc-dot"></div>';
      c.onclick=()=>setTheme(key);grid.appendChild(c);
    });
  }else if(grid)grid.querySelectorAll('.theme-card').forEach(c=>c.classList.toggle('active',c.dataset.theme===currentTheme));
  const ml=document.getElementById('modelList');
  if(ml&&ml.children.length===0){
    Object.entries(MODELS).forEach(([id,m])=>{
      const c=document.createElement('div');
      c.className='model-card'+(id===currentModel?' active':'');
      c.dataset.model=id;
      c.innerHTML='<div class="mc-dot"></div>'
        +'<div class="mc-info"><div class="mc-name">'+m.name+'</div>'
        +'<div class="mc-desc">'+m.desc+'</div>'
        +'<div class="mc-tag">'+m.tag+'</div></div>';
      c.onclick=()=>setModel(id);ml.appendChild(c);
    });
  }else if(ml)ml.querySelectorAll('.model-card').forEach(c=>c.classList.toggle('active',c.dataset.model===currentModel));
  const pe=document.getElementById('peText');if(pe&&!pe.value)pe.value=customPersonality||PRESETS.default;
}
function applyPreset(n){const pe=document.getElementById('peText');if(pe)pe.value=PRESETS[n]||PRESETS.default;}
function savePersonality(){
  const pe=document.getElementById('peText');if(!pe)return;
  customPersonality=pe.value.trim();localStorage.setItem('stello_personality',customPersonality);
  const note=document.getElementById('peSaved');if(note){note.style.display='block';setTimeout(()=>note.style.display='none',3000);}
}
function resetPersonality(){customPersonality='';localStorage.removeItem('stello_personality');const pe=document.getElementById('peText');if(pe)pe.value=PRESETS.default;}

// ── VOICE ──
function initVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){document.querySelectorAll('.voice-btn').forEach(b=>b.style.display='none');return;}
  recognition=new SR();recognition.continuous=false;recognition.interimResults=true;recognition.lang='en-US';
  recognition.onresult=e=>{
    const t=Array.from(e.results).map(r=>r[0].transcript).join('');
    const inp=chatStarted?document.getElementById('chatInput'):document.getElementById('homeInput');
    if(inp)inp.value=t;
    if(e.results[e.results.length-1].isFinal)stopListening();
  };
  recognition.onend=stopListening;recognition.onerror=stopListening;
}
function toggleVoice(){isListening?stopListening():startListening();}
function startListening(){if(!recognition)return;isListening=true;try{recognition.start();}catch(e){}document.querySelectorAll('.voice-btn').forEach(b=>b.classList.add('listening'));}
function stopListening(){isListening=false;if(recognition)try{recognition.stop();}catch(e){}document.querySelectorAll('.voice-btn').forEach(b=>b.classList.remove('listening'));}

// ── PASTE ──
function initPaste(){
  document.addEventListener('paste',e=>{
    const items=Array.from(e.clipboardData?.items||[]);
    const img=items.find(i=>i.type.startsWith('image/'));if(!img)return;
    e.preventDefault();const file=img.getAsFile();if(!file)return;
    const r=new FileReader();
    r.onload=ev=>{
      pendingImage={base64:ev.target.result.split(',')[1],mimeType:file.type,context:chatStarted?'chat':'home'};
      const ctx=chatStarted?'chat':'home';
      if(ctx==='home'){document.getElementById('homePreview').style.display='flex';document.getElementById('homeThumb').src=ev.target.result;}
      else{document.getElementById('chatPreview').style.display='flex';document.getElementById('chatThumb').src=ev.target.result;}
    };r.readAsDataURL(file);
  });
}
function handleImage(e,ctx){
  const file=e.target.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=ev=>{
    pendingImage={base64:ev.target.result.split(',')[1],mimeType:file.type,context:ctx};
    if(ctx==='home'){document.getElementById('homePreview').style.display='flex';document.getElementById('homeThumb').src=ev.target.result;}
    else{document.getElementById('chatPreview').style.display='flex';document.getElementById('chatThumb').src=ev.target.result;}
  };r.readAsDataURL(file);e.target.value='';
}
function clearImage(ctx){
  pendingImage=null;
  if(ctx==='home'){document.getElementById('homePreview').style.display='none';const t=document.getElementById('homeThumb');if(t)t.src='';}
  else{document.getElementById('chatPreview').style.display='none';const t=document.getElementById('chatThumb');if(t)t.src='';}
}

// ── IMAGE GEN ──
function setImgSrc(s){imgSrc=s;document.getElementById('srcPoll')?.classList.toggle('active',s==='pollinations');document.getElementById('srcDalle')?.classList.toggle('active',s==='dalle');}
function openImageGen(){document.getElementById('imgGenOverlay').classList.add('open');document.body.style.overflow='hidden';}
function closeImageGen(){
  document.getElementById('imgGenOverlay').classList.remove('open');document.body.style.overflow='';
  document.getElementById('imgGenResult').style.display='none';
  document.getElementById('imgGenLoading').style.display='none';
  const ip=document.getElementById('imgPrompt');if(ip)ip.value='';generatedImageUrl=null;
}
function closeImgGenOutside(e){if(e.target.id==='imgGenOverlay')closeImageGen();}
async function generateImage(promptOverride){
  const prompt=promptOverride||document.getElementById('imgPrompt')?.value?.trim();if(!prompt)return null;
  if(!promptOverride){
    document.getElementById('imgGenLoading').style.display='flex';
    document.getElementById('imgGenResult').style.display='none';
    const btn=document.getElementById('imgGenBtn');if(btn)btn.disabled=true;
  }
  try{
    const res=await fetch('/generate-image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,source:imgSrc})});
    const data=await res.json();
    if(data.url){
      generatedImageUrl=data.url;
      if(!promptOverride){
        const out=document.getElementById('imgGenOutput');if(out)out.src=data.url;
        const dl=document.getElementById('imgGenDL');if(dl)dl.href=data.url;
        document.getElementById('imgGenResult').style.display='flex';
      }
      return data.url;
    }else if(!promptOverride)alert(data.error||'Generation failed');
  }catch(e){if(!promptOverride)alert('Cannot reach server.');}
  if(!promptOverride){
    document.getElementById('imgGenLoading').style.display='none';
    const btn=document.getElementById('imgGenBtn');if(btn)btn.disabled=false;
  }
  return null;
}
function sendImgToChat(){if(!generatedImageUrl)return;closeImageGen();if(!chatStarted)openChat();addInlineImage(generatedImageUrl,'Generated image');}
function addInlineImage(url,caption){
  const area=document.getElementById('chat');if(!area)return;
  const msg=document.createElement('div');msg.className='msg bot';
  const inner=document.createElement('div');inner.className='msg-inner';
  const label=document.createElement('span');label.className='msg-label';label.textContent='STELLO 🎨';
  const bubble=document.createElement('div');bubble.className='bubble';
  const wrap=document.createElement('div');wrap.className='gen-img-wrap';
  const imgEl=document.createElement('img');imgEl.className='gen-img';imgEl.alt=caption||'Generated';
  imgEl.style.cssText='max-width:100%;border-radius:12px;border:1px solid var(--bdra);display:block;cursor:pointer;margin-bottom:8px;transition:transform .2s';
  imgEl.onclick=()=>window.open(url,'_blank');
  imgEl.onmouseover=()=>imgEl.style.transform='scale(1.02)';
  imgEl.onmouseout=()=>imgEl.style.transform='scale(1)';
  imgEl.src=url;
  imgEl.onerror=()=>{
    fetch(url).then(r=>r.blob()).then(b=>{imgEl.src=URL.createObjectURL(b);})
    .catch(()=>{wrap.innerHTML='<p style="color:var(--ac2);font-family:var(--fm);font-size:12px">🎨 <a href="'+url+'" target="_blank" style="color:var(--ac2)">Click to view →</a></p>';});
  };
  const acts=document.createElement('div');acts.style.cssText='display:flex;gap:7px';
  acts.innerHTML='<a href="'+url+'" target="_blank" class="gen-img-btn">↗ Open</a>'
    +'<a href="'+url+'" download="stello-gen.jpg" class="gen-img-btn">⬇ Download</a>';
  wrap.appendChild(imgEl);wrap.appendChild(acts);
  if(caption){const cap=document.createElement('p');cap.style.cssText='margin-top:6px;color:var(--txm);font-size:12px;font-family:var(--fm)';cap.textContent='🎨 '+caption;wrap.appendChild(cap);}
  bubble.appendChild(wrap);inner.appendChild(label);inner.appendChild(bubble);msg.appendChild(inner);
  area.appendChild(msg);area.scrollTop=area.scrollHeight;
}

// ── EASTER EGG ──
function triggerEasterEgg(){closeModeMenu();fillSend('easter egg');}

// ── EXPORT ──
function setExportFmt(f){
  exportFmt=f;
  ['txt','md','pdf'].forEach(id=>{
    const el=document.getElementById('fmt'+id.charAt(0).toUpperCase()+id.slice(1));
    if(el)el.classList.toggle('active',id===f);
  });
}
function exportChat(){document.getElementById('exportOverlay').classList.add('open');document.body.style.overflow='hidden';}
function closeExport(){document.getElementById('exportOverlay').classList.remove('open');document.body.style.overflow='';}
function closeExportOutside(e){if(e.target.id==='exportOverlay')closeExport();}
async function doExport(){
  const title=document.getElementById('exportTitle')?.value||'STELLO Chat';
  const content=chatHistory.map(m=>(m.role==='user'?'YOU':'STELLO')+': '+m.content).join('\n\n---\n\n');
  try{
    const r=await fetch('/export-doc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content,title,format:exportFmt})});
    const blob=await r.blob();const ext={txt:'txt',md:'md',pdf:'html'}[exportFmt]||'txt';
    const url=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=url;a.download=title.replace(/\s+/g,'_')+'.'+ext;a.click();
    URL.revokeObjectURL(url);closeExport();
  }catch(e){alert('Export failed — check server');}
}

// ── 3-DOT CONTEXT MENU ──
function showCtx(e,id){
  e.stopPropagation();e.preventDefault();ctxTargetId=id;
  const m=document.getElementById('ctxMenu');m.classList.add('show');
  const mw=136,mh=80;
  m.style.left=(e.clientX+mw>innerWidth?e.clientX-mw:e.clientX)+'px';
  m.style.top=(e.clientY+mh>innerHeight?e.clientY-mh:e.clientY)+'px';
}
function hideCtx(){document.getElementById('ctxMenu')?.classList.remove('show');ctxTargetId=null;}
function ctxRename(){
  const id=ctxTargetId;hideCtx();if(!id)return;
  const session=allSessions.find(s=>s.id===id);if(!session)return;
  const item=document.querySelector('.history-item[data-id="'+id+'"]');if(!item)return;
  const titleEl=item.querySelector('.hist-title');if(!titleEl)return;
  const dotsEl=item.querySelector('.hist-dots');
  const old=session.title||'Untitled';
  const inp=document.createElement('input');inp.type='text';inp.value=old;inp.className='rename-input';inp.maxLength=60;
  if(dotsEl)dotsEl.style.display='none';
  titleEl.replaceWith(inp);inp.focus();inp.select();
  let done=false;
  const commit=()=>{if(done)return;done=true;session.title=inp.value.trim()||old;saveSessions();renderHistory();};
  inp.addEventListener('blur',commit);
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();inp.blur();}
    if(e.key==='Escape'){done=true;renderHistory();}
  });
}
function ctxDelete(){
  const id=ctxTargetId;hideCtx();if(!id)return;
  const session=allSessions.find(s=>s.id===id);if(!session)return;
  pendingDeleteId=id;
  const conf=document.getElementById('delConfirm');const msg=document.getElementById('dcMsg');
  if(msg)msg.innerHTML='Delete "<b>'+escH(session.title||'this chat')+'</b>"?';
  if(conf)conf.style.display='flex';
  setTimeout(()=>{if(pendingDeleteId===id)hideDelConfirm();},7000);
}
function hideDelConfirm(){document.getElementById('delConfirm').style.display='none';pendingDeleteId=null;}
function doDelete(){
  const id=pendingDeleteId;hideDelConfirm();if(!id)return;
  allSessions=allSessions.filter(s=>s.id!==id);saveSessions();
  if(id===currentSessionId){chatHistory=[];chatStarted=false;currentSessionId=null;goHome();}
  renderHistory();
}
function escH(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ── SIDEBAR ──
function toggleSidebar(){
  const sb=document.getElementById('sidebar'),m=document.querySelector('.main'),t=document.getElementById('sidebarToggle');
  sidebarVisible=!sidebarVisible;
  sb.classList.toggle('hidden',!sidebarVisible);
  m.classList.toggle('full',!sidebarVisible);
  t.classList.toggle('collapsed',!sidebarVisible);
}

// ── SEND ──
async function send(){
  if(isLoading)return;stopListening();closeModeMenu();
  const hi=document.getElementById('homeInput'),ci=document.getElementById('chatInput');
  const text=(hi?.value||ci?.value||'').trim();
  if(!text&&!pendingImage)return;
  playSound('send');isLoading=true;setDisabled(true);
  if(hi)hi.value='';if(ci)ci.value='';
  if(!chatStarted)openChat();
  const img=pendingImage?{...pendingImage}:null;
  if(pendingImage){clearImage(pendingImage.context);pendingImage=null;}
  addMsg(text||'[image]','user',false,img?.base64,img?.mimeType);
  chatHistory.push({role:'user',content:text||'[image attached]'});
  const loadEl=addTyping();
  try{
    const body={message:text,history:chatHistory.slice(0,-1),theme:currentTheme,model:currentModel,mode:currentMode,personality:customPersonality,context:posContext};
    if(img){body.image_base64=img.base64;body.image_mime=img.mimeType;}
    const res=await fetch('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();loadEl.remove();
    const reply=data.reply||'⚠️ No response';
    addMsg(reply,'bot',data.searched||false,null,null,data.is_easter||false);
    chatHistory.push({role:'assistant',content:reply});
    playSound('recv');
    if(data.img_gen_prompt){
      const loadImg=addTypingWithLabel('🎨 Generating your image...');
      const url=await generateImage(data.img_gen_prompt);
      if(loadImg&&loadImg.remove)loadImg.remove();
      if(url)addInlineImage(url,data.img_gen_prompt.slice(0,60));
    }
    if(chatHistory.filter(m=>m.role==='user').length===1&&currentSessionId)
      updateTitle(currentSessionId,(text||'Chat').slice(0,42)+(text&&text.length>42?'…':''));
    saveSession();
  }catch(err){
    loadEl.remove();addMsg("⚠️ Can't reach Flask — is it running on port 5000?",'bot');
  }
  isLoading=false;setDisabled(false);document.getElementById('chatInput')?.focus();
}
function fillSend(t){const hi=document.getElementById('homeInput');if(hi)hi.value=t;send();}

// ── UI HELPERS ──
function openChat(){
  document.getElementById('homeScreen').style.display='none';
  document.getElementById('chatScreen').style.display='flex';
  chatStarted=true;currentSessionId=Date.now();
  allSessions.push({id:currentSessionId,title:'New Chat',history:[],timestamp:Date.now()});
  renderHistory();
}
function goHome(){
  document.getElementById('chatScreen').style.display='none';
  document.getElementById('homeScreen').style.display='';
  chatStarted=false;
  const chat=document.getElementById('chat');if(chat)chat.innerHTML='';
}
function addMsg(text,type,searched=false,imgB64=null,imgMime=null,isEaster=false){
  const area=document.getElementById('chat');if(!area)return;
  const msg=document.createElement('div');msg.className='msg '+type+(isEaster?' easter':'');
  const inner=document.createElement('div');inner.className='msg-inner';
  const label=document.createElement('span');label.className='msg-label';
  label.textContent=type==='user'?'YOU':'STELLO';
  if(isEaster){const egg=document.createElement('span');egg.className='search-badge';egg.textContent='🥚 Easter Egg';label.appendChild(egg);}
  if(searched&&type==='bot'){const b=document.createElement('span');b.className='search-badge';b.innerHTML='🔍 web';label.appendChild(b);}
  if(type==='bot'&&currentMode!=='chat'){const mt=document.createElement('span');mt.className='mode-tag';mt.textContent=MODES[currentMode]?.icon+' '+MODES[currentMode]?.name;label.appendChild(mt);}
  const bubble=document.createElement('div');bubble.className='bubble';
  if(imgB64&&type==='user'){const i=document.createElement('img');i.src='data:'+imgMime+';base64,'+imgB64;i.className='msg-img';bubble.appendChild(i);}
  if(type==='bot'){
    bubble.innerHTML+=marked.parse(text);
    bubble.querySelectorAll('pre').forEach(pre=>{
      const btn=document.createElement('button');btn.className='copy-btn';btn.textContent='Copy';
      btn.onclick=()=>navigator.clipboard.writeText(pre.querySelector('code')?.textContent||'').then(()=>{btn.textContent='✓';setTimeout(()=>btn.textContent='Copy',1500);});
      pre.appendChild(btn);
    });
  }else if(text&&text!=='[image]'){const p=document.createElement('p');p.style.margin='0';p.textContent=text;bubble.appendChild(p);}
  inner.appendChild(label);inner.appendChild(bubble);msg.appendChild(inner);
  area.appendChild(msg);area.scrollTop=area.scrollHeight;return msg;
}
function addTyping(){
  const area=document.getElementById('chat');if(!area)return{remove:()=>{}};
  const msg=document.createElement('div');msg.className='msg bot';
  const inner=document.createElement('div');inner.className='msg-inner';
  const label=document.createElement('span');label.className='msg-label';label.textContent='STELLO';
  const bubble=document.createElement('div');bubble.className='bubble';
  const dots=document.createElement('div');dots.className='dots';dots.innerHTML='<span></span><span></span><span></span>';
  bubble.appendChild(dots);inner.appendChild(label);inner.appendChild(bubble);msg.appendChild(inner);
  area.appendChild(msg);area.scrollTop=area.scrollHeight;return msg;
}
function addTypingWithLabel(text){
  const area=document.getElementById('chat');if(!area)return{remove:()=>{}};
  const msg=document.createElement('div');msg.className='msg bot';
  const inner=document.createElement('div');inner.className='msg-inner';
  const label=document.createElement('span');label.className='msg-label';label.textContent=text;
  const bubble=document.createElement('div');bubble.className='bubble';
  const dots=document.createElement('div');dots.className='dots';dots.innerHTML='<span></span><span></span><span></span>';
  bubble.appendChild(dots);inner.appendChild(label);inner.appendChild(bubble);msg.appendChild(inner);
  area.appendChild(msg);area.scrollTop=area.scrollHeight;return msg;
}
function setDisabled(d){['homeInput','chatInput'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=d;});document.querySelectorAll('.send-btn').forEach(b=>b.disabled=d);}
function newChat(){
  if(chatStarted)saveSession();
  chatHistory=[];chatStarted=false;currentSessionId=null;pendingImage=null;
  const chat=document.getElementById('chat');if(chat)chat.innerHTML='';
  ['homePreview','chatPreview'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  goHome();
}

// ── SESSIONS ──
function saveSession(){if(!currentSessionId)return;const s=allSessions.find(s=>s.id===currentSessionId);if(s)s.history=[...chatHistory];saveSessions();}
function saveSessions(){try{localStorage.setItem('stello_sessions',JSON.stringify(allSessions));}catch(e){}}
function loadSessions(){try{const r=localStorage.getItem('stello_sessions');if(r){allSessions=JSON.parse(r);renderHistory();}}catch(e){allSessions=[];}}
function updateTitle(id,title){const s=allSessions.find(s=>s.id===id);if(s){s.title=title;saveSessions();renderHistory();}}
function renderHistory(){
  const list=document.getElementById('historyList');if(!list)return;
  if(allSessions.length===0){list.innerHTML='<p class="empty-hist">No chats yet. Start one ↓</p>';return;}
  list.innerHTML='';
  [...allSessions].reverse().forEach(s=>{
    const item=document.createElement('div');item.className='history-item'+(s.id===currentSessionId?' active':'');item.dataset.id=s.id;
    const title=document.createElement('div');title.className='hist-title';title.textContent=s.title||'Untitled';title.title=s.title||'';title.onclick=()=>loadSession(s.id);
    const dots=document.createElement('div');dots.className='hist-dots';dots.innerHTML='•••';dots.onclick=e=>{e.stopPropagation();showCtx(e,s.id);};
    item.appendChild(title);item.appendChild(dots);list.appendChild(item);
  });
}
function loadSession(id){
  if(chatStarted)saveSession();const s=allSessions.find(s=>s.id===id);if(!s)return;
  chatHistory=[...s.history];currentSessionId=id;chatStarted=true;
  const chat=document.getElementById('chat');if(chat){chat.innerHTML='';s.history.forEach(m=>addMsg(m.content,m.role==='user'?'user':'bot'));}
  document.getElementById('homeScreen').style.display='none';document.getElementById('chatScreen').style.display='flex';
  renderHistory();if(chat)chat.scrollTop=chat.scrollHeight;document.getElementById('chatInput')?.focus();
}
