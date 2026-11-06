const $ = (s, root = document) => root.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const paths = {
 overview:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 strain:'<path d="m13 2-9 12h7l-1 8 10-13h-8z"/>',
 recovery:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/><path d="M3 12h5l2-4 4 8 2-4h5"/>',
 sleep:'<path d="M21 12.8A9 9 0 0 1 11.2 3 9 9 0 1 0 21 12.8z"/>',
 trends:'<path d="M3 3v18h18M6 15l5-5 4 3 6-8"/>',
 journal:'<path d="M6 3h14v18H6a3 3 0 0 1 0-6h14M6 3a3 3 0 0 0-3 3v12M8 7h8M8 11h5"/>',
 steps:'<path d="m7 3 3 5-4 5-3-1zM15 11l4 2 2 7-3 1-4-6z"/>',
 lungs:'<path d="M12 3v8m0-3-3 3M12 8l3 3M8 6C5 7 2 13 3 18c1 4 7 2 7-1V9M16 6c3 1 6 7 5 12-1 4-7 2-7-1V9"/>',
 oxygen:'<path d="M12 2c-2 4-7 9-7 13a7 7 0 0 0 14 0c0-4-5-9-7-13z"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18"/>',
 run:'<circle cx="15" cy="4" r="2"/><path d="m8 21 4-7-3-4 4-4 3 5h5M3 13l4-3 2-4M12 14l6 7"/>',
 arrow:'<path d="M4 12h16M14 6l6 6-6 6"/>',
 healthspan:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>',
 pulse:'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
 flame:'<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 bed:'<path d="M3 18V7M3 13h18v5M21 13a4 4 0 0 0-4-4h-6v4M7 11.5a1.5 1.5 0 1 0 0-.01"/>',
 gauge:'<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/>',
 more:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 coach:'<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z"/>',
 profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.5"/>',
 trophy:'<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
 others:'<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
};
const icon = name => `<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.overview}</svg>`;
const pages = [['overview','Overview'],['strain','Strain'],['recovery','Recovery'],['sleep','Sleep'],['trends','Trends'],['coach','Coach'],['healthspan','Healthspan'],['others','Others'],['journal','Journal']];
const today = () => new Date().toLocaleDateString('en-CA', { year:'numeric', month:'2-digit', day:'2-digit' });
const wasConnected=(()=>{try{return localStorage.getItem('scoop:connected')==='1';}catch{return false;}})();
const state = { page:'overview',date:today(),range:7,mode:wasConnected?'live':'demo',status:null,live:null,loading:wasConnected,error:null,request:0 };
const main = $('#main');
const number = (value, digits = 0) => value == null ? '—' : Number(value).toLocaleString(undefined,{ maximumFractionDigits:digits });
const minutes = value => value == null ? '—' : `${Math.floor(value/60)}h ${Math.round(value%60)}m`;
const HIDDEN={stress:'Stress',activity:'Workout',profile:'Profile',settings:'Settings',help:'Help'};
function settings(){try{return {distance:'km',clock:'auto',sleepGoal:480,...JSON.parse(localStorage.getItem('scoop:settings')||'{}')};}catch{return {distance:'km',clock:'auto',sleepGoal:480};}}
function saveSettings(patch){const next={...settings(),...patch};try{localStorage.setItem('scoop:settings',JSON.stringify(next));}catch{}return next;}
const hourOpt=()=>{const c=settings().clock;return c==='12'?{hour12:true}:c==='24'?{hour12:false}:{};};
const km=v=>v==null?'—':settings().distance==='mi'?`${number(v*0.621371,1)} mi`:`${number(v,1)} km`;
const time = value => value ? new Date(value).toLocaleTimeString([], {hour:'numeric',minute:'2-digit',...hourOpt()}) : '—';
const dateLabel = date => date === today() ? 'Today' : new Date(date+'T12:00:00').toLocaleDateString([], {month:'short',day:'numeric'});
function demoData(date) {
 const delta = Math.round((Date.parse(today())-Date.parse(date))/86400000);
 const n = ((delta%5)+5)%5;
 return {source:'demo',date,metrics:{steps:8432-n*431,sleepMinutes:452-n*11,sleepEfficiency:Math.round(100*(452-n*11)/(468-n*11)),restingHeartRate:54+n,hrv:72-n*3,respiratoryRate:15.2+n*.1,spo2:98,activeCalories:684-n*30}, scores:{recovery:87-n*8,strain:12.4-n*.6,sleepPerformance:92-n*3},sleep:{start:date+'T00:00:00',end:date+'T07:48:00',stages:[{type:'LIGHT',minutes:230-n*11},{type:'DEEP',minutes:99},{type:'REM',minutes:123},{type:'AWAKE',minutes:16}]},activities:[{id:'demo-sleep',name:'Sleep',durationMinutes:452-n*11,start:date+'T00:00:00',end:date+'T07:48:00',kind:'sleep',score:92-n*3},{id:'demo-run',name:'Running',durationMinutes:42,start:date+'T08:12:00',end:date+'T08:54:00',calories:384,averageHeartRate:148,score:10.2-n*.3}],warnings:[]};
}
const data = () => state.mode==='demo' ? demoData(state.date) : state.live;
const profile = () => state.status?.connected ? (state.status.profile || {}) : null;
const firstName = () => profile()?.firstName || null;
const named = text => firstName() ? `${firstName()}, ${text}` : text.charAt(0).toUpperCase()+text.slice(1);
const initials = p => (p?.name||'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase() || 'Y';
const avatarHtml = (p,cls='avatar') => p?.picture ? `<img class="${cls} photo" src="${esc(p.picture)}" alt="" referrerpolicy="no-referrer">` : `<span class="${cls}">${esc(initials(p))}</span>`;
const ago = iso => { const s=Math.max(0,(Date.now()-Date.parse(iso))/1000); return s<60?'just now':s<3600?Math.round(s/60)+'m ago':Math.round(s/3600)+'h ago'; };
const clock = iso => new Date(iso).toLocaleTimeString([],{hour:'numeric',minute:'2-digit',...hourOpt()});
const syncText = () => { const dev=state.live?.device; if(dev?.lastSyncTime) return `${esc(dev.name)} synced ${ago(dev.lastSyncTime)}`; return state.live?.syncedAt?`Refreshed ${ago(state.live.syncedAt)}`:'Google Health'; };
const deviceIcon=()=>`<svg class="device-icon" viewBox="0 0 24 32" aria-hidden="true"><path class="strap" d="M8 1h8M8 31h8"/><rect class="body" x="4" y="5" width="16" height="22" rx="6"/><rect class="fill" x="7" y="8" width="10" height="16" rx="3.5"/><circle class="pulse" cx="20" cy="5" r="3.2"/></svg>`;
const greeting = () => { const h=new Date().getHours(); return h<12?'Good morning':h<18?'Good afternoon':'Good evening'; };
const mean = list => { const v=list.filter(x=>x!=null); return v.length?v.reduce((a,b)=>a+b,0)/v.length:null; };
// [direction, isGood] relative to the 30-day baseline; null when there is nothing to compare.
function compare(value, base, higherIsGood=true, tolerance=.05) {
 if(value==null||base==null||!base) return null;
 const r=(value-base)/base; if(Math.abs(r)<tolerance) return ['flat',true];
 return [r>0?'up':'down', (r>0)===higherIsGood];
}
const pctDiff = (value, base) => value==null||!base ? null : Math.round(Math.abs(value-base)/base*100);
const partialDay = () => state.mode==='live'&&state.date===today();
const shortDate = d => new Date(d+'T12:00:00').toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});
const recoveryLabel = (v,d) => v==null?(d&&state.mode==='live'?(d.metrics.sleepMinutes==null?(partialDay()?'Waiting for last night':'No sleep recorded'):'No HRV recorded'):'Needs more history'):v>=67?'Ready to perform':v>=34?'Take it steady':'Prioritize rest';
const strainLabel = v => v==null?'No activity yet':v<10?'Light day':v<14?'Moderate exertion':v<18?'High exertion':'All out';
const pillLabel=date=>{const t=today(),y=new Date(t+'T12:00:00');y.setDate(y.getDate()-1);return date===t?'TODAY':date===y.toLocaleDateString('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'})?'YESTERDAY':new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}).toUpperCase();};
let pillSized=false;
function sizeDatePill(){
 const label=$('#date-pill-label');if(!label||pillSized)return;
 const cs=getComputedStyle(label),probe=document.createElement('span');probe.style.cssText=`position:absolute;visibility:hidden;white-space:nowrap;font:${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily};letter-spacing:${cs.letterSpacing};text-transform:uppercase`;document.body.append(probe);
 const samples=['YESTERDAY'];
 const w=Math.max(...samples.map(t=>{probe.textContent=t;return probe.getBoundingClientRect().width;}));probe.remove();
 if(w>0){document.documentElement.style.setProperty('--pill-label-w',Math.ceil(w)+'px');pillSized=true;}
}
document.fonts?.ready?.then(()=>{pillSized=false;sizeDatePill();});
addEventListener('resize',()=>{pillSized=false;sizeDatePill();});
function topbar(){
 sizeDatePill();
 const label=$('#date-pill-label');if(label){label.textContent=pillLabel(state.date);label.setAttribute('aria-label',`Open calendar. ${dateLabel(state.date)}`);}
 const next=$('#date-pill-next');if(next)next.disabled=state.date>=today();
 const chip=$('#device-chip');if(!chip)return;
 const dev=state.live?.device,demo=state.mode==='demo';
 const pct=demo?78:dev?.battery,fresh=dev?.lastSyncTime?(Date.now()-Date.parse(dev.lastSyncTime))<3*3600e3:demo;
 const level=pct==null?0:Math.max(.08,Math.min(1,pct/100));
 chip.classList.toggle('stale',!fresh);chip.classList.toggle('low',pct!=null&&pct<20);chip.hidden=!demo&&!dev&&state.mode!=='live';
 chip.style.setProperty('--level',level);
 chip.querySelector('.chip-pct').textContent=pct!=null?pct+'%':state.loading?'…':'—';
 chip.querySelector('.chip-sync').textContent=demo?'EXAMPLE':dev?.lastSyncTime?ago(dev.lastSyncTime):state.live?.syncedAt?'Scoop '+ago(state.live.syncedAt):'';
 chip.setAttribute('aria-label',demo?'Example device':dev?`${dev.name}, battery ${pct}%, synced ${ago(dev.lastSyncTime)}`:'Device details');
}
function chrome() {
 // One account card: photo, name, connection and last sync, source, and settings.
 const p=profile(),c=Boolean(p),card=$('#account-card');if(!card)return;
 card.classList.toggle('connected',c);
 const sync=state.loading?'Syncing…':state.live?.device?.lastSyncTime?`synced ${ago(state.live.device.lastSyncTime)}`:state.live?.syncedAt?`refreshed ${ago(state.live.syncedAt)}`:'connected';
 card.innerHTML=c?`<button class="account-main" data-action="go-profile" aria-label="Open profile">${avatarHtml(p)}<span class="account-text"><strong>${esc(p.name||'Your account')}</strong><small class="account-status"><i class="live-dot" aria-hidden="true"></i>Fitbit ${esc(sync)}</small><small>via Google Health</small></span></button><button class="account-gear" data-page="settings" aria-label="Settings">${icon('settings')}</button>`
  :`<button class="account-main" data-action="connect" aria-label="Connect your Fitbit"><span class="avatar">${icon('profile')}</span><span class="account-text"><strong>Connect your Fitbit</strong><small>Viewing example data</small></span></button><button class="account-gear" data-page="settings" aria-label="Settings">${icon('settings')}</button>`;
}
function navigation() {
 // Build both navs once; afterwards only move the active state so the bars never flash.
 const side=$('#navigation'),bar=$('#mobile-navigation');
 if(!side.dataset.built){side.innerHTML=pages.map(([id,label])=>`<a class="nav-link" data-nav="${id}" href="#${id}">${icon(id)}<span>${label}</span></a>`).join('');side.dataset.built='1';}
 if(!bar.dataset.built){bar.innerHTML=['overview','trends','coach','healthspan'].map(id=>`<a href="#${id}" data-nav="${id}">${icon(id)}<span>${pages.find(p=>p[0]===id)[1]}</span></a>`).join('')+`<a href="#" data-action="open-drawer">${icon('more')}<span>More</span></a>`;bar.dataset.built='1';}
 for(const a of document.querySelectorAll('[data-nav]')){const on=a.dataset.nav===state.page;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
 chrome();topbar();
 $('#breadcrumb').textContent=(pages.find(p=>p[0]===state.page)?.[1]||HIDDEN[state.page]||'').toUpperCase();
 const badge=$('#data-badge');badge.classList.toggle('live',state.mode==='live');badge.innerHTML=`<i></i> ${state.mode==='demo'?'EXAMPLE DATA':state.loading?'SYNCING…':state.live?.device?.lastSyncTime?`FITBIT SYNCED ${clock(state.live.device.lastSyncTime).toUpperCase()}`:state.live?.syncedAt?`SYNCED ${clock(state.live.syncedAt).toUpperCase()}`:'GOOGLE HEALTH'}`;badge.title=state.live?.syncedAt?`Scoop refreshed at ${clock(state.live.syncedAt)}${state.live.device?.lastSyncTime?`; your ${state.live.device.name} last synced with the Fitbit app at ${clock(state.live.device.lastSyncTime)}`:''}`:'';
}
const dateControl = () => `<div class="date-control"><button data-action="previous-day" aria-label="Previous day">‹</button><button class="date-label" data-action="calendar" aria-label="Open calendar. Selected ${esc(dateLabel(state.date))}">${icon('calendar')}${esc(dateLabel(state.date))}</button><button data-action="next-day" aria-label="Next day" ${state.date>=today()?'disabled':''}>›</button></div>`;
function heading(title,subtitle,extra='') {
 return `<div class="page-heading"><div><div class="eyebrow">${new Date(state.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}).toUpperCase()}</div><h1>${title}</h1><p class="subtext">${subtitle}</p></div>${extra}</div>`;
}
const tabs = () => `<div class="tabs" role="navigation" aria-label="Performance views">${pages.slice(0,4).map(([id,label])=>`<button data-page="${id}" class="${state.page===id?'active':''}" ${state.page===id?'aria-current="page"':''}>${label}</button>`).join('')}<i class="tab-ink" aria-hidden="true"></i></div>`;
const sectionTitle = (title,action='') => `<div class="section-title"><h2>${title}</h2>${action}</div>`;
const ring = (value,label,color,progress,suffix='') => `<div class="ring-wrap" style="--accent:${color};--progress:${Math.max(0,Math.min(progress||0,1))}"><svg class="ring" viewBox="0 0 160 160" aria-hidden="true"><circle class="track" cx="80" cy="80" r="70"/><circle class="ring-inner" cx="80" cy="80" r="60"/><circle class="progress" cx="80" cy="80" r="70"/></svg><div class="ring-text"><span class="ring-value">${value}<small>${suffix}</small></span><span class="ring-label">${label}</span></div></div>`;
function notice() {
 if (state.error) return `<div class="status-notice" role="alert">${esc(state.error)} <button data-action="refresh">Try again</button></div>`;
 if (state.loading) return state.live?'':`<div class="status-notice" role="status"><span class="throb" aria-hidden="true"></span>Loading your Google Health data…</div>`;
 if (state.mode==='live'&&state.live?.warnings?.length) return `<div class="status-notice">${state.live.warnings.length} data types could not be loaded. Some values are unavailable. <button data-action="refresh">Retry sync</button></div>`;
 return '';
}
function demoHistory(date,n=31){return Array.from({length:n},(_,i)=>{const dt=new Date(date+'T12:00:00');dt.setDate(dt.getDate()-n+1+i);const x=demoData(dt.toLocaleDateString('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'}));return {date:x.date,...x.metrics,bedtimeMinutes:1380+(i*13)%55,wakeMinutes:420+(i*7)%25,scores:{recovery:x.scores.recovery,strain:x.scores.strain,sleep:x.scores.sleepPerformance}};});}
function baselineOf(d){ if(d.baseline)return d.baseline; const prior=demoHistory(d.date).slice(0,-1),b={}; for(const k of ['steps','activeCalories','restingHeartRate','hrv','respiratoryRate','spo2','sleepMinutes'])b[k]=mean(prior.map(x=>x[k])); return b; }
const historyOf=d=>d.history&&!d.provisional?d.history:(state.mode==='demo'?demoHistory(d.date):(d.history||[]));
/** Ring: value text, label, colour, 0..1 progress, target page. Fill animates on render (see animateDials). */
const RING_PEEK={sleep:'How well last night set you up. Tap to open Sleep.',recovery:'How ready your body is today, from HRV and resting heart rate. Tap to open Recovery.',strain:'How much load your body has taken on today, 0–21. Tap to open Strain.'};
const miniRing=(value,suffix,label,color,progress,page)=>`<button class="mini-ring" data-page="${page}" data-longtip="${label[0]+label.slice(1).toLowerCase()} ${value}${value==='—'?'':suffix}: ${RING_PEEK[page]}" data-zoom style="--accent:${color};--progress:${Math.max(0,Math.min(progress||0,1))}" aria-label="${label}: ${value}${suffix}"><span class="mini-ring-dial"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="track" cx="60" cy="60" r="52"/><circle class="progress" cx="60" cy="60" r="52"/></svg><span class="mini-ring-value"><b class="count">${value}</b>${value==='—'?'':`<small>${suffix}</small>`}</span></span><span class="mini-ring-label">${label} ›</span></button>`;
function vitals(d){
 const m=d.metrics,b=baselineOf(d),checks=[];
 if(m.hrv!=null&&b.hrv)checks.push(['Heart rate variability',m.hrv>=b.hrv*.85,`${number(m.hrv)} ms · usual ${number(b.hrv)} ms`]);
 if(m.restingHeartRate!=null&&b.restingHeartRate)checks.push(['Resting heart rate',m.restingHeartRate<=b.restingHeartRate+3,`${number(m.restingHeartRate)} bpm · usual ${number(b.restingHeartRate)} bpm`]);
 if(m.respiratoryRate!=null&&b.respiratoryRate)checks.push(['Respiratory rate',Math.abs(m.respiratoryRate-b.respiratoryRate)<=1,`${number(m.respiratoryRate,1)} rpm · usual ${number(b.respiratoryRate,1)} rpm`]);
 if(m.spo2!=null)checks.push(['Blood oxygen',m.spo2>=95,`${number(m.spo2,1)}% · healthy 95–100%`]);
 return checks;
}
function bedtimePlan(d){
 const need=sleepNeed(d).total;
 const wakeMin=d.usualWakeMinutes??(state.mode==='demo'?420:null)??420,source=d.usualWakeMinutes!=null?'your usual wake time':'a 7:00 wake time until Scoop learns yours';
 const bed=((wakeMin-need-15)%1440+1440)%1440;
 const fmt=mins=>new Date(2000,0,1,Math.floor(mins/60),mins%60).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
 return {bed:fmt(bed),wake:fmt(wakeMin),need,source};
}
function strainRecoveryChart(hist){
 const days=hist.slice(-7),W=innerWidth<640?380:640,H=innerWidth<640?250:230,L=26,R=34,T=24,B=40,x=i=>L+i*(W-L-R)/Math.max(1,days.length-1),ys=v=>T+(1-v/21)*(H-T-B),yr=v=>T+(1-v/100)*(H-T-B);
 const line=(get,y)=>{let p='',open=false;days.forEach((dd,i)=>{const v=get(dd);if(v==null){open=false;return;}p+=`${open?'L':'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)} `;open=true;});return p;};
 const rc=v=>v>=67?'var(--lime)':v>=34?'var(--yellow)':'var(--red)';
 const pts=days.map((dd,i)=>[x(i),dd.scores.strain!=null?ys(dd.scores.strain):dd.scores.recovery!=null?yr(dd.scores.recovery):H-B,`${shortDate(dd.date)} · Strain ${dd.scores.strain==null?'—':number(dd.scores.strain,1)} · Recovery ${dd.scores.recovery==null?'—':dd.scores.recovery+'%'}`]);
 return `<svg class="sr-chart scrub" data-points='${esc(JSON.stringify(pts))}' viewBox="0 0 ${W} ${H}" role="img" aria-label="Strain and recovery for the last 7 days">${[0,7,14,21].map(v=>`<line class="chart-grid" x1="${L}" x2="${W-R}" y1="${ys(v)}" y2="${ys(v)}"/><text class="axis-l" x="${L-10}" y="${ys(v)+4}">${v}</text><text class="axis-r" x="${W-R+8}" y="${ys(v)+4}">${Math.round(v/21*100)}%</text>`).join('')}
 <path class="sr-line strain draw-line" pathLength="1" d="${line(dd=>dd.scores.strain,ys)}"/><path class="sr-line recovery draw-line" pathLength="1" d="${line(dd=>dd.scores.recovery,yr)}"/>
 ${days.map((dd,i)=>`${dd.scores.strain!=null?`<circle class="sr-dot" cx="${x(i)}" cy="${ys(dd.scores.strain)}" r="5" style="stroke:var(--blue)"/><text class="sr-val" x="${x(i)}" y="${ys(dd.scores.strain)+20}" style="fill:var(--blue)">${number(dd.scores.strain,1)}</text>`:''}${dd.scores.recovery!=null?`<circle class="sr-dot" cx="${x(i)}" cy="${yr(dd.scores.recovery)}" r="5" style="stroke:${rc(dd.scores.recovery)}"/><text class="sr-val" x="${x(i)}" y="${yr(dd.scores.recovery)-11}" style="fill:${rc(dd.scores.recovery)}">${dd.scores.recovery}%</text>`:''}<text class="axis-x${dd.date===state.date?' current':''}" x="${x(i)}" y="${H-12}">${new Date(dd.date+'T12:00:00').toLocaleDateString([],{weekday:'short'})} ${Number(dd.date.slice(8))}</text>`).join('')}</svg>`;
}
function keyStats(d){
 const m=d.metrics,s=d.scores,b=baselineOf(d),hist=historyOf(d),prior=hist.slice(0,-1);
 const avg=k=>mean(prior.map(h=>h.scores?.[k]));
 const rows=[['pulse','HRV',m.hrv,b.hrv,'ms',true,0],['heart','Resting heart rate',m.restingHeartRate,b.restingHeartRate,'bpm',false,0],['sleep','Sleep score',s.sleepPerformance,avg('sleep'),'%',true,0],['clock','Hours of sleep',m.sleepMinutes,b.sleepMinutes,'',true,0],['flame','Active calories',m.activeCalories,b.activeCalories,'kcal',true,0],['steps','Steps',m.steps,b.steps,'',true,0]];
 return rows.map(([ic,label,v,base,unit,hi])=>{const t=partialDay()&&['Active calories','Steps'].includes(label)?null:compare(v,base,hi);const fmt=x=>label==='Hours of sleep'?minutes(x):number(x);return `<div class="key-stat" data-tip="${esc(TIPS[label]||'')}" tabindex="0" role="button">${icon(ic)}<span class="key-name">${label}</span><span class="key-val"><strong>${fmt(v)}<small>${unit}</small></strong><small>${base==null?'':fmt(base)}</small></span>${arrowMark(t)}</div>`;}).join('');
}
const arrowMark=t=>!t?'<i class="trend none" aria-hidden="true">•</i>':t[0]==='flat'?'<i class="trend flat" aria-label="About the same as usual">•</i>':`<i class="trend ${t[1]?'good':'bad'}" aria-label="${t[0]==='up'?'Higher':'Lower'} than usual">${t[0]==='up'?'▲':'▼'}</i>`;
const TIPS={'HRV':'Heart rate variability: the variation between heartbeats while you sleep. Higher than your usual usually means you’re well recovered.','Heart rate variability':'The variation between heartbeats while you sleep. Higher than your usual usually means you’re well recovered.','Resting heart rate':'Your lowest steady heart rate, measured overnight. Lower than usual is generally a good sign.','Respiratory rate':'Breaths per minute while asleep. A jump above your usual can be an early sign of illness.','Hours of sleep':'Total time asleep, including naps that ended on this day.','Sleep score':'Scoop’s sleep score: 75% time asleep against an 8-hour goal, 25% sleep efficiency.','Active calories':'Energy burned through movement, on top of your resting energy.','Steps':'Steps counted by your Fitbit today.','Fat-burn zone':'Minutes in your moderate heart-rate zone.','Cardio + peak zones':'Minutes in your higher heart-rate zones. These count the most towards Strain.','Time asleep vs. 8h goal':'How close you came to 8 hours of sleep.','Bedtime consistency':'How steady your bedtime was over the last week. Steadier bedtimes usually mean better sleep.','Sleep efficiency':'The share of time in bed you were actually asleep.','Time awake':'Minutes awake during your main sleep.'};
function overview(d) {
 if(!d) return emptyLive();
 const m=d.metrics,s=d.scores,demo=state.mode==='demo',first=firstName(),v=vitals(d),ok=v.filter(x=>x[1]).length,plan=bedtimePlan(d);
 const title=first&&state.date===today()?`${greeting()}, ${esc(first)}`:'Your day';
 const sub=first?(state.live?.device?.lastSyncTime?`Your ${esc(state.live.device.name)} last synced ${ago(state.live.device.lastSyncTime)}.`:'Here’s how your body is doing today.'):'A little more insight. A better day ahead.';
 const rc=s.recovery==null?'var(--muted)':s.recovery>=67?'var(--lime)':s.recovery>=34?'var(--yellow)':'var(--red)';
 return heading(title,sub)+tabs()+notice()+`
 <section class="ring-row" aria-label="Today’s scores">${miniRing(number(s.sleepPerformance),'%','SLEEP','var(--purple)',(s.sleepPerformance||0)/100,'sleep')}${miniRing(number(s.recovery),'%','RECOVERY',rc,(s.recovery||0)/100,'recovery')}${miniRing(number(s.strain,1),'','STRAIN','var(--blue)',(s.strain||0)/21,'strain')}</section>
 <div class="monitor-row">
  <button class="monitor-card" data-action="vitals"><span class="monitor-title">VITALS <i>›</i></span><span class="monitor-body"><b class="monitor-badge ${v.length&&ok===v.length?'good':'warn'}">${v.length?(ok===v.length?'✓':'!'):'–'}</b><span><strong class="${v.length&&ok===v.length?'good':'warn'}">${v.length?(ok===v.length?'WITHIN RANGE':'CHECK IN'):'NO VITALS YET'}</strong><small>${v.length?`${ok}/${v.length} metrics normal`:'Appear after a night of sleep'}</small></span></span></button>
  ${stressCard()}
 </div>
 ${insightCards(d)}
 ${whatsNew()}${sectionTitle('My day')}
 <section class="panel day-panel"><div class="panel-heading"><h3>${state.date===today()?'TODAY’S':'THE DAY’S'} ACTIVITIES</h3></div>${activities(d)}<div class="day-actions"><button class="secondary-button" data-action="add-activity">＋ Add activity</button><button class="secondary-button" data-page="journal">${icon('journal')} Check-in</button></div></section>
 <section class="panel tonight"><div class="panel-heading"><h3>TONIGHT’S SLEEP</h3><button class="icon-tip" data-tip="Scoop plans for ${minutes(plan.need)} of sleep${plan.need>(settings().sleepGoal||480)?' to cover today’s strain and catch up':''}, plus 15 minutes to fall asleep, working back from ${plan.source}." aria-label="How this is worked out">${icon('info')}</button></div><div class="tonight-row"><span><small>IN BED BY</small><strong>${plan.bed}</strong></span><span class="tonight-line" aria-hidden="true"></span><span><small>WAKE</small><strong>${plan.wake}</strong></span></div><p class="info-note">Aim for ${minutes(plan.need)} asleep. Based on ${plan.source}.</p></section>
 ${sectionTitle('Key statistics','<span class="chart-legend">VS. PREVIOUS 30 DAYS</span>')}
 <section class="key-stats">${keyStats(d)}</section>
 ${sectionTitle('Your daily health')}
 <div class="content-grid"><section class="panel">${liveSleepPanel(d)}</section><section class="panel"><div class="panel-heading"><h3>HEALTH METRICS</h3>${demo?'<span class="health-tag">EXAMPLE</span>':'<span class="chart-legend">Google Health</span>'}</div>${healthRows(m)}<div class="health-row"><span class="health-label">${icon('heart')}Heart rate today</span><span class="health-value">${m.heartRateMin!=null?`${number(m.heartRateMin)}–${number(m.heartRateMax)}`:demo?'49–158':'—'}<small>bpm</small></span></div></section></div>
 ${sectionTitle('Streaks & records','<span class="chart-legend">LAST 30 DAYS</span>')}${streaksSection(d)}
 ${sectionTitle('Strain & recovery','<span class="chart-legend">LAST 7 DAYS</span>')}
 <section class="panel sr-panel">${strainRecoveryChart(historyOf(d))}<div class="chart-key"><span><i style="background:var(--blue)"></i> Strain (0–21)</span><span><i style="background:var(--lime)"></i> Recovery (%)</span></div></section>
 ${sectionTitle('30-day summary')}${thirtyDay(d)}
 <p class="info-note">${demo?'You’re exploring example data. Connect your Google Health account to see your own Fitbit measurements.':'Unavailable measurements appear as —.'}</p>`;
}
function healthRows(m) {
 return [['recovery','Heart rate variability',m.hrv,'ms'],['recovery','Resting heart rate',m.restingHeartRate,'bpm'],['lungs','Respiratory rate',m.respiratoryRate,'rpm'],['oxygen','Blood oxygen',m.spo2,'%']].map(([ic,name,val,unit])=>`<div class="health-row"><span class="health-label">${icon(ic)}${name}</span><span class="health-value">${number(val,1)}<small>${unit}</small></span></div>`).join('');
}
function liveSleepPanel(d) {
 return `<div class="panel-heading"><h3>LAST NIGHT</h3><span class="chart-legend">${state.mode==='demo'?'EXAMPLE':'Google Health'}</span></div><div class="chart-summary"><strong>${minutes(d.metrics.sleepMinutes)}</strong><span>asleep</span></div>${sleepStages(d)}<p class="info-note">${d.sleep?`${time(d.sleep.start)} – ${time(d.sleep.end)}${d.sleep.pieces>1?` · recorded in ${d.sleep.pieces} parts`:''}`:'No sleep session available for this date.'}</p>`;
}
function readLocal(key,fallback) {try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}}
function saveLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{toast('Your browser could not save this entry.');return false;}}
function activityItems(d) {return [...(d.activities||[]),...readLocal('scoop:activities:'+state.date,[])];}
function activities(d) {
 const list=activityItems(d);
 if(!list.length)return `<div class="empty-state small"><p>No activities recorded for this day.</p></div>`;
 return `<div class="activity-list">${list.map((a,i)=>{const sleep=a.kind==='sleep',val=sleep?(a.durationMinutes==null?'—':`${Math.floor(a.durationMinutes/60)}:${String(Math.round(a.durationMinutes%60)).padStart(2,'0')}`):(a.score!=null?number(a.score,1):minutes(a.durationMinutes));
  return `<button class="activity-pill-row" data-activity="${i}"><span class="score-pill ${sleep?'sleep':'workout'}">${icon(sleep?'sleep':'run')}<b>${val}</b></span><span class="activity-name">${esc(a.name.toUpperCase())}${a.local?'<small>Saved on this browser</small>':''}</span><span class="activity-times"><small>${time(a.start)}</small><small>${a.end?time(a.end):''}</small></span></button>`;}).join('')}</div>`;
}
function buildBreakdown(kind,d){
 const m=d.metrics,b=baselineOf(d),s=d.scores;
 const row=(k,v)=>`<span class="bd-row"><span>${k}</span><b>${v}</b></span>`;
 const body=kind==='recovery'?row('HRV vs. usual',m.hrv!=null&&b.hrv?`${m.hrv>=b.hrv?'+':'−'}${pctDiff(m.hrv,b.hrv)}%`:'—')+row('Resting HR vs. usual',m.restingHeartRate!=null&&b.restingHeartRate?`${m.restingHeartRate>b.restingHeartRate?'+':m.restingHeartRate<b.restingHeartRate?'−':''}${Math.abs(Math.round(m.restingHeartRate-b.restingHeartRate))} bpm`:'—')+row('Sleep score',s.sleepPerformance==null?'—':s.sleepPerformance+'%')+'<small>HRV counts most, then resting heart rate, then sleep.</small>'
  :kind==='strain'?row('Zone minutes',m.activeZoneMinutes==null?(state.mode==='demo'?'61 min':'—'):m.activeZoneMinutes+' min')+row('Steps',number(m.steps))+row('Active calories',number(m.activeCalories)+' kcal')+'<small>Strain rises fast at first, then gets harder to push as the day fills up.</small>'
  :row('Time asleep',minutes(m.sleepMinutes))+row('vs. 8h goal · 75%',m.sleepMinutes==null?'—':Math.min(100,Math.round(m.sleepMinutes/4.8))+'%')+row('Efficiency · 25%',m.sleepEfficiency==null?'—':m.sleepEfficiency+'%')+'<small>Sleep longer and with fewer wake-ups to raise this score.</small>';
 return `<span class="bd"><span class="eyebrow">HOW IT’S BUILT</span>${body}<span class="flip-hint">TAP TO FLIP BACK</span></span>`;
}
const tier=(v,good,fair)=>v==null?null:v>=good?2:v>=fair?1:0;
function recoveryInsight(m,b,latest){
 const parts=[];
 if(pctDiff(m.hrv,b.hrv)!=null)parts.push(`your HRV is ${pctDiff(m.hrv,b.hrv)}% ${m.hrv>=b.hrv?'above':'below'} your 30-day average`);
 if(m.restingHeartRate!=null&&b.restingHeartRate)parts.push(`resting heart rate is ${Math.abs(Math.round(m.restingHeartRate-b.restingHeartRate))} bpm ${m.restingHeartRate<=b.restingHeartRate?'lower':'higher'} than usual`);
 if(!parts.length)return named(m.hrv==null?`Fitbit hasn’t reported HRV for this day yet. It appears after a night of sleep with your watch on.${latest?.recovery!=null?` Your last recovery was ${latest.recovery}% on ${shortDate(latest.date)}.`:''}`:'Scoop needs at least three days of HRV history to compare against. Keep wearing your Fitbit to sleep.');
 return named(parts.join(', and your ')+'.');
}
function overviewInsight(d){
 const m=d.metrics,b=d.baseline||{};
 const bits=[];
 if(m.sleepMinutes!=null)bits.push(`You slept ${minutes(m.sleepMinutes)}`);
 if(m.steps!=null)bits.push(`${bits.length?'took':'You’ve taken'} ${number(m.steps)} steps${partialDay()?' so far today':pctDiff(m.steps,b.steps)!=null?` (${pctDiff(m.steps,b.steps)}% ${m.steps>=b.steps?'above':'below'} your average)`:''}`);
 if(m.hrv!=null)bits.push(`${bits.length?'and your':'Your'} HRV was ${number(m.hrv)} ms`);
 const last=d.latestNight&&m.sleepMinutes==null?` Your last recorded night was ${shortDate(d.latestNight.date)}: ${minutes(d.latestNight.sleepMinutes)} asleep${d.latestNight.recovery!=null?`, ${d.latestNight.recovery}% recovery`:''}.`:'';
 return (bits.length?bits.join(', ')+'.':'No measurements have synced for this day yet.')+last;
}
function detail(d,kind) {
 if(!d)return emptyLive();
 const demo=state.mode==='demo',m=d.metrics,s=d.scores,b=d.baseline||{};
 const acts=(d.activities||[]).filter(a=>a.kind!=='sleep');
 const cfg={
  strain:{title:'Strain',subtitle:'How hard your body worked today.',value:s.strain,digits:1,suffix:'',color:'var(--blue)',progress:(s.strain||0)/21,label:'DAY STRAIN',
   rows:[['heart','Fat-burn zone',demo?'42 min':m.fatBurnMinutes==null?null:m.fatBurnMinutes+' min',demo?['up',true]:null],['heart','Cardio + peak zones',demo?'19 min':m.cardioPeakMinutes==null?null:m.cardioPeakMinutes+' min',demo?['up',true]:partialDay()?null:compare(m.activeZoneMinutes,b.activeZoneMinutes)],['flame','Active calories',number(m.activeCalories),demo?['down',false]:partialDay()?null:compare(m.activeCalories,b.activeCalories)],['steps','Steps',number(m.steps),demo?['up',true]:partialDay()?null:compare(m.steps,b.steps)]],
   insight:demo?'A strain between 10 and 14 is a solid, moderate day: enough load to build fitness without digging into tomorrow’s energy.':named(`you’ve taken ${number(m.steps)} steps${m.activeZoneMinutes!=null?` and spent ${m.activeZoneMinutes} minutes in your heart-rate zones`:''}${partialDay()?' so far today':''}${!partialDay()&&pctDiff(m.steps,b.steps)!=null?`, ${pctDiff(m.steps,b.steps)}% ${m.steps>=b.steps?'more':'fewer'} steps than your 30-day average`:''}. ${strainLabel(s.strain)}${acts.length?` with ${acts.length} recorded ${acts.length===1?'workout':'workouts'}`:''}.`)},
  recovery:{title:'Recovery',subtitle:'How ready your body is for today.',value:s.recovery,digits:0,suffix:'%',color:'var(--lime)',progress:(s.recovery||0)/100,label:'RECOVERY',
   rows:[['pulse','Heart rate variability',number(m.hrv),demo?['up',true]:compare(m.hrv,b.hrv)],['heart','Resting heart rate',number(m.restingHeartRate),demo?['up',false]:compare(m.restingHeartRate,b.restingHeartRate,false,.03)],['lungs','Respiratory rate',number(m.respiratoryRate,1),demo?['flat',true]:compare(m.respiratoryRate,b.respiratoryRate,false,.05)],['sleep','Hours of sleep',minutes(m.sleepMinutes),demo?['down',false]:compare(m.sleepMinutes,b.sleepMinutes)]],
   insight:demo?'Your HRV is above your usual range while the other signals look typical, so your body is signalling it can take on more today.':recoveryInsight(m,b,d.latestNight)},
  sleep:{title:'Sleep',subtitle:'How well last night set you up.',value:s.sleepPerformance,digits:0,suffix:'%',color:'var(--purple)',progress:(s.sleepPerformance||0)/100,label:'SLEEP SCORE',
   rows:[['clock','Time asleep vs. 8h goal',demo?'81%':m.sleepGoalPercent==null?null:m.sleepGoalPercent+'%',demo?1:tier(m.sleepGoalPercent,90,75)],['calendar','Bedtime consistency',demo?'52%':m.sleepConsistency==null?null:m.sleepConsistency+'%',demo?0:tier(m.sleepConsistency,80,60)],['bed','Sleep efficiency',m.sleepEfficiency==null?null:m.sleepEfficiency+'%',tier(m.sleepEfficiency,90,80)],['sleep','Time awake',demo?'16m':m.minutesAwake==null?null:m.minutesAwake+' min',demo?2:m.minutesAwake==null?null:m.minutesAwake<=30?2:m.minutesAwake<=60?1:0]],
   insight:demo?'Solid sleep overall. Going to bed at a steadier time is the easiest way to lift this score further.':m.sleepMinutes==null?named(`${partialDay()?'last night’s sleep hasn’t synced yet. Open the Fitbit app to sync, then refresh.':'no sleep was recorded for this night.'}${d.latestNight?` Your last recorded night was ${shortDate(d.latestNight.date)}: ${minutes(d.latestNight.sleepMinutes)} asleep, sleep score ${d.latestNight.sleepScore}%.`:''}`):named(`you slept ${minutes(m.sleepMinutes)}${d.sleep?` from ${time(d.sleep.start)} to ${time(d.sleep.end)}`:''}, ${m.sleepGoalPercent}% of an 8-hour goal${m.sleepEfficiency!=null?` at ${m.sleepEfficiency}% efficiency`:''}.${m.sleepConsistency!=null&&m.sleepConsistency<70?' A steadier bedtime is the easiest win this week.':''}`)},
 }[kind];
 const arrow=t=>!t?'<i class="trend none" aria-label="No comparison">•</i>':t[0]==='flat'?'<i class="trend flat" aria-label="About the same">•</i>':`<i class="trend ${t[1]?'good':'bad'}" aria-label="${t[0]==='up'?'Higher':'Lower'} than usual">${t[0]==='up'?'▲':'▼'}</i>`;
 const level=l=>`<span class="tri" aria-label="${l==null?'No rating':['Poor','Sufficient','Optimal'][l]}">${[0,1,2].map(i=>`<b class="${l===i?['poor','fair','good'][i]:''}"></b>`).join('')}</span>`;
 const rows=cfg.rows.map(([ic,label,val,t])=>`<div class="metric-row" data-tip="${esc(TIPS[label]||'')}" tabindex="0" role="button">${icon(ic)}<span class="metric-name">${label}</span>${kind==='sleep'?level(t):''}<strong>${val==null?'—':esc(val)}</strong>${kind==='sleep'?'':arrow(t)}</div>`).join('');
 const key=kind==='sleep'?'<div class="row-key"><span><b class="poor"></b>Poor</span><span><b class="fair"></b>Sufficient</span><span><b class="good"></b>Optimal</span></div>':`<div class="row-key"><span><i class="trend good">▲</i><i class="trend bad">▼</i> ${demo||Object.values(b).some(v=>v!=null)?(partialDay()&&kind==='strain'?'Daily totals are compared once the day is over':'Today vs. your last 30 days'):'Comparisons appear after a few days of history'}</span></div>`;
 const val=cfg.value==null?'—':number(cfg.value,cfg.digits);
 return heading(cfg.title,cfg.subtitle)+tabs()+notice()+`<div class="score-layout"><section class="score-card" style="--accent:${cfg.color};--progress:${Math.max(0,Math.min(cfg.progress||0,1))}"><div class="score-head"><span>${esc(dateLabel(state.date).toUpperCase())}</span><button class="icon-button" data-action="walkthrough" data-kind="${kind}" aria-label="How ${kind} works">${icon('info')}</button></div><button class="flip" data-action="flip" aria-pressed="false" aria-label="${cfg.label}: ${val}${cfg.value==null?'':cfg.suffix}. Tap to see how it’s built"><span class="flip-inner"><span class="flip-face front"><span class="score-ring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="track" cx="100" cy="100" r="86"/><circle class="progress" cx="100" cy="100" r="86"/></svg><span class="score-text"><span class="score-brand">SCOOP</span><span class="score-value"><b class="count">${val}</b>${cfg.value==null?'':`<small>${cfg.suffix}</small>`}</span><span class="score-label">${cfg.label}</span><span class="flip-hint">TAP TO SEE HOW</span></span></span></span><span class="flip-face back">${buildBreakdown(kind,d)}</span></span></button><div class="metric-rows">${rows}${key}</div></section><aside class="insight-card"><div class="eyebrow">${demo?'EXAMPLE INSIGHT':'YOUR INSIGHT'}</div><p>${esc(cfg.insight)}</p></aside></div>${kind==='sleep'?`<div class="content-grid"><section class="panel"><div class="panel-heading"><h3>SLEEP STAGES</h3><span class="chart-legend">${demo?'Example night':d.sleep?.pieces>1?`${d.sleep.pieces} parts`:'Last night'}</span></div>${sleepDoughnut(d)}${sleepStages(d)}</section>${sleepNeedPanel(d)}</div>`:sectionTitle('Your activities')+activities(d)}<p class="info-note">${demo?'All values on this screen are example data.':'Measurements depend on your device and granted permissions. Unavailable values are shown as —.'}</p>`;
}
function sleepStages(d) {
 const stages=d.sleep?.stages||[];
 const stagesSummary=d.sleep?.summary||[];
 if(!stages.length&&!stagesSummary.length) return '<p class="info-note">Sleep stage data is unavailable for this day.</p>';
 const list=stages.length?stages:stagesSummary;
 const colors={DEEP:'#526886',REM:'#7ba1bb',LIGHT:'#b6d1df',AWAKE:'#e4ca9e'};
 const stageType=t=>{const type=String(t||'').toUpperCase();return Object.keys(colors).find(k=>type.includes(k))||'LIGHT';};
 const total=list.reduce((sum,s)=>sum+(s.minutes||0),0)||1;
 const totals={};(stagesSummary.length?stagesSummary:list).forEach(s=>{const t=stageType(s.type);totals[t]=(totals[t]||0)+(s.minutes||0);});
 return `<div class="sleep-stages" role="img" aria-label="${esc(Object.entries(totals).map(([t,v])=>`${t}: ${Math.round(v)} minutes`).join(', '))}">${list.map(s=>`<div class="sleep-stage" title="${esc(stageType(s.type))}: ${number(s.minutes)} min" style="width:${(s.minutes||0)/total*100}%;background:${colors[stageType(s.type)]}"></div>`).join('')}</div><div class="sleep-legend">${Object.entries(totals).map(([t,v])=>`<span><i class="legend-dot" style="background:${colors[t]}"></i> ${t}<b>${minutes(v)}</b></span>`).join('')}</div>`;
}
const behaviors=[['Stayed hydrated',22],['Wind-down routine',17],['Read before bed',12],['Morning sunlight',4],['Evening stretch',1],['Late workout',-2],['Caffeine after 2 PM',-5],['Screen time in bed',-9],['Alcohol',-19]];
function impactAnalysis(){
 const max=Math.max(...behaviors.map(b=>Math.abs(b[1])));
 return `<section class="panel impact"><div class="panel-heading"><h3>IMPACT ANALYSIS</h3><span class="health-tag">EXAMPLE</span></div><p class="subtext">How each logged behavior moved your recovery over the last 90 days. Log a few weeks of journal entries to see your own results.</p><div class="impact-head"><span class="hurts">▼ HURTS</span><span>% IMPACT</span><span class="helps">HELPS ▲</span></div>${behaviors.map(([name,v])=>`<div class="impact-row"><div class="impact-top"><span>${esc(name.toUpperCase())}</span><strong class="${v>2?'helps':v<-2?'hurts':''}">${v>0?'+':''}${v}%</strong></div><div class="impact-track"><i class="${v>2?'helps':v<-2?'hurts':'neutral'}" style="${v>=0?'left':'right'}:50%;width:${Math.max(Math.abs(v)/max*50,2)}%"></i><b></b></div></div>`).join('')}</section>`;
}
/** Scoop Age: an original, transparent estimate. Each input shifts years along a capped curve
 * shaped by broad public research patterns (more steps and zone minutes, lower resting heart rate,
 * 7–9 hours of regular sleep, higher VO₂ max). It is an estimate, not a medical measure. */
const lerpPts=(v,pts)=>{if(v<=pts[0][0])return pts[0][1];for(let i=1;i<pts.length;i++)if(v<=pts[i][0]){const [x0,y0]=pts[i-1],[x1,y1]=pts[i];return y0+(y1-y0)*(v-x0)/(x1-x0);}return pts.at(-1)[1];};
function ageFactors(list){
 const steps=mean(list.map(x=>x.steps)),azm=mean(list.map(x=>x.activeZoneMinutes)),rhr=mean(list.map(x=>x.restingHeartRate)),sleep=mean(list.map(x=>x.sleepMinutes)),beds=list.map(x=>x.bedtimeMinutes).filter(v=>v!=null),sd=beds.length>=3?Math.sqrt(mean(beds.map(v=>(v-mean(beds))**2))):null,vo2=[...list].reverse().find(x=>x.vo2Max!=null)?.vo2Max;
 const f=[];
 if(steps!=null)f.push({key:'steps',label:'Daily steps',value:number(steps),years:lerpPts(steps,[[2000,3],[5000,1.5],[8000,0],[10000,-1],[12500,-1.5]]),tip:'More daily movement is linked with longer, healthier lives. Benefit levels off past about 10,000 steps.'});
 if(azm!=null)f.push({key:'zones',label:'Zone minutes a week',value:number(azm*7),years:lerpPts(azm*7,[[0,2.5],[75,1],[150,0],[300,-1.5],[450,-2]]),tip:'Time in your fat-burn, cardio and peak heart-rate zones. 150+ minutes a week is the common guideline.'});
 if(rhr!=null)f.push({key:'rhr',label:'Resting heart rate',value:Math.round(rhr)+' bpm',years:lerpPts(rhr,[[48,-2],[55,-1],[62,0],[70,1.5],[80,3.5]]),tip:'A lower resting heart rate usually reflects better cardiovascular fitness.'});
 if(sleep!=null)f.push({key:'sleep',label:'Average sleep',value:minutes(sleep),years:sleep<420?lerpPts(sleep,[[300,2.5],[360,1.5],[420,0]]):lerpPts(sleep,[[420,0],[540,0],[620,1]]),tip:'Seven to nine hours is the healthy range for most adults.'});
 if(sd!=null)f.push({key:'consistency',label:'Bedtime consistency',value:`±${Math.round(sd)} min`,years:lerpPts(sd,[[20,-.5],[45,0],[90,1.5],[150,2.5]]),tip:'Going to bed at a steady time supports better sleep and recovery.'});
 if(vo2!=null)f.push({key:'vo2',label:'Cardio fitness (VO₂ max)',value:number(vo2,1),years:lerpPts(vo2,[[28,3],[35,1],[42,0],[48,-1.5],[55,-3]]),tip:'VO₂ max is one of the strongest single markers of long-term health.'});
 return f;
}
/** Exact age in years (with decimals) from the date of birth saved on this browser. */
function chronoAge(){const st=settings();if(state.mode==='demo'&&!st.dob)return 31;if(!st.dob||!/^\d{4}-\d{2}-\d{2}$/.test(st.dob))return null;const b=new Date(st.dob+'T12:00:00'),n=new Date();if(!(b<n))return null;return (n-b)/(365.2425*864e5);}
function dobSheet(){const st=settings(),max=new Date();max.setFullYear(max.getFullYear()-13);modal('Your date of birth',`<p>Scoop Age compares your habits with your exact age. Your date of birth stays on this browser and is never sent to Scoop’s server.</p><label>Date of birth<input id="dob-input" type="date" max="${max.toLocaleDateString('en-CA')}" min="1920-01-01" value="${esc(st.dob||'')}" required></label><div class="button-row"><button class="primary-button" data-action="save-dob">Save</button>${st.dob?'<button class="secondary-button" data-action="clear-dob">Remove</button>':''}</div>`);setTimeout(()=>$('#dob-input')?.focus(),60);}
function healthspan(){
 const d=data(),demo=state.mode==='demo';if(!d)return emptyLive();
 if(!demo&&!profileState.data&&!settings().birthYear)setTimeout(loadProfile);
 const hist=historyOf(d),f30=ageFactors(hist.slice(-30)),f7=ageFactors(hist.slice(-7)),adj=f30.reduce((s,x)=>s+x.years,0),adj7=f7.reduce((s,x)=>s+x.years,0);
 let seed=7;const rnd=()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;};
 const dots=Array.from({length:320},()=>{const a=rnd()*6.2832,rr=56+Math.pow(rnd(),0.7)*42,x=100+Math.cos(a)*rr,y=100+Math.sin(a)*rr;return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.5+rnd()*1.9).toFixed(1)}" opacity="${(0.3+rnd()*0.7).toFixed(2)}"/>`;}).join('');
 const age=chronoAge();
 if(age==null)return heading('Healthspan','How your habits add up over the long run.')+`<button class="score-card healthspan-card locked" data-action="dob" aria-label="Add your date of birth to see your Scoop Age"><span class="score-head"><span>SCOOP AGE</span></span><span class="orb"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="orbglow"><stop offset="55%" stop-color="#090a0c"/><stop offset="100%" stop-color="#1fe35f" stop-opacity=".4"/></radialGradient></defs><circle cx="100" cy="100" r="98" fill="url(#orbglow)"/><g class="orb-dots" fill="#5dff95">${dots}</g></svg><span class="score-text"><span class="lock-icon">${icon('profile')}</span><span class="lock-title">Add your date of birth</span><span class="orb-sub">Tap to unlock your Scoop Age</span></span></span><span class="lock-note">Scoop compares six everyday habits with your exact age. Nothing is shown until you add it.</span></button>`;
 const scoop=age+adj,pace=Math.max(-1,Math.min(3,1+(adj7-adj)/3)),enough=f30.length>=3;
 const ticks=Array.from({length:61},(_,i)=>`<i class="${i%10===0?'major':''}"></i>`).join(''),pos=(pace+1)/4*100;
 const diff=Math.abs(adj),younger=adj<=0;
 const center=!enough?`<span class="score-value">—</span><span class="score-label">SCOOP AGE</span><span class="orb-sub">Needs more data</span>`:`<span class="score-value"><b class="count">${number(scoop,1)}</b></span><span class="score-label">SCOOP AGE</span><span class="orb-sub" style="color:${younger?'var(--lime)':'var(--amber)'}">${number(diff,1)} years ${younger?'younger':'older'}</span>`;
 const story=!enough?'Scoop needs at least three of these measurements over the last 30 days. Keep wearing your Fitbit day and night.':`${named(`your habits put you ${number(diff,1)} years ${younger?'younger':'older'} than your age.`)} ${pace<0.9?'This week you’re ageing slower than usual.':pace>1.1?'This week you’re ageing faster than usual.':'This week is in line with your 30-day average.'}`;
 const rows=f30.map(x=>{const w=Math.min(100,Math.abs(x.years)/3*100);return `<div class="age-row" data-tip="${esc(x.tip)}" role="button" tabindex="0"><span class="age-name">${x.label}<small>${x.value}</small></span><div class="age-bar"><i class="mid"></i><b class="${x.years<=0?'good':'bad'}" style="${x.years<=0?'right':'left'}:50%;width:${w/2}%"></b></div><strong class="${x.years<=-0.05?'good':x.years>=0.05?'bad':''}">${x.years>0?'+':x.years<0?'−':''}${number(Math.abs(x.years),1)}y</strong></div>`;}).join('');
 return heading('Healthspan','How your habits add up over the long run.',demo?'<span class="health-tag">EXAMPLE</span>':'')+`<div class="score-layout"><section class="score-card healthspan-card"><div class="score-head"><span>LAST 30 DAYS</span><button class="icon-button" data-tip="Scoop Age starts from your actual age and adds or subtracts years for six habits, using your own last 30 days. It’s an estimate, not a medical measure. Pace of aging compares your last 7 days with your 30-day average." aria-label="How Scoop Age works">${icon('info')}</button></div><div class="orb"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="orbglow"><stop offset="55%" stop-color="#090a0c"/><stop offset="100%" stop-color="#1fe35f" stop-opacity=".55"/></radialGradient></defs><circle cx="100" cy="100" r="98" fill="url(#orbglow)"/><g class="orb-dots" fill="#5dff95">${dots}</g></svg><div class="score-text">${center}</div></div><div class="pace"><div class="pace-top"><span class="eyebrow">PACE OF AGING</span><strong>${enough?pace.toFixed(1)+'x':'—'}</strong></div><div class="pace-scale"><div class="pace-ticks">${ticks}</div>${enough?`<span class="pace-marker" style="left:${pos}%"></span>`:''}</div><div class="pace-labels"><span>−1.0x slower</span><span>1.0x</span><span>3.0x faster</span></div></div></section><aside class="insight-card"><div class="eyebrow">${demo?'EXAMPLE INSIGHT':'YOUR INSIGHT'}</div><p>${esc(story)}<br><button class="link" data-action="dob">Change date of birth</button></p></aside></div><section class="panel"><div class="panel-heading"><h3>WHAT’S SHAPING IT</h3><span class="chart-legend">YEARS</span></div>${rows||'<p class="info-note">No measurements yet.</p>'}</section><p class="info-note">Scoop Age is an estimate based on your last 30 days. It isn’t medical advice.</p>`;
}
async function loadOthers(){
 const key=state.date;if(state.mode!=='live'||state.othersLoading===key)return;
 state.othersLoading=key;state.othersError=null;
 try{const o=await request('/api/others?date='+encodeURIComponent(key));if(state.date===key)state.others=o;}catch(e){if(state.date===key)state.othersError=e.message;}
 finally{state.othersLoading=null;if(state.page==='others')render();}
}
const notShared=['Mood logs','Symptom logs','Mindfulness sessions','Cycle tracking','Food and nutrition logs'];
function others(){
 const title=firstName()?`${esc(firstName())}’s other metrics`:'Other metrics',sub='Everything else your Fitbit records, grouped by category.';
 if(state.mode!=='live')return heading(title,sub)+`<div class="empty-state"><h2>Connect your Fitbit to see more.</h2><p>Floors, elevation, heart-rate zones, VO₂ max, weight, skin temperature, hydration and more appear here once you connect.</p><button class="primary-button" data-action="connect">Connect your Fitbit</button></div>`;
 const o=state.others?.date===state.date?state.others:null;
 if(!o){
  if(state.othersError)return heading(title,sub)+`<div class="status-notice" role="alert">${esc(state.othersError)} <button data-action="reload-others">Try again</button></div>`;
  setTimeout(loadOthers);return heading(title,sub)+'<div class="status-notice" role="status">Loading other metrics from Google Health…</div>';
 }
 const fmt=v=>typeof v==='number'?number(v,v%1?1:0):esc(v);
 const cards=o.categories.filter(c=>c.id!=='rhythm'||o.rhythmShared!==false).map(c=>`<section class="panel other-cat"><div class="panel-heading"><h3>${esc(c.title.toUpperCase())}</h3><span class="chart-legend">${c.items.length?c.items.length+(c.items.length===1?' metric':' metrics'):'NO DATA'}</span></div>${c.items.length?c.items.map(i=>`<div class="health-row"><span class="health-label other-label">${esc(i.label)}${i.note?`<small>${esc(i.note)}</small>`:''}</span><span class="health-value">${fmt(i.value)}<small>${esc(i.unit)}</small></span></div>`).join(''):'<p class="info-note">Nothing recorded for this day.</p>'}</section>`).join('');
 return heading(title,sub)+`${o.rhythmShared===false?`<div class="status-notice">ECG readings and irregular-rhythm alerts need extra permission. <button data-action="google-signin">Reconnect to share</button></div>`:''}<div class="others-grid">${cards}<section class="panel other-cat muted-cat"><div class="panel-heading"><h3>NOT SHARED WITH SCOOP</h3></div><p class="subtext">These need extra Google Health permissions that Scoop doesn’t ask for.</p><ul class="chip-list">${notShared.map(x=>`<li>${x}</li>`).join('')}</ul></section></div>${o.failed?.length?`<p class="info-note">${o.failed.length} data types couldn’t be loaded, usually because your account or device doesn’t record them.</p>`:''}`;
}
// ---------- Stress monitor ----------
const stressCache=new Map();
function demoStress(date){
 const base=new Date(date+'T00:00:00'),windows=[];let seed=11;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};
 const now=date===today()?new Date():new Date(base.getTime()+86400000);
 for(let t=base.getTime();t<now.getTime()-300000;t+=300000){const h=new Date(t).getHours()+new Date(t).getMinutes()/60;const context=h<7?'sleep':h>=8.2&&h<8.9?'exercise':'awake';const v=context==='sleep'?.2+rnd()*.4:context==='exercise'?2.4+rnd()*.5:Math.max(0,Math.min(3,.9+Math.sin(h/2.3)*.6+rnd()*.9-(h>21?.5:0)));windows.push({start:new Date(t).toISOString(),hr:Math.round(54+v*14),stress:Math.round(v*10)/10,context});}
 const awake=windows.filter(w=>w.context==='awake'),lvl=v=>v<1?'low':v<2?'medium':'high',last=awake.at(-1);
 return {date,demo:true,resting:54,windowMinutes:5,windows,current:last?{value:last.stress,level:lvl(last.stress),at:new Date(Date.parse(last.start)+300000).toISOString()}:null,latestSampleAt:windows.at(-1)?.start,summary:{lowMinutes:awake.filter(w=>w.stress<1).length*5,mediumMinutes:awake.filter(w=>w.stress>=1&&w.stress<2).length*5,highMinutes:awake.filter(w=>w.stress>=2).length*5,longestHigh:null},sleep:[{start:base.toISOString(),end:new Date(base.getTime()+7*3600e3).toISOString()}],exercise:[{start:new Date(base.getTime()+8.2*3600e3).toISOString(),end:new Date(base.getTime()+8.9*3600e3).toISOString()}]};
}
function stressData(){ if(state.mode==='demo')return demoStress(state.date); const c=stressCache.get(state.date); return c?c.data:null; }
async function loadStress(force=false){
 if(state.mode!=='live')return;const date=state.date,c=stressCache.get(date);
 if(state.stressLoading===date||(!force&&c&&Date.now()-c.at<5*60000))return;
 state.stressLoading=date;state.stressError=null;
 try{const d=await request('/api/stress?date='+encodeURIComponent(date)+'&tz='+tzParam());stressCache.set(date,{data:d,at:Date.now()});}catch(e){state.stressErrorDate=date;if(state.date===date)state.stressError=e.message;}
 finally{state.stressLoading=null;if(state.date===date&&['overview','stress'].includes(state.page))render();}
}
const stressColor=l=>l==='low'?'var(--blue)':l==='medium'?'var(--lime)':l==='high'?'var(--amber)':'var(--muted)';
function stressCard(){
 const st=stressData();if(state.mode==='live'&&!st&&state.stressErrorDate!==state.date)setTimeout(()=>loadStress());
 const cur=st?.current;
 return `<button class="monitor-card" data-page="stress" data-zoom><span class="monitor-title">STRESS <i>›</i></span><span class="monitor-body"><b class="monitor-badge" style="color:${stressColor(cur?.level)};background:color-mix(in srgb,${stressColor(cur?.level)} 18%,transparent)">${cur?number(cur.value,1):'–'}</b><span><strong style="color:${stressColor(cur?.level)}">${cur?cur.level.toUpperCase():state.stressLoading?'LOADING…':st?'NO READING':'—'}</strong><small>${cur?`As of ${clock(cur.at)}`:state.stressErrorDate===state.date?'Couldn’t load':st?'No awake heart rate yet':'Checking heart rate…'}</small></span></span></button>`;
}
function stressGauge(v,level){
 const a0=Math.PI*.85,a1=Math.PI*2.15,cx=150,cy=150,r=118,pt=a=>[cx+r*Math.cos(a),cy+r*Math.sin(a)],[x0,y0]=pt(a0),[x1,y1]=pt(a1),ang=a0+(a1-a0)*Math.min(1,Math.max(0,(v??0)/3)),[nx,ny]=pt(ang);
 return `<svg class="stress-gauge" viewBox="0 0 300 250" role="img" aria-label="Stress ${v==null?'unavailable':number(v,1)+' of 3, '+level}"><defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0" stop-color="#1d9bff"/><stop offset=".45" stop-color="#1fe35f"/><stop offset=".75" stop-color="#ffd23e"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient></defs><path pathLength="1" d="M${x0} ${y0}A${r} ${r} 0 1 1 ${x1} ${y1}" fill="none" stroke="url(#sg)" stroke-width="14" stroke-linecap="round"/>${v==null?'':`<circle class="gauge-knob" cx="${nx}" cy="${ny}" r="11" fill="#fff" stroke="#090a0c" stroke-width="4"/>`}<text x="150" y="150" class="gauge-val count">${v==null?'—':number(v,1)}</text><text x="150" y="182" class="gauge-level" style="fill:${stressColor(level)}">${(level||'').toUpperCase()}</text><text x="${x0-4}" y="${y0+30}" class="gauge-end">0.0</text><text x="${x1+4}" y="${y1+30}" class="gauge-end">3.0</text></svg>`;
}
function stressChart(st){
 const W=innerWidth<640?380:700,H=220,L=30,R=10,T=26,B=30,day0=Date.parse(st.windows[0]?.start||st.date+'T00:00:00'),day1=Math.max(Date.parse(st.windows.at(-1)?.start||day0)+300000,day0+3600000),x=t=>L+(t-day0)/(day1-day0)*(W-L-R),y=v=>T+(1-v/3)*(H-T-B);
 const band=(list,cls)=>list.map(b=>{const a=Math.max(day0,Date.parse(b.start)),e=Math.min(day1,Date.parse(b.end));return e>a?`<rect class="band ${cls}" x="${x(a)}" y="${T}" width="${x(e)-x(a)}" height="${H-T-B}"/>`:'';}).join('');
 let path='',prev=null;for(const w of st.windows){if(w.stress==null)continue;const t=Date.parse(w.start);path+=`${prev&&t-prev<=600000?'L':'M'}${x(t).toFixed(1)} ${y(w.stress).toFixed(1)} `;prev=t;}
 const ticks=[0,.25,.5,.75,1].map(f=>day0+f*(day1-day0));
 const pts=st.windows.filter(w=>w.stress!=null).map(w=>[+x(Date.parse(w.start)).toFixed(1),+y(w.stress).toFixed(1),`${time(w.start)} · stress ${number(w.stress,1)} · ${w.hr} bpm${w.context!=='awake'?' · '+w.context:''}`]);
 return `<svg class="stress-chart scrub" data-points='${esc(JSON.stringify(pts))}' viewBox="0 0 ${W} ${H}" role="img" aria-label="Stress through the day"><defs><linearGradient id="sl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1d9bff"/><stop offset=".45" stop-color="#1fe35f"/><stop offset=".8" stop-color="#ffd23e"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient></defs>${band(st.sleep,'sleep')}${band(st.exercise,'exercise')}${[0,1,2,3].map(v=>`<line class="chart-grid" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="axis-l" x="${L-6}" y="${y(v)+4}">${v}.0</text>`).join('')}<path class="draw-line" pathLength="1" d="${path}" fill="none" stroke="url(#sl)" stroke-width="2" stroke-linejoin="round"/>${ticks.map((t,i)=>`<text class="axis-x" x="${x(t)}" y="${H-8}" text-anchor="${i===0?'start':i===4?'end':'middle'}">${new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</text>`).join('')}${st.sleep.length?`<text class="band-label" x="${x(Math.max(day0,Date.parse(st.sleep[0].start)))+6}" y="${T-8}">☾ sleep</text>`:''}${st.exercise.length?`<text class="band-label" x="${x(Math.max(day0,Date.parse(st.exercise[0].start)))+6}" y="${T-8}">workout</text>`:''}</svg>`;
}
function stressPage(){
 const st=stressData(),title='Stress monitor',sub=firstName()?`How your body is handling today, ${esc(firstName())}.`:'How your body is handling today.';
 if(!st){if(state.mode==='live'&&state.stressErrorDate!==state.date)setTimeout(()=>loadStress());return heading(title,sub)+(state.stressErrorDate===state.date?`<div class="status-notice" role="alert">${esc(state.stressError||'Couldn’t load heart rate.')} <button data-action="reload-stress">Try again</button></div>`:'<div class="status-notice" role="status"><span class="throb" aria-hidden="true"></span>Loading heart rate from Google Health…</div>');}
 const cur=st.current,sm=st.summary,total=sm.lowMinutes+sm.mediumMinutes+sm.highMinutes||1,top=[['low',sm.lowMinutes],['medium',sm.mediumMinutes],['high',sm.highMinutes]].sort((a,b)=>b[1]-a[1])[0];
 const lag=st.latestSampleAt?Math.round((Date.now()-Date.parse(st.latestSampleAt))/60000):null;
 const story=!cur?'No awake heart-rate readings yet for this day. Readings appear after your Fitbit syncs.':`${named(`most of your awake time was in the ${top[0]} stress zone.`)}${sm.longestHigh?` Your longest high-stress stretch started at ${clock(sm.longestHigh.start)} and lasted ${sm.longestHigh.minutes} minutes.`:' You had no sustained high-stress stretches.'}${cur.context==='exercise'?' Your heart rate is still up after exercise, which is normal.':''}`;
 return heading(title,sub)+`<div class="score-layout"><section class="score-card stress-card"><div class="score-head"><span>${esc(dateLabel(state.date).toUpperCase())}</span><button class="icon-button" data-tip="Scoop’s stress estimate (0–3) compares each 5-minute heart-rate average with your resting heart rate, while you’re awake and not exercising. It’s an estimate, not a medical measure. Data arrives when your Fitbit syncs, so it can lag behind real time." aria-label="How stress is estimated">${icon('info')}</button></div>${stressGauge(cur?.value,cur?.level)}<p class="stress-updated">${cur?`Last reading ${clock(cur.at)}`:'No reading yet'}${lag!=null&&state.date===today()?` · ${lag<10?'up to date':`${lag<120?lag+' min':Math.round(lag/60)+' h'} behind`}`:''}</p><div class="zone-bars">${[['low','Low'],['medium','Medium'],['high','High']].map(([k,l])=>`<div class="zone"><span><i style="background:${stressColor(k)}"></i>${l}</span><div class="zone-track"><b style="width:${Math.round(sm[k+'Minutes']/total*100)}%;background:${stressColor(k)}"></b></div><strong>${minutes(sm[k+'Minutes'])}</strong></div>`).join('')}</div></section><aside class="insight-card"><div class="eyebrow">${st.demo?'EXAMPLE INSIGHT':'YOUR DAY SO FAR'}</div><p>${esc(story)}</p>${st.resting?`<p class="note">Compared with your resting heart rate of ${st.resting} bpm.${st.hrvLatest!=null?` Latest HRV reading: ${st.hrvLatest} ms.`:''}</p>`:''}</aside></div><section class="panel"><div class="panel-heading"><h3>STRESS THROUGH THE DAY</h3><span class="chart-legend">5-MINUTE AVERAGES</span></div>${st.windows.length?stressChart(st):'<p class="info-note">No heart-rate readings for this day yet.</p>'}<div class="chart-key"><span><i class="band-key sleep"></i> Sleep</span><span><i class="band-key exercise"></i> Workout</span></div></section><p class="info-note">${st.demo?'Example data. Connect your Fitbit to see your own stress through the day.':'Heart rate comes from Google Health in 5-minute averages and appears after your Fitbit syncs.'}</p>`;
}
// ===================== Phase 4: overview extras =====================
const WHATS_NEW='2026-11-coach';
function whatsNew(){try{if(localStorage.getItem('scoop:seen')===WHATS_NEW)return '';}catch{}return `<section class="whats-new"><div><span class="eyebrow">NEW IN SCOOP</span><h3>Coach, workout deep dives, and richer trends</h3><p>Plan tonight’s bedtime, get a strain target for today, and tap any workout to see its heart-rate curve.</p></div><div class="button-row"><button class="primary-button" data-page="coach">Open Coach</button><button class="secondary-button" data-action="dismiss-new">Got it</button></div></section>`;}
function strainTarget(rec){return rec==null?[10,14]:rec>=67?[14,18]:rec>=34?[10,14]:[4,10];}
function insightCards(d){
 const m=d.metrics,s=d.scores,b=baselineOf(d),demo=state.mode==='demo',need=sleepNeed(d),tgt=strainTarget(s.recovery);
 const recTitle=demo?'You’re ready to make the most of today.':named(s.recovery==null?(m.sleepMinutes==null?(partialDay()?'last night’s sleep hasn’t synced yet.':'no sleep was recorded for this night.'):'your Fitbit didn’t record HRV last night.'):s.recovery>=67?'you’re well recovered today.':s.recovery>=34?'take it steady today.':'your body is asking for rest today.');
 const cards=[
  ['recovery',recTitle,demo?'Example insight: your recovery is high.':overviewInsight(d),demo?'Your HRV is above your usual range and your resting heart rate is steady, so today is a good day to take on a little more.':recoveryInsight(m,b,d.latestNight),'See recovery','data-page="recovery" data-zoom'],
  ['sleep',m.sleepMinutes==null?'No sleep recorded for this night.':`${minutes(m.sleepMinutes)} of sleep, ${Math.round(m.sleepMinutes/need.total*100)}% of what you need tonight.`,`Tonight you need about ${minutes(need.total)}.`,need.rows.map(([k,v])=>`${k} ${v}`).join(' · ')+'.','Plan tonight','data-page="coach"'],
  ['strain',s.strain==null?'No activity recorded yet.':`Strain ${number(s.strain,1)}: ${s.strain<tgt[0]?`${number(tgt[0]-s.strain,1)} to go to reach today’s target.`:s.strain>tgt[1]?'above today’s target.':'in today’s target zone.'}`,`Today’s target is ${tgt[0]}–${tgt[1]}, based on your recovery.`,`${number(m.steps)} steps and ${m.activeZoneMinutes??0} heart-rate zone minutes${partialDay()?' so far today':''}.`,'Strain coach','data-page="coach"'],
 ];
 return `<div class="insight-stack">${cards.map(([ic,t,sub,more,label,attr])=>`<details class="insight-x"><summary><span class="insight-icon">${icon(ic)}</span><span class="insight-text"><strong>${esc(t)}</strong><small>${esc(sub)}</small></span><i class="chev" aria-hidden="true">›</i></summary><div class="insight-body"><p>${esc(more)}</p><button class="secondary-button" ${attr}>${label} ›</button></div></details>`).join('')}</div>`;
}
function streaksSection(d){
 const h=historyOf(d).filter(x=>x.date<=d.date);
 const streak=(label,pred,color)=>{let cur=0,best=0;for(const x of h){if(pred(x)){cur++;best=Math.max(best,cur);}else cur=0;}
  if(!cur&&partialDay()){let c=0;for(let i=h.length-2;i>=0&&pred(h[i]);i--)c++;cur=c;}
  return `<div class="streak" style="--c:${color}"><span class="streak-flame">${icon('trophy')}</span><b class="count">${cur}</b><small>${cur===1?'day':'days'} in a row</small><span class="streak-label">${label}</span><em>Best ${best}</em></div>`;};
 const pick=(arr,f,better)=>arr.length?arr.reduce((a,b)=>better(f(b),f(a))?b:a):null;
 const rec=h.filter(x=>x.scores?.recovery!=null),sl=h.filter(x=>x.sleepMinutes!=null),stp=h.filter(x=>x.steps!=null);
 const recs=[['Best recovery',pick(rec,x=>x.scores.recovery,(a,b)=>a>b),x=>x.scores.recovery+'%'],['Lowest recovery',pick(rec,x=>x.scores.recovery,(a,b)=>a<b),x=>x.scores.recovery+'%'],['Longest sleep',pick(sl,x=>x.sleepMinutes,(a,b)=>a>b),x=>minutes(x.sleepMinutes)],['Most steps',pick(stp,x=>x.steps,(a,b)=>a>b),x=>number(x.steps)]];
 return `<div class="streak-grid">${streak('Green recovery',x=>x.scores?.recovery>=67,'var(--lime)')}${streak('10+ strain',x=>x.scores?.strain>=10,'var(--blue)')}${streak('85%+ sleep score',x=>x.scores?.sleep>=85,'var(--purple)')}</div><div class="records">${recs.map(([l,x,f])=>`<button class="record" ${x?`data-tip="${esc(`${shortDate(x.date)} · Recovery ${x.scores?.recovery!=null?x.scores.recovery+'%':'—'} · Strain ${x.scores?.strain!=null?number(x.scores.strain,1):'—'} · Sleep ${minutes(x.sleepMinutes)} · ${number(x.steps)} steps`)}"`:'disabled'}><span>${l}</span><strong class="count">${x?f(x):'—'}</strong><small>${x?shortDate(x.date):'No data yet'}</small></button>`).join('')}</div>`;
}
function thirtyDay(d){
 const h=historyOf(d),demo=state.mode==='demo',su=d.activitySummary||(demo?{workouts:14,minutes:612,byType:[{name:'Running',count:6,minutes:252},{name:'Strength training',count:5,minutes:240},{name:'Walking',count:3,minutes:120}]}:{workouts:0,minutes:0,byType:[]});
 const last7=mean(h.slice(-7).map(x=>x.scores?.strain)),prev=mean(h.slice(0,-7).map(x=>x.scores?.strain));
 const rhr=h.map(x=>x.restingHeartRate).filter(v=>v!=null),hrv=h.map(x=>x.hrv).filter(v=>v!=null),vo2=[...h].reverse().find(x=>x.vo2Max!=null)?.vo2Max,top=Math.max(1,...su.byType.map(t=>t.count));
 return `<div class="content-grid"><section class="panel"><div class="panel-heading"><h3>WORKOUTS</h3><span class="chart-legend">${su.workouts} · ${minutes(su.minutes)}</span></div>${su.byType.length?su.byType.slice(0,5).map(t=>`<div class="type-row"><span>${esc(t.name)}</span><div class="type-bar"><b style="width:${t.count/top*100}%"></b></div><strong>${t.count}×</strong></div>`).join(''):'<p class="info-note">No workouts recorded in the last 30 days.</p>'}<div class="summary-line"><span>Average strain, last 7 days</span><strong>${number(last7,1)}</strong>${last7!=null&&prev!=null?arrowMark(compare(last7,prev,true)):''}</div></section><section class="panel"><div class="panel-heading"><h3>HEART</h3><span class="chart-legend">30 DAYS</span></div><div class="health-row"><span class="health-label">${icon('heart')}Average resting HR</span><span class="health-value">${number(mean(rhr))}<small>bpm</small></span></div><div class="health-row"><span class="health-label">${icon('heart')}Lowest resting HR</span><span class="health-value">${rhr.length?Math.min(...rhr):'—'}<small>bpm</small></span></div><div class="health-row"><span class="health-label">${icon('pulse')}Average HRV</span><span class="health-value">${number(mean(hrv))}<small>ms</small></span></div><div class="health-row"><span class="health-label">${icon('run')}Cardio fitness (VO₂ max)</span><span class="health-value">${vo2!=null?number(vo2,1):'—'}<small>${vo2!=null?'ml/kg/min':''}</small></span></div></section></div>`;
}

// ===================== Phase 5: score detail =====================
function sleepNeed(d){
 const base=settings().sleepGoal||480,m=d.metrics,strainAdd=Math.round((d.scores.strain||0)/21*45);
 const last=m.sleepMinutes,debt=last!=null&&last<base?Math.min(45,Math.round((base-last)/4)):0;
 const naps=(d.activities||[]).filter(a=>a.name==='Nap').reduce((n,a)=>n+(a.durationMinutes||0),0);
 return {total:Math.max(240,base+strainAdd+debt-naps),base,strainAdd,debt,naps,rows:[['Baseline',minutes(base)],['Today’s strain',`+${strainAdd} min`],['Catching up',`+${debt} min`],...(naps?[['Naps',`−${naps} min`]]:[])]};
}
function sleepNeedPanel(d){const n=sleepNeed(d);return `<section class="panel need-panel"><div class="panel-heading"><h3>TONIGHT’S SLEEP NEED</h3><span class="chart-legend">${minutes(n.total)}</span></div>${n.rows.map(([k,v])=>`<div class="need-row"><span>${k}</span><strong>${v}</strong></div>`).join('')}<div class="need-row total"><span>You need</span><strong>${minutes(n.total)}</strong></div><button class="secondary-button" data-page="coach">Plan bedtime ›</button></section>`;}
function sleepDoughnut(d){
 const list=d.sleep?.summary?.length?d.sleep.summary:(d.sleep?.stages||[]);if(!list.length)return '';
 const colors={AWAKE:'#e8c98f',LIGHT:'#9cc3e6',REM:'#8db4ff',DEEP:'#4a68b0'},typeOf=t=>{t=String(t||'').toUpperCase();return t.includes('AWAKE')||t.includes('RESTLESS')?'AWAKE':t.includes('DEEP')?'DEEP':t.includes('REM')?'REM':'LIGHT';};
 const tot={};list.forEach(x=>{const k=typeOf(x.type);tot[k]=(tot[k]||0)+(x.minutes||0);});
 const all=Object.values(tot).reduce((a,b)=>a+b,0)||1,C=2*Math.PI*52;let off=0;
 const segs=['DEEP','REM','LIGHT','AWAKE'].filter(k=>tot[k]).map(k=>{const len=tot[k]/all*C,seg=`<circle cx="70" cy="70" r="52" fill="none" stroke="${colors[k]}" stroke-width="16" stroke-dasharray="${Math.max(0,len-2)} ${C-len+2}" stroke-dashoffset="${-off}"/>`;off+=len;return seg;}).join('');
 const inBed=d.sleep?.start&&d.sleep?.end?(Date.parse(d.sleep.end)-Date.parse(d.sleep.start))/60000:all;
 return `<div class="doughnut-wrap"><svg class="doughnut" viewBox="0 0 140 140" role="img" aria-label="Sleep stages"><g transform="rotate(-90 70 70)">${segs}</g><text x="70" y="68" class="d-val">${minutes(inBed)}</text><text x="70" y="86" class="d-lbl">IN BED</text></svg><ul class="d-legend">${['AWAKE','LIGHT','REM','DEEP'].filter(k=>tot[k]).map(k=>`<li><i style="background:${colors[k]}"></i>${k==='REM'?'REM':k[0]+k.slice(1).toLowerCase()}<b>${minutes(tot[k])}</b><small>${Math.round(tot[k]/all*100)}%</small></li>`).join('')}</ul></div>`;
}
const WALK={recovery:['Recovery shows how ready your body is to take on strain today. Green (67–99%) means ready to push, yellow (34–66%) means maintain, and red (1–33%) means prioritise rest.','Scoop compares last night’s HRV and resting heart rate with your own 30-day average, then nudges the result by your sleep score. Here’s yours:'],strain:['Strain is how much load your heart and body took on today, on a 0–21 scale. It climbs quickly at first and gets harder to push the higher it goes.','Scoop builds it from heart-rate zone minutes, steps, and active calories. Here’s today:'],sleep:['Your sleep score shows how well last night set you up, from 0–100%.','75% comes from time asleep against your sleep goal, 25% from sleep efficiency (the share of time in bed you were actually asleep). Here’s last night:']};
function walkthrough(kind,step=0){
 const d=data(),k=WALK[kind]?kind:'recovery',accent=k==='recovery'?'var(--lime)':k==='strain'?'var(--blue)':'var(--purple)';
 const body=step===0?`<p class="walk-lead">${WALK[k][0]}</p>`:`<p>${WALK[k][1]}</p>${d?`<div class="walk-bd" style="--accent:${accent}">${buildBreakdown(k,d)}</div>`:''}`;
 modal(`How ${k} works`,`<div class="walk ${step?'walk-next':''}">${body}</div><div class="walk-foot"><span class="walk-dots"><i class="${step===0?'on':''}"></i><i class="${step===1?'on':''}"></i></span><span class="button-row">${step===0?`<button class="primary-button" data-action="walk-next" data-kind="${k}">Next ›</button>`:`<button class="secondary-button" data-action="walk-back" data-kind="${k}">‹ Back</button><button class="primary-button" data-action="close-modal">Done</button>`}</span></div>`);
}
const activityCache=new Map();
const humanZone=t=>({LIGHT:'Light',MODERATE:'Moderate',VIGOROUS:'Vigorous',PEAK:'Peak',FAT_BURN:'Fat burn',CARDIO:'Cardio'}[t]||String(t||'').toLowerCase().replace(/_/g,' '));
function demoActivityHeart(a){const s=Date.parse(a.start),e=Date.parse(a.end),pts=[];for(let t=s;t<e;t+=60000){const p=(t-s)/(e-s);const v=Math.round(96+58*Math.sin(Math.PI*Math.min(1,p*1.15))+7*Math.sin(p*31));pts.push({t:new Date(t).toISOString(),bpm:v,max:v+4});}return {points:pts,zones:[{type:'LIGHT',min:30,max:116},{type:'MODERATE',min:117,max:139},{type:'VIGOROUS',min:140,max:169},{type:'PEAK',min:170,max:220}]};}
async function loadActivity(a){if(activityCache.has(a.id)||state.activityLoading===a.id)return;state.activityLoading=a.id;try{activityCache.set(a.id,await request(`/api/activity?start=${encodeURIComponent(a.start)}&end=${encodeURIComponent(a.end)}&date=${encodeURIComponent(state.date)}`));}catch(e){activityCache.set(a.id,{error:e.message});}finally{state.activityLoading=null;if(state.page==='activity')render();}}
function activityPage(){
 const a=state.activity;if(!a)return heading('Workout','Pick a workout from My day.','')+`<div class="empty-state"><button class="primary-button" data-page="overview">Back to overview</button></div>`;
 const demo=state.mode==='demo',hr=demo?demoActivityHeart(a):activityCache.get(a.id);if(!demo&&!hr)setTimeout(()=>loadActivity(a));
 const zc={LIGHT:'#3a8ee6',MODERATE:'#1fe35f',VIGOROUS:'#ffd23e',PEAK:'#ff6b4a'};
 let chart='<div class="status-notice"><span class="throb" aria-hidden="true"></span>Loading heart rate…</div>',zoneRows='',peak=null,avg=a.averageHeartRate,zoneTotal=a.zoneMinutes;
 if(hr?.error)chart=`<div class="status-notice">${esc(hr.error)}</div>`;
 else if(hr&&!hr.points?.length)chart='<p class="info-note">No heart-rate readings were recorded during this workout.</p>';
 else if(hr?.points?.length){
  const pts=hr.points,W=innerWidth<640?380:700,H=230,L=34,R=10,T=14,B=28,lo=Math.min(...pts.map(p=>p.bpm))-10,hi=Math.max(...pts.map(p=>p.max||p.bpm))+10,t0=Date.parse(pts[0].t),t1=Math.max(Date.parse(pts.at(-1).t),t0+60000),x=t=>L+(t-t0)/(t1-t0)*(W-L-R),y=v=>T+(1-(v-lo)/(hi-lo))*(H-T-B);
  const bands=(hr.zones||[]).map(z=>{const a1=Math.max(lo,z.min),a2=Math.min(hi,z.max);return a2>a1?`<rect x="${L}" width="${W-L-R}" y="${y(a2)}" height="${y(a1)-y(a2)}" fill="${zc[z.type]||'#888'}" opacity=".1"/><text class="zone-lbl" x="${W-R-4}" y="${y(a2)+13}" text-anchor="end">${humanZone(z.type)}</text>`:'';}).join('');
  const path=pts.map((p,i)=>`${i?'L':'M'}${x(Date.parse(p.t)).toFixed(1)} ${y(p.bpm).toFixed(1)}`).join(' ');
  const sp=pts.map(p=>[+x(Date.parse(p.t)).toFixed(1),+y(p.bpm).toFixed(1),`${time(p.t)} · ${p.bpm} bpm`]);
  chart=`<svg class="hr-chart scrub" data-points='${esc(JSON.stringify(sp))}' viewBox="0 0 ${W} ${H}" role="img" aria-label="Heart rate during the workout"><defs><linearGradient id="hrfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5d6c" stop-opacity=".35"/><stop offset="1" stop-color="#ff5d6c" stop-opacity="0"/></linearGradient></defs>${bands}${[lo+10,(lo+hi)/2,hi-10].map(v=>`<text class="axis-l" x="${L-6}" y="${y(v)+4}">${Math.round(v)}</text>`).join('')}<path d="${path} L${x(t1)} ${H-B} L${x(t0)} ${H-B}Z" fill="url(#hrfill)"/><path class="hr-line draw-line" pathLength="1" d="${path}"/>${[t0,(t0+t1)/2,t1].map((t,i)=>`<text class="axis-x" x="${x(t)}" y="${H-8}" text-anchor="${['start','middle','end'][i]}">${time(new Date(t).toISOString())}</text>`).join('')}</svg>`;
  peak=Math.max(...pts.map(p=>p.max||p.bpm));avg=avg??Math.round(mean(pts.map(p=>p.bpm)));
  if(hr.zones?.length){const mins={};pts.forEach(p=>{const z=hr.zones.find(z=>p.bpm>=z.min&&p.bpm<=z.max);if(z)mins[z.type]=(mins[z.type]||0)+1;});const tot=Object.values(mins).reduce((m,v)=>m+v,0)||1;if(zoneTotal==null)zoneTotal=Object.entries(mins).filter(([k])=>k!=='LIGHT').reduce((m,[,v])=>m+v,0);zoneRows=hr.zones.map(z=>`<div class="zone"><span><i style="background:${zc[z.type]||'#888'}"></i>${humanZone(z.type)}</span><div class="zone-track"><b style="width:${Math.round((mins[z.type]||0)/tot*100)}%;background:${zc[z.type]||'#888'}"></b></div><strong>${mins[z.type]||0} min</strong></div>`).join('');}
 }
 const stats=[['Duration',minutes(a.durationMinutes)],['Avg heart rate',avg!=null?avg+' bpm':'—'],['Peak heart rate',peak!=null?peak+' bpm':'—'],['Calories',a.calories!=null?number(a.calories)+' kcal':'—'],['Distance',a.distanceKm!=null?km(a.distanceKm):'—'],['Zone minutes',zoneTotal!=null?zoneTotal+' min':'—']];
 return heading(esc(a.name),`${time(a.start)} – ${time(a.end)} · ${shortDate(state.date)}`,`<button class="secondary-button" data-page="overview" data-back>‹ Back</button>`)+`<div class="stat-grid deep-stats">${stats.map(([l,v])=>`<div class="stat"><span>${l.toUpperCase()}</span><strong class="count">${v}</strong></div>`).join('')}</div><section class="panel"><div class="panel-heading"><h3>HEART RATE</h3><span class="chart-legend">MINUTE BY MINUTE</span></div>${chart}</section>${zoneRows?`<section class="panel"><div class="panel-heading"><h3>TIME IN YOUR ZONES</h3></div><div class="zone-bars">${zoneRows}</div></section>`:''}<p class="info-note">${demo?'Example workout.':'Heart rate comes from Google Health as 1-minute averages. Zones are your personal Fitbit heart-rate zones.'}</p>`;
}

// ===================== Phase 6: trends =====================
const clockMin=v=>new Date(2000,0,1,0,((Math.round(v)%1440)+1440)%1440).toLocaleTimeString([],{hour:'numeric',minute:'2-digit',...hourOpt()});
function distributions(hist){
 const rec=hist.map(h=>h.scores?.recovery).filter(v=>v!=null),str=hist.map(h=>h.scores?.strain).filter(v=>v!=null);
 const block=(title,defs,vals,avg)=>`<section class="panel"><div class="panel-heading"><h3>${title}</h3><span class="chart-legend">${avg}</span></div>${defs.map(([l,lo,hi,c])=>{const n=vals.filter(v=>v>=lo&&v<hi).length;return `<div class="dist-row"><span><i style="background:${c}"></i>${l}</span><div class="dist-track"><b style="width:${vals.length?n/vals.length*100:0}%;background:${c}"></b></div><strong>${n} ${n===1?'day':'days'}</strong></div>`;}).join('')}</section>`;
 return `<div class="content-grid">${block('RECOVERY ZONES',[['Green · 67–99%',67,101,'var(--lime)'],['Yellow · 34–66%',34,67,'var(--yellow)'],['Red · 1–33%',0,34,'var(--red)']],rec,rec.length?`AVG ${Math.round(mean(rec))}%`:'NO DATA')}${block('STRAIN BANDS',[['All out · 18+',18,22,'#ff8a3d'],['High · 14–18',14,18,'var(--blue)'],['Moderate · 10–14',10,14,'color-mix(in srgb,var(--blue) 60%,#000)'],['Light · under 10',0,10,'color-mix(in srgb,var(--blue) 35%,#000)']],str,str.length?`AVG ${number(mean(str),1)}`:'NO DATA')}</div><section class="panel sr-panel"><div class="panel-heading"><h3>STRAIN & RECOVERY</h3><span class="chart-legend">LAST 7 DAYS</span></div>${strainRecoveryChart(hist)}</section>`;
}
function metricCard(hist,c){
 const n=state.range,vals=hist.map(c.get),present=vals.filter(v=>v!=null),avg=mean(present),lo=present.length?Math.min(...present):null,hi=present.length?Math.max(...present):null,top=c.max||(hi!=null?Math.max(hi,c.ref||0)*1.15:1),fmt=c.fmt||(v=>number(v,c.digits||0)+(c.unit||''));
 const line=(v,cls,label)=>`<div class="mc-line ${cls}" style="bottom:${30+v/top*140}px" aria-hidden="true" title="${esc(label)}"></div>`;
 return `<article class="metric-card" style="--accent:${c.color}"><header><h3>${c.title}</h3><strong>${avg==null?'—':fmt(avg)}</strong><small>${avg==null?'No data yet':`${n}-day average`}</small></header><div class="mc-chart">${lo!=null&&present.length>1?line(hi,'hi','max '+fmt(hi))+line(lo,'lo','min '+fmt(lo)):''}${c.ref!=null?line(c.ref,'ref',c.refLabel):''}<div class="bar-chart${n>7?' dense':''}">${hist.map((h,i)=>{const v=c.get(h);return `<div class="bar-col" data-tip="${esc(shortDate(h.date))}: ${v==null?'no data':fmt(v)}"><span>${n===7&&v!=null?(c.short?c.short(v):number(v,c.digits||0)):''}</span><div class="bar${v==null?' empty':''}" style="height:${v==null?3:Math.max(3,v/top*140)}px;--i:${i}"></div><small>${n===7?new Date(h.date+'T12:00:00').toLocaleDateString([],{weekday:'narrow'}):(i%5===0?new Date(h.date+'T12:00:00').getDate():'')}</small></div>`;}).join('')}</div></div><footer><span><i class="key-dash"></i>${lo!=null?`Range ${fmt(lo)} – ${fmt(hi)}`:'No range yet'}</span>${c.ref!=null?`<span><i class="key-dash ref"></i>${esc(c.refLabel[0].toUpperCase()+c.refLabel.slice(1))}</span>`:''}</footer></article>`;
}
function metricPager(hist,cards){return `<div class="metric-stack">${cards.map(c=>metricCard(hist,c)).join('')}</div>`;}
function trendCards(tab){
 const goal=settings().sleepGoal||480;
 if(tab==='recovery')return [{title:'Recovery',get:h=>h.scores?.recovery,color:'var(--lime)',max:100,unit:'%'},{title:'Heart rate variability',get:h=>h.hrv,color:'var(--lime)',unit:' ms'},{title:'Resting heart rate',get:h=>h.restingHeartRate,color:'var(--red)',unit:' bpm'}];
 if(tab==='strain')return [{title:'Day strain',get:h=>h.scores?.strain,color:'var(--blue)',max:21,digits:1},{title:'Active calories',get:h=>h.activeCalories,color:'var(--blue)',unit:' kcal'},{title:'Steps',get:h=>h.steps,color:'var(--blue)',short:v=>v>=1000?Math.round(v/100)/10+'k':v}];
 return [{title:'Sleep score',get:h=>h.scores?.sleep,color:'var(--purple)',max:100,unit:'%'},{title:'Hours vs. goal',get:h=>h.sleepMinutes==null?null:h.sleepMinutes/60,color:'var(--purple)',digits:1,unit:'h',ref:goal/60,refLabel:`goal ${minutes(goal)}`},{title:'Bedtime',get:h=>h.bedtimeMinutes==null?null:h.bedtimeMinutes-1080,color:'var(--purple)',fmt:v=>clockMin(v+1080),short:v=>clockMin(v+1080).replace(/\s?[AP]M/i,'')}];
}
function trends(d) {
 const toggle=`<div class="period-toggle">${[7,30].map(n=>`<button data-range="${n}" class="${state.range===n?'active':''}">${n} days</button>`).join('')}</div>`;
 const live=state.mode==='live',n=state.range,tab=state.trendTab||'overview',who=firstName();
 if(live&&!d)return heading('Your trends','A longer view of your daily measurements.',toggle)+notice()+`<div class="empty-state"><h2>${state.loading?'Loading your history…':'Your trends will appear here.'}</h2><button class="primary-button" data-action="refresh">Refresh data</button></div>`;
 const hist=(live?d.history:demoHistory(state.date)).slice(-n);
 const tabsHtml=`<div class="tabs trend-tabs" role="tablist" aria-label="Trend views">${[['overview','Overview'],['recovery','Recovery'],['strain','Strain'],['sleep','Sleep']].map(([k,l])=>`<button data-trend="${k}" class="${tab===k?'active':''}" role="tab" aria-selected="${tab===k}">${l}</button>`).join('')}<i class="tab-ink" aria-hidden="true"></i></div>`;
 return heading(who?`${esc(who)}’s trends`:'Your trends','Small daily choices. A bigger picture.',toggle)+notice()+(live?'':`<div class="status-notice">These charts contain example data. <button data-action="connect">Connect your Fitbit</button> to see your own history.</div>`)+tabsHtml+`<div class="trend-body">${tab==='overview'?distributions(hist):metricPager(hist,trendCards(tab))}</div>`;
}

// ===================== Phase 7: coach =====================
const GOALS=[['peak','Peak',1,'Full sleep need: best for hard training days.'],['perform','Perform',.85,'85% of your need: a solid everyday target.'],['getby','Get by',.7,'70% of your need: the minimum to stay functional.']];
const hhmm=v=>{v=((Math.round(v)%1440)+1440)%1440;return `${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`;};
const toMin=t=>{const [h,m]=String(t||'07:00').split(':').map(Number);return h*60+(m||0);};
function strainSoFar(d){
 const st=stressData();if(!st?.windows?.length||!st.resting)return null;
 let acc=0;const pts=st.windows.filter(w=>w.context!=='sleep').map(w=>{acc+=Math.max(0,w.hr-st.resting*1.1);return [Date.parse(w.start),acc];});
 const final=d.scores.strain||0;if(!acc||!pts.length)return null;return pts.map(([t,v])=>[t,v/acc*final]);
}
function coachPage(){
 const d=data();if(!d)return emptyLive();
 const st=settings(),goal=st.goalMode||'perform',g=GOALS.find(x=>x[0]===goal)||GOALS[1],need=sleepNeed(d),eff=Math.max(.75,(d.baseline?.sleepEfficiency??90)/100);
 const usual=d.usualWakeMinutes!=null?hhmm(d.usualWakeMinutes):'07:00',wake=st.wakeTime||usual;
 const asleep=Math.round(need.total*g[2]),inBed=Math.round(asleep/eff),bed=toMin(wake)-inBed;
 const wkWake=st.weekdayWake||wake,weWake=st.weekendWake||wake;
 const week=Array.from({length:7},(_,i)=>{const dt=new Date();dt.setDate(dt.getDate()+i);const w=toMin([0,6].includes(dt.getDay())?weWake:wkWake);return {dt,bed:w-inBed,wake:w};});
 const tgt=strainTarget(d.scores.recovery),cur=d.scores.strain??0,curve=strainSoFar(d);if(state.mode==='live'&&!stressData()&&state.stressErrorDate!==state.date)setTimeout(()=>loadStress());
 const msg=d.scores.strain==null?'No activity recorded yet.':cur<tgt[0]?`${number(tgt[0]-cur,1)} more strain to reach today’s target.`:cur>tgt[1]?'You’re above today’s target. Ease off and prioritise recovery tonight.':'You’re in today’s target zone. Nice work.';
 let curveSvg='';
 if(curve){const W=innerWidth<640?380:700,H=150,L=26,R=8,T=10,B=24,t0=curve[0][0],t1=Math.max(curve.at(-1)[0],t0+3600e3),x=t=>L+(t-t0)/(t1-t0)*(W-L-R),y=v=>T+(1-v/21)*(H-T-B),p=curve.map(([t,v],i)=>`${i?'L':'M'}${x(t).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const cp=curve.filter((_,i)=>i%2===0||i===curve.length-1).map(([t,v])=>[+x(t).toFixed(1),+y(v).toFixed(1),`${time(new Date(t).toISOString())} · strain ${number(v,1)}`]);
  curveSvg=`<svg class="coach-curve scrub" data-points='${esc(JSON.stringify(cp))}' viewBox="0 0 ${W} ${H}" role="img" aria-label="Strain building through the day"><rect x="${L}" width="${W-L-R}" y="${y(tgt[1])}" height="${y(tgt[0])-y(tgt[1])}" class="target-band"/>${[0,7,14,21].map(v=>`<text class="axis-l" x="${L-6}" y="${y(v)+4}">${v}</text>`).join('')}<path class="draw-line" pathLength="1" d="${p}" fill="none" stroke="var(--blue)" stroke-width="2.4"/><path d="${p} L${x(curve.at(-1)[0])} ${H-B} L${x(t0)} ${H-B}Z" fill="color-mix(in srgb,var(--blue) 18%,transparent)"/>${[t0,t1].map((t,i)=>`<text class="axis-x" x="${x(t)}" y="${H-6}" text-anchor="${i?'end':'start'}">${time(new Date(t).toISOString())}</text>`).join('')}</svg>`;}
 return heading('Coach',firstName()?`Your plan for today and tonight, ${esc(firstName())}.`:'Your plan for today and tonight.')+`
 <div class="coach-grid">
 <section class="panel coach-sleep"><div class="panel-heading"><h3>SLEEP COACH</h3><button class="icon-tip" data-tip="Scoop works out your sleep need (baseline, today’s strain, catching up, minus naps), applies your goal, then allows for your usual sleep efficiency of ${Math.round(eff*100)}% to get time in bed." aria-label="How the sleep coach works">${icon('info')}</button></div>
  <div class="seg" role="group" aria-label="Sleep goal">${GOALS.map(([k,l])=>`<button data-action="set-goal" data-goal="${k}" class="${goal===k?'active':''}" aria-pressed="${goal===k}">${l}</button>`).join('')}</div><p class="info-note">${g[3]}</p>
  <div class="coach-result"><span><small>IN BED BY</small><strong>${clockMin(bed)}</strong></span><span class="tonight-line" aria-hidden="true"></span><span><small>WAKE</small><label class="wake-input"><input type="time" data-setting="wakeTime" value="${wake}" aria-label="Wake time"></label></span></div>
  <div class="need-row"><span>Time asleep</span><strong>${minutes(asleep)}</strong></div><div class="need-row"><span>Time in bed</span><strong>${minutes(inBed)}</strong></div>${st.wakeTime?`<button class="text-button" data-action="reset-wake">Use my usual wake time (${clockMin(toMin(usual))})</button>`:''}
 </section>
 <section class="panel coach-strain"><div class="panel-heading"><h3>STRAIN COACH</h3><span class="chart-legend">TARGET ${tgt[0]}–${tgt[1]}</span></div>
  <div class="strain-meter" aria-label="Strain ${number(cur,1)} of 21; target ${tgt[0]} to ${tgt[1]}"><div class="sm-track"><span class="sm-band" style="left:${tgt[0]/21*100}%;width:${(tgt[1]-tgt[0])/21*100}%"></span><span class="sm-fill" style="width:${Math.min(100,cur/21*100)}%"></span><span class="sm-dot" style="left:${Math.min(100,cur/21*100)}%"></span></div><div class="sm-scale"><span>0</span><span>7</span><span>14</span><span>21</span></div></div>
  <div class="coach-now"><strong class="count">${number(cur,1)}</strong><span>${esc(msg)}</span></div>
  <p class="info-note">${d.scores.recovery==null?'No recovery score today, so Scoop suggests a moderate target.':`Based on your ${d.scores.recovery}% recovery.`}</p>${curveSvg?`<div class="panel-heading"><h3>STRAIN SO FAR</h3></div>${curveSvg}`:''}
 </section></div>
 <section class="panel"><div class="panel-heading"><h3>THIS WEEK’S SLEEP SCHEDULE</h3><span class="chart-legend">${g[1].toUpperCase()} GOAL</span></div>
  <div class="wake-settings"><label>Weekday wake<input type="time" data-setting="weekdayWake" value="${wkWake}"></label><label>Weekend wake<input type="time" data-setting="weekendWake" value="${weWake}"></label></div>
  <div class="schedule">${week.map((w,i)=>`<div class="sched-row${i===0?' today':''}"><span>${i===0?'Tonight':w.dt.toLocaleDateString([],{weekday:'short',day:'numeric'})}</span><strong>${clockMin(w.bed)}</strong><i aria-hidden="true"></i><strong>${clockMin(w.wake)}</strong></div>`).join('')}</div>
 </section>`;
}

// ===================== Phase 9: profile, settings, help =====================
const profileState={};
async function loadProfile(){if(state.mode!=='live'||profileState.loading||profileState.data)return;profileState.loading=true;try{profileState.data=await request('/api/profile');}catch{profileState.data={missing:true};}finally{profileState.loading=false;if(state.page==='profile')render();}}
function allDays(){const m=new Map();if(state.mode==='demo'){demoHistory(today(),62).forEach(x=>m.set(x.date,x));return m;}for(const {data:dd} of dayCache.values())(dd.history||[]).forEach(x=>m.set(x.date,x));return m;}
function monthlyReport(){
 const month=state.date.slice(0,7),[y,mo]=month.split('-').map(Number),prevD=new Date(y,mo-2,1),prev=`${prevD.getFullYear()}-${String(prevD.getMonth()+1).padStart(2,'0')}`;
 ensureMonth(prev);const days=[...allDays().values()],cur=days.filter(x=>x.date.startsWith(month)),old=days.filter(x=>x.date.startsWith(prev));
 const rows=[['Average recovery',l=>mean(l.map(x=>x.scores?.recovery)),v=>Math.round(v)+'%',true],['Green days',l=>l.filter(x=>x.scores?.recovery>=67).length,v=>String(v),true],['Average strain',l=>mean(l.map(x=>x.scores?.strain)),v=>number(v,1),true],['Average sleep',l=>mean(l.map(x=>x.sleepMinutes)),v=>minutes(v),true],['Steps per day',l=>mean(l.map(x=>x.steps)),v=>number(v),true],['Resting heart rate',l=>mean(l.map(x=>x.restingHeartRate)),v=>Math.round(v)+' bpm',false]];
 const name=dt=>dt.toLocaleDateString([],{month:'long'});
 return `<section class="panel report"><div class="panel-heading"><h3>MONTHLY REPORT</h3><span class="chart-legend">${name(new Date(y,mo-1,1)).toUpperCase()} VS ${name(prevD).toUpperCase()}</span></div><div class="report-head"><span></span><small>${name(new Date(y,mo-1,1))}</small><small>${name(prevD)}</small><span></span></div>${rows.map(([l,f,fmt,hi])=>{const a=cur.length?f(cur):null,b=old.length?f(old):null;return `<div class="report-row"><span>${l}</span><strong>${a==null?'—':fmt(a)}</strong><small>${b==null?(state.calLoading?'…':'—'):fmt(b)}</small>${arrowMark(a!=null&&b?compare(a,b,hi):null)}</div>`;}).join('')}<p class="info-note">${cur.length} days this month${old.length?`, ${old.length} last month`:''}.</p></section>`;
}
function profilePage(){
 const p=profile(),d=data(),demo=state.mode==='demo',dev=state.live?.device;if(!demo&&!profileState.data)setTimeout(loadProfile);
 const hp=demo?{age:31,memberSince:'2024-03-12'}:profileState.data||{},h=d?historyOf(d):[];
 const total=k=>h.reduce((n,x)=>n+(x[k]||0),0),vo2=[...h].reverse().find(x=>x.vo2Max!=null)?.vo2Max;
 const stats=[['Steps (30 days)',number(total('steps'))],['Workouts',number(d?.activitySummary?.workouts??(demo?14:0))],['Zone minutes',number(total('activeZoneMinutes'))],['Average sleep',minutes(mean(h.map(x=>x.sleepMinutes)))],['Average recovery',(()=>{const v=mean(h.map(x=>x.scores?.recovery));return v==null?'—':Math.round(v)+'%';})()],['Cardio fitness',vo2!=null?number(vo2,1):'—']];
 const member=hp.memberSince?`Member since ${new Date(hp.memberSince+'T12:00:00').toLocaleDateString([],{month:'long',year:'numeric'})}`:'';
 const card=`<section class="panel profile-card"><div class="profile-summary">${avatarHtml(p||{name:demo?'Example athlete':'You'},'avatar xl')}<div><h2>${esc(p?.name||(demo?'Example athlete':'You'))}</h2><p class="muted">${demo?'Example data':'Fitbit via Google Health'}${member?` · ${member}`:''}</p>${!demo&&hp.missing?'<p class="muted">Your member-since date isn’t shared yet. <button class="link" data-action="google-signin">Reconnect</button></p>':''}</div></div>
 ${demo?'<div class="button-row"><button class="primary-button" data-action="connect">Connect your Fitbit</button></div>':`<div class="sync-grid"><div><span>DEVICE</span><strong>${esc(dev?.name||'—')}</strong></div><div><span>BATTERY</span><strong>${dev?.battery!=null?dev.battery+'%':esc(dev?.batteryStatus||'—')}</strong></div><div><span>LAST SYNCED</span><strong>${dev?.lastSyncTime?`${clock(dev.lastSyncTime)} · ${ago(dev.lastSyncTime)}`:'—'}</strong></div><div><span>SCOOP REFRESHED</span><strong>${state.live?.syncedAt?clock(state.live.syncedAt):'—'}</strong></div></div>`}</section>`;
 return heading('Profile','Your Scoop at a glance.','')+card+`<div class="stat-grid">${stats.map(([l,v])=>`<div class="stat"><span>${l.toUpperCase()}</span><strong class="count">${v}</strong></div>`).join('')}</div>${d?monthlyReport():''}<div class="button-row icon-buttons"><button class="secondary-button" data-page="settings">${icon('settings')}<span>Settings</span></button><button class="secondary-button" data-page="help">${icon('help')}<span>Help</span></button></div>`;
}
const permState={};
async function loadPerms(){if(state.mode!=='live'||permState.loading||permState.scopes)return;permState.loading=true;try{permState.scopes=(await request('/api/permissions')).scopes;}catch{permState.scopes=[];}finally{permState.loading=false;if(state.page==='settings')render();}}
function settingsPage(){
 const st=settings(),live=state.mode==='live';if(live&&!permState.scopes)setTimeout(loadPerms);
 const seg=(key,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button data-action="set-setting" data-key="${key}" data-value="${v}" class="${String(st[key])===String(v)?'active':''}" aria-pressed="${String(st[key])===String(v)}">${l}</button>`).join('')}</div>`;
 const features=[['Activity & workouts','googlehealth.activity_and_fitness.readonly'],['Sleep','googlehealth.sleep.readonly'],['Heart & health metrics','googlehealth.health_metrics_and_measurements.readonly'],['Device battery & sync','googlehealth.settings.readonly'],['ECG readings','googlehealth.ecg.readonly'],['Irregular rhythm alerts','googlehealth.irn.readonly'],['Member since & age','googlehealth.profile.readonly'],['Name & photo','profile']];
 return heading('Settings','Make Scoop work the way you like.','')+`<section class="panel settings"><div class="panel-heading"><h3>DISPLAY</h3></div><div class="setting-line"><span><strong>Distance</strong></span>${seg('distance',[['km','Kilometres'],['mi','Miles']])}</div><div class="setting-line"><span><strong>Time format</strong></span>${seg('clock',[['auto','Auto'],['12','12-hour'],['24','24-hour']])}</div>${canHaptic()?`<div class="setting-line"><span><strong>Haptic feedback</strong><small>Light taps on Android and iPhone (iOS 18+).</small></span><button class="switch" role="switch" aria-checked="${hapticsOn()}" data-action="toggle-haptics" aria-label="Haptic feedback"><i></i></button></div>`:''}</section>
 <section class="panel settings"><div class="panel-heading"><h3>YOU</h3></div><div class="setting-line"><span><strong>Date of birth</strong><small>Used for Scoop Age. Stays on this browser.</small></span><button class="secondary-button" data-action="dob">${st.dob?new Date(st.dob+'T12:00:00').toLocaleDateString([],{day:'numeric',month:'short',year:'numeric'}):'Add'}</button></div></section>
 <section class="panel settings"><div class="panel-heading"><h3>SLEEP</h3></div><div class="setting-line"><span><strong>Sleep goal</strong><small>Used for your sleep need and the sleep coach.</small></span><select data-setting="sleepGoal" aria-label="Sleep goal">${[390,420,450,480,510,540,570,600].map(v=>`<option value="${v}" ${Number(st.sleepGoal)===v?'selected':''}>${minutes(v)}</option>`).join('')}</select></div></section>
 <section class="panel settings"><div class="panel-heading"><h3>PERMISSIONS</h3>${live?'<button class="text-button" data-action="google-signin">Update ›</button>':''}</div>${live?(permState.scopes?features.map(([l,sc])=>{const on=permState.scopes.includes(sc);return `<div class="perm-row"><span>${l}</span><b class="${on?'on':'off'}">${on?'✓ Shared':'Not shared'}</b></div>`;}).join(''):'<p class="info-note">Checking…</p>'):'<p class="info-note">Connect your Fitbit to choose what Scoop can read.</p>'}</section>
 <section class="panel settings"><div class="panel-heading"><h3>SUPPORT</h3></div><button class="setting-link" data-page="help"><span>${icon('help')}Help & FAQ</span><i aria-hidden="true">›</i></button><button class="setting-link" data-action="about"><span>${icon('info')}About Scoop</span><i aria-hidden="true">›</i></button></section>
 <section class="panel settings"><div class="panel-heading"><h3>ACCOUNT & DATA</h3></div><div class="button-row">${live?'<button class="secondary-button" data-action="disconnect">Disconnect Fitbit</button>':'<button class="primary-button" data-action="connect">Connect your Fitbit</button>'}<button class="secondary-button" data-action="clear-local">Clear data saved on this browser</button></div><p class="info-note">Scoop keeps your Google connection in an encrypted cookie for up to 12 hours. Journal entries, manual activities and these settings stay on this browser.</p></section>`;
}
const FAQ=[['Why is my data late or missing?','Your Fitbit syncs to the Fitbit app, the app sends data to Google Health, and Scoop reads it from there. Open the Fitbit app to sync, then tap refresh in Scoop. The device icon in the top bar shows when your Fitbit last synced.'],['Why don’t I have a recovery score today?','Recovery needs last night’s HRV. Fitbit only calculates HRV after a long enough night with your watch on, usually three hours or more of main sleep.'],['How are Scoop’s scores calculated?','Recovery, Strain and Sleep are built from your Fitbit measurements. Tap the ⓘ on any score to see how yours was worked out.'],['What is the stress monitor?','It compares 5-minute heart-rate averages with your resting heart rate while you’re awake and not working out, on a 0–3 scale. It’s an estimate, not a medical measure.'],['What does Scoop store?','Nothing on the server. Your Google connection lives in an encrypted cookie in your browser for up to 12 hours. Journal entries, manual activities and settings stay on this browser.'],['Who can connect?','Anyone with a Fitbit linked to a Google account, once the app owner adds them as a tester or the app is verified by Google.'],['How do I disconnect?','Open Settings and choose Disconnect Fitbit. You can also remove Scoop’s access from your Google account’s security settings.']];
function helpPage(){return heading('Help','Answers to common questions.','')+`<div class="faq">${FAQ.map(([q,a],i)=>`<details class="insight-x faq-item"${i===0?' open':''}><summary><span class="insight-text"><strong>${q}</strong></span><i class="chev" aria-hidden="true">›</i></summary><div class="insight-body"><p>${a}</p></div></details>`).join('')}</div><div class="button-row"><button class="secondary-button" data-action="walkthrough" data-kind="recovery">How recovery works</button><button class="secondary-button" data-action="about">About Scoop</button></div>`;}

const questions=[['energy','How are you feeling?','Your energy as you start the day.',['Energized','Rested','Tired','Exhausted']],['soreness','Any muscle soreness?','Check in with how your body feels.',['None','Slight','Sore','Very sore']],['stressed','Feeling stressed?','A moment to reflect on your day.',['No','Yes']],['sick','Feeling sick?','Make a note of changes in your health.',['No','Yes']],['injured','Any injuries?','Keep track of what needs attention.',['No','Yes']]];
function journal() {
 const j=readLocal('scoop:journal:'+state.date,{});
 return heading('Your journal','Connect the dots between your habits and your day.')+`<section class="panel"><div class="panel-heading"><h3>YOUR DAILY CHECK-IN</h3><span class="chart-legend">${j.saved?'Saved on this browser':'Stored on this browser only'}</span></div><p class="subtext journal-intro">A few simple questions. A little more awareness.</p>${questions.map(([key,title,sub,options])=>`<div class="journal-question"><div><h3>${title}</h3><p>${sub}</p></div><div class="choices" role="group" aria-label="${esc(title)}">${options.map(o=>`<button class="choice ${j[key]===o?'selected':''}" aria-pressed="${j[key]===o}" data-question="${key}" data-answer="${o}">${o}</button>`).join('')}</div></div>`).join('')}<div class="journal-notes"><label for="journal-notes">Anything else on your mind?</label><textarea class="form-field" id="journal-notes" placeholder="Add a note about your day…" maxlength="4000">${esc(j.notes||'')}</textarea></div><div class="button-row"><button class="primary-button" data-action="save-journal">Save journal</button>${j.saved?'<button class="secondary-button" data-action="delete-journal">Delete entry</button>':''}</div><p class="info-note">Journal entries stay in this browser and do not affect health measurements or sync to Fitbit.</p></section>${impactAnalysis()}`;
}
function emptyLive(){const t=pages.find(p=>p[0]===state.page)?.[1]||'Overview';return heading(state.page==='overview'?'Your daily overview':t,'Your health, at a glance.')+tabs()+notice()+`<div class="empty-state"><h2>${state.loading?'Loading your day…':'Your measurements will appear here.'}</h2><p>${state.error?'Your last request failed. Try refreshing or reconnecting.':'Choose a date and sync your Google Health measurements.'}</p><button class="primary-button" data-action="refresh">Refresh data</button></div>`;}
function render(){document.body.classList.toggle('is-syncing',Boolean(state.loading));document.body.classList.toggle('swipe-days',!['trends','healthspan'].includes(state.page));navigation();main.innerHTML=state.page==='journal'?journal():state.page==='trends'?trends(data()):state.page==='healthspan'?healthspan():state.page==='others'?others():state.page==='stress'?stressPage():state.page==='activity'?activityPage():state.page==='coach'?coachPage():state.page==='profile'?profilePage():state.page==='settings'?settingsPage():state.page==='help'?helpPage():state.page==='overview'?overview(data()):detail(data(),state.page);afterRender();}
function navigate(page,force=false){if(!pages.some(p=>p[0]===page)&&!HIDDEN[page])page='overview';if(page===state.page&&!force)return;
 const order=pages.map(p=>p[0]),from=order.indexOf(state.page),to=order.indexOf(page);
 if(!state.transition&&!force)state.transition=HIDDEN[state.page]&&page==='overview'?'close':from<4&&to<4?(to>from?'left':'right'):'fade';
 state.page=page;closeDrawer();render();window.scrollTo({top:0,behavior:'instant'});}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3600);}
function modal(title,body){$('#modal-content').innerHTML=`<div class="modal-head"><h2>${title}</h2><button data-action="close-modal" aria-label="Close dialog">×</button></div>${body}`;if(!$('#modal').open)$('#modal').showModal();}
async function request(path,options){const r=await fetch(path,options);const result=await r.json();if(!r.ok)throw Object.assign(new Error(result.message||'The request failed. Please try again.'),{status:r.status});return result;}
async function status(){try{state.status=await request('/api/status');try{if(state.status.connected)localStorage.setItem('scoop:connected','1');else localStorage.removeItem('scoop:connected');}catch{}return state.status;}catch(e){state.error='Scoop’s server is unavailable right now. Try again in a moment.';return null;}}
const dayCache=new Map(); // date -> {data, at}
const tzParam=()=>encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone||'');
const fetchDay=date=>request('/api/health?date='+encodeURIComponent(date)+'&tz='+tzParam());
/** An instant preview of a day from any cached response whose 31-day history covers it. */
function previewFor(date){
 for(const {data} of dayCache.values()){
  const h=data.history?.find(x=>x.date===date); if(!h)continue;
  const {scores,date:_d,...metrics}=h;
  return {...data,date,provisional:true,metrics:{...data.metrics,...Object.fromEntries(Object.keys(data.metrics).map(k=>[k,metrics[k]??null]))},scores:{recovery:scores.recovery,strain:scores.strain,sleepPerformance:scores.sleep},sleep:null,activities:[],latestNight:null,history:data.history.filter(x=>x.date<=date)};
 }
 return null;
}
function prefetch(date){ if(dayCache.has(date)||date>today())return; fetchDay(date).then(d=>dayCache.set(date,{data:d,at:Date.now()})).catch(()=>{}); }
async function refresh(force=false){
 if(!state.status?.connected){await connectModal();return;}
 const date=state.date,id=++state.request,cached=dayCache.get(date);
 state.mode='live';state.error=null;
 if(cached&&!force){state.live=cached.data;state.loading=false;render();if(Date.now()-cached.at<5*60000)return;}
 else{state.live=previewFor(date)||(state.live?.date===date?state.live:null);state.loading=true;render();}
 try{const d=await fetchDay(date);dayCache.set(date,{data:d,at:Date.now()});if(id===state.request){state.live=d;}}
 catch(e){if(id===state.request){if(e.status===401){await status();state.mode='demo';toast('Your Fitbit session expired. Connect again to keep syncing.');}else if(!state.live||state.live.provisional)state.error=e.message;else toast('Couldn’t refresh. Showing your last synced data.');}}
 finally{if(id===state.request){state.loading=false;render();const prev=new Date(date+'T12:00:00');prev.setDate(prev.getDate()-1);prefetch(prev.toLocaleDateString('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'}));}}
}
async function connectModal(){
 const s=await status();
 modal(s?.connected?(s.profile?.firstName?`You’re connected, ${esc(s.profile.firstName)}`:'Your Fitbit is connected'):'Connect your Fitbit',`${s?.connected?`<div class="profile-summary">${avatarHtml(s.profile,'avatar large')}<div><strong>${esc(s.profile?.name||'Your Google account')}</strong><span class="muted">Fitbit via Google Health</span></div></div><div class="sync-grid"><div><span>DEVICE</span><strong>${esc(state.live?.device?.name||'—')}</strong></div><div><span>DEVICE LAST SYNCED</span><strong>${state.live?.device?.lastSyncTime?`${clock(state.live.device.lastSyncTime)} · ${ago(state.live.device.lastSyncTime)}`:'—'}</strong></div><div><span>BATTERY</span><strong>${state.live?.device?.battery!=null?state.live.device.battery+'%':esc(state.live?.device?.batteryStatus||'—')}</strong></div><div><span>SCOOP REFRESHED</span><strong>${state.live?.syncedAt?clock(state.live.syncedAt):'—'}</strong></div></div>${state.live&&!state.live.device?'<p class="note">Reconnect and allow device access to see when your Fitbit last synced.</p>':''}`:'<p>Bring your sleep, activity, and health measurements into this dashboard through Google Health. Anyone with a Fitbit linked to a Google account can connect.</p>'}<div class="connection-status"><strong>${s?.connected?'Connected through Google Health':s?.configured?'Ready for Google sign-in':'Google OAuth setup required'}</strong><span class="muted">${s?.connected?'Your measurements are read only.':s?.configured?'Sign in with the Google account you use for Fitbit.':'Add your Google Cloud OAuth credentials to the local .env file to enable sign-in.'}</span></div>${!s?.configured?`<ol class="setup-list"><li>Enable the <a href="https://console.cloud.google.com/apis/library/health.googleapis.com" target="_blank" rel="noopener">Google Health API</a> in your Google Cloud project.</li><li>Create a Web application OAuth client and add your account as a test user.</li><li>Register this redirect URI:<br><code>${esc(s?.setup?.redirectUri||location.origin+'/api/oauth/callback')}</code></li><li>Set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in <code>.env</code>, then restart the server.</li></ol><p class="note"><a href="https://developers.google.com/health/setup" target="_blank" rel="noopener">Official Google setup guide ↗</a> · See README.md for the exact scopes.</p>`:''}<p class="note">Recovery, Strain and Sleep are worked out from your Fitbit measurements. <button class="text-button" data-action="scores">How scores work</button></p><div class="button-row">${s?.connected?'<button class="primary-button" data-action="use-live">View my data</button><button class="secondary-button" data-action="disconnect">Disconnect</button>':s?.configured?'<button class="primary-button" data-action="google-signin">Continue with Google ↗</button>':'<button class="primary-button" data-action="recheck-setup">Check setup again</button>'}<button class="secondary-button" data-action="use-demo">Explore example data</button></div>${canHaptic()?`<div class="setting-row"><span><strong>Haptic feedback</strong><small>Light taps when you change days, flip cards, or save.</small></span><button class="switch" role="switch" aria-checked="${hapticsOn()}" data-action="toggle-haptics" aria-label="Haptic feedback"><i></i></button></div>`:''}<p class="note">${esc(s?.storage||'Your credentials stay on the local server.')}</p>`);
}
function about(){modal('About Scoop',`<p>Scoop is an independent, personal dashboard for the data your Fitbit already records: sleep, activity, heart rate variability, resting heart rate, and more.</p><p><strong>Example mode</strong> uses fictional scores and activity. <strong>Connected mode</strong> reads your measurements from Google Health with your consent. Scoop only shows your first name, full name, and Google profile photo to personalize the app.</p><p>Journal and manually added activities stay in this browser. Your Google connection lives in an encrypted cookie for up to 12 hours.</p>`);}
function scoresInfo(){modal('How Scoop scores work',`<p>Scoop scores are worked out from your Fitbit measurements. They are not medical advice.</p><ul class="setup-list"><li><strong>Recovery (1–99%)</strong> compares today’s HRV and resting heart rate with your own 30-day average, adjusted slightly by last night’s sleep. It needs at least three days of HRV history.</li><li><strong>Strain (0–21)</strong> grows with heart-rate zone minutes, steps, and active calories, and gets harder to raise the more you’ve already done.</li><li><strong>Sleep score (0–100%)</strong> is 75% time asleep against an 8-hour goal and 25% sleep efficiency.</li></ul><p class="note">Arrows compare today with your previous 30 days.</p>`);}
function addActivity(){modal('Add an activity',`<p>Create a local entry for ${esc(dateLabel(state.date))}. This entry stays in your browser.</p><form id="activity-form"><label>Activity<select name="name"><option>Running</option><option>Walking</option><option>Cycling</option><option>Strength training</option><option>Yoga</option><option>Swimming</option><option>Other</option></select></label><label>Start time<input name="start" type="time" required value="09:00"></label><label>Duration (minutes)<input name="duration" type="number" required min="1" max="1440" value="30"></label><div class="button-row"><button class="primary-button" type="submit">Save activity</button><button type="button" class="secondary-button" data-action="close-modal">Cancel</button></div><p class="note">Manual activities do not generate scores or sync to Fitbit.</p></form>`);}
async function action(name,el){
 switch(name){
 case'connect':case'settings':case'recheck-setup':await connectModal();break;
 case'close-modal':$('#modal').close();break;
 case'about':about();break;
 case'scores':scoresInfo();break;
 case'previous-day':case'next-day':{state.transition=name==='previous-day'?'right':'left';haptic('tick');const d=new Date(state.date+'T12:00:00');d.setDate(d.getDate()+(name==='previous-day'?-1:1));state.date=d.toLocaleDateString('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'});if(state.mode==='live')await refresh();else render();break;}
 case'add-activity':addActivity();break;
 case'save-journal':{const key='scoop:journal:'+state.date,j=readLocal(key,{});j.notes=$('#journal-notes').value;j.saved=new Date().toISOString();if(saveLocal(key,j)){haptic('confirm');render();toast('Your journal is saved on this browser.');}break;}
 case'delete-journal':try{localStorage.removeItem('scoop:journal:'+state.date);render();toast('Journal entry deleted.');}catch{toast('Could not delete this entry.');}break;
 case'refresh':await refresh(true);loadStress(true);break;
 case'flip':{const on=el.getAttribute('aria-pressed')!=='true';el.setAttribute('aria-pressed',String(on));el.classList.remove('flip-to-back','flip-to-front');void el.offsetWidth;el.classList.add(on?'flip-to-back':'flip-to-front');haptic('select');break;}
 case'calendar':state.calMonth=state.date.slice(0,7);openCalendar();haptic('tick');break;
 case'cal-prev':case'cal-next':{const [y,mo]=state.calMonth.split('-').map(Number),dt=new Date(y,mo-1+(name==='cal-next'?1:-1),1);state.calMonth=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;state.calDir=name==='cal-next'?'left':'right';openCalendar();haptic('tick');break;}
 case'cal-metric':state.calMetric=el.dataset.metric;openCalendar();haptic('select');break;
 case'pick-day':{const v=el.dataset.date;$('#modal').close();if(v===state.date)break;state.transition=v<state.date?'right':'left';state.date=v;haptic('select');if(state.mode==='live')await refresh();else render();break;}
 case'vitals':{const d=data(),v=d?vitals(d):[];modal('Vitals',v.length?`<p>Compared with your own usual range from the last 30 days.</p>${v.map(([n,ok,t])=>`<div class="health-row"><span class="health-label">${ok?'<b class="vital-ok">✓</b>':'<b class="vital-warn">!</b>'}${n}</span><span class="vital-detail">${t}</span></div>`).join('')}<p class="note">Scoop isn’t a medical device. Talk to a doctor if something feels off.</p>`:'<p>Vitals appear after a night of sleep with your Fitbit on.</p>');break;}
 case'open-drawer':openDrawer();break;
 case'dob':dobSheet();haptic('tick');break;
 case'save-dob':{const v=$('#dob-input')?.value,max=new Date();max.setFullYear(max.getFullYear()-13);if(!/^\d{4}-\d{2}-\d{2}$/.test(v||'')||v<'1920-01-01'||v>max.toLocaleDateString('en-CA')){toast('Enter a valid date of birth.');haptic('warn');break;}saveSettings({dob:v,birthYear:null});haptic('confirm');$('#modal').close();state.transition='zoom';render();toast('Saved. Here’s your Scoop Age.');break;}
 case'clear-dob':saveSettings({dob:null});$('#modal').close();render();break;
 case'go-profile':closeDrawer();location.hash='profile';break;
 case'dismiss-new':{try{localStorage.setItem('scoop:seen',WHATS_NEW);}catch{}const card=document.querySelector('.whats-new');if(card&&!reducedMotion()){card.classList.add('leaving');setTimeout(render,180);}else render();break;}
 case'walkthrough':walkthrough(el.dataset.kind);break;
 case'walk-next':walkthrough(el.dataset.kind,1);haptic('tick');break;
 case'walk-back':walkthrough(el.dataset.kind,0);haptic('tick');break;
 case'set-goal':saveSettings({goalMode:el.dataset.goal});haptic('select');state.crossfade=true;render();break;
 case'reset-wake':saveSettings({wakeTime:null});render();break;
 case'set-setting':saveSettings({[el.dataset.key]:el.dataset.value});haptic('select');render();break;
 case'pager-go':{const p=document.querySelector('[data-pager]');if(p)p.scrollTo({left:Number(el.dataset.index)*p.clientWidth,behavior:reducedMotion()?'auto':'smooth'});break;}
 case'clear-local':{if(!confirm('Clear journal entries, manual activities and settings saved on this browser?'))break;try{Object.keys(localStorage).filter(k=>k.startsWith('scoop:')&&k!=='scoop:connected').forEach(k=>localStorage.removeItem(k));}catch{}toast('Cleared data saved on this browser.');render();break;}
 case'device':{const dev=state.live?.device;modal(dev?esc(dev.name):'Your Fitbit',dev?`<div class="device-hero" style="--level:${Math.max(.08,(dev.battery??0)/100)}">${deviceIcon()}<div><strong>${dev.battery!=null?dev.battery+'%':esc(dev.batteryStatus||'—')}</strong><span class="muted">${esc(dev.batteryStatus||'')} battery</span></div></div><div class="sync-grid"><div><span>LAST SYNCED</span><strong>${clock(dev.lastSyncTime)} · ${ago(dev.lastSyncTime)}</strong></div><div><span>SCOOP REFRESHED</span><strong>${state.live?.syncedAt?clock(state.live.syncedAt):'—'}</strong></div></div><p class="note">New data reaches Scoop after your Fitbit syncs with the Fitbit app. Open the app to sync now.</p><div class="button-row"><button class="primary-button" data-action="refresh">Refresh Scoop</button></div>`:state.mode==='demo'?'<p>Connect your Fitbit to see its battery and last sync time here.</p><div class="button-row"><button class="primary-button" data-action="connect">Connect your Fitbit</button></div>':'<p>Allow device access when you connect to see battery and sync time.</p>');break;}
 case'close-drawer':closeDrawer();break;
 case'fab':modal('Quick actions',`<div class="quick-grid"><button class="quick" data-action="add-activity">${icon('run')}<span>Add activity</span></button><button class="quick" data-action="go-journal">${icon('journal')}<span>Daily check-in</span></button><button class="quick" data-action="calendar">${icon('calendar')}<span>Jump to a date</span></button><button class="quick" data-action="refresh">${icon('arrow')}<span>Sync now</span></button></div>`);break;
 case'go-journal':$('#modal').close();location.hash='journal';break;
 case'toggle-haptics':{const on=!hapticsOn();try{localStorage.setItem('scoop:haptics',on?'on':'off');}catch{}el.setAttribute('aria-checked',String(on));if(on)haptic('select');toast(on?'Haptic feedback on.':'Haptic feedback off.');break;}
 case'reload-others':state.othersError=null;render();break;
 case'reload-stress':state.stressError=null;state.stressErrorDate=null;loadStress(true);render();break;
 case'use-live':$('#modal').close();await refresh();break;
 case'use-demo':state.request++;state.mode='demo';state.loading=false;state.error=null;$('#modal').close();render();break;
 case'google-signin':location.assign('/api/connect');break;
 case'disconnect':try{await request('/api/disconnect',{method:'POST'});state.request++;state.mode='demo';state.live=null;state.loading=false;state.error=null;await status();$('#modal').close();render();toast('Disconnected. Your connection tokens were removed.');}catch(e){toast(e.message);}break;
 }
}
document.addEventListener('click',async event=>{
 const el=event.target.closest('[data-action],[data-page],[data-range],[data-question],[data-activity],[data-trend]');if(!el)return;
 if(el.dataset.action){event.preventDefault();await action(el.dataset.action,el);}
 else if(el.dataset.page){if(el.hasAttribute('data-zoom'))state.transition='zoom';else if(el.hasAttribute('data-back'))state.transition='close';location.hash=el.dataset.page;navigate(el.dataset.page);}
 else if(el.dataset.range){state.range=Number(el.dataset.range);render();}
 else if(el.dataset.trend){if(state.trendTab!==el.dataset.trend){const o=['overview','recovery','strain','sleep'];state.transition=o.indexOf(el.dataset.trend)>o.indexOf(state.trendTab||'overview')?'left':'right';state.trendTab=el.dataset.trend;render();}}
 else if(el.dataset.question){const key='scoop:journal:'+state.date,j=readLocal(key,{});j[el.dataset.question]=el.dataset.answer;if(saveLocal(key,j)){haptic('select');el.parentElement.querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b===el);b.setAttribute('aria-pressed',String(b===el));});el.classList.remove('inflate');void el.offsetWidth;el.classList.add('inflate');}}
 else if(el.dataset.activity){const a=activityItems(data())[Number(el.dataset.activity)];if(!a)return;if(a.kind!=='sleep'&&!a.local&&a.start&&a.end){state.activity=a;state.transition='zoom';location.hash='activity';navigate('activity');return;}modal(esc(a.name),`<p>${a.local?'Local entry':'Data source: '+(state.mode==='demo'?'Example data':'Google Health')}</p><div class="health-row"><span>Duration</span><strong>${minutes(a.durationMinutes)}</strong></div><div class="health-row"><span>Start</span><strong>${time(a.start)}</strong></div>${a.calories!=null?`<div class="health-row"><span>Calories</span><strong>${number(a.calories)} kcal</strong></div>`:''}${a.averageHeartRate!=null?`<div class="health-row"><span>Average heart rate</span><strong>${number(a.averageHeartRate)} bpm</strong></div>`:''}${a.local?`<div class="button-row"><button class="secondary-button" data-action="remove-activity" data-id="${esc(a.id)}">Delete local activity</button></div>`:''}`);}
});
document.addEventListener('click',event=>{const el=event.target.closest('[data-action="remove-activity"]');if(!el)return;const key='scoop:activities:'+state.date;if(saveLocal(key,readLocal(key,[]).filter(a=>a.id!==el.dataset.id))){$('#modal').close();render();toast('Local activity deleted.');}});
document.addEventListener('change',event=>{const k=event.target.dataset?.setting;if(!k)return;const v=event.target.value;saveSettings({[k]:k==='sleepGoal'?Number(v):v});haptic('select');state.crossfade=true;render();});
document.addEventListener('submit',event=>{if(event.target.id!=='activity-form')return;event.preventDefault();const f=new FormData(event.target),duration=Number(f.get('duration'));if(!Number.isFinite(duration)||duration<1||duration>1440)return;const start=state.date+'T'+f.get('start')+':00',entry={id:crypto.randomUUID(),name:String(f.get('name')),durationMinutes:duration,start,end:new Date(Date.parse(start)+duration*60000).toISOString(),local:true};const key='scoop:activities:'+state.date;if(saveLocal(key,[...readLocal(key,[]),entry])){haptic('confirm');$('#modal').close();render();toast('Activity saved on this browser.');}});
$('#modal').addEventListener('click',event=>{if(event.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('#modal').close();}});
// ---------- Motion, haptics, drawer, swipe, calendar, tooltips ----------
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function hapticsOn(){try{return localStorage.getItem('scoop:haptics')!=='off';}catch{return true;}}
/** Light vibration on Android browsers; silently unavailable on iOS and desktop. */
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const canHaptic=()=>'vibrate' in navigator||isIOS;
let iosSwitch=null;
/** iOS Safari (18+) plays the system haptic when a switch control toggles; it must happen inside the tap. */
function iosTap(){if(!iosSwitch){const l=document.createElement('label'),i=document.createElement('input');i.type='checkbox';i.setAttribute('switch','');i.tabIndex=-1;l.setAttribute('aria-hidden','true');l.style.cssText='position:fixed;left:-200px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden';l.append(i);document.body.append(l);iosSwitch=l;}iosSwitch.click();}
let lastHaptic=0;
function haptic(kind='tick'){if(!hapticsOn()||reducedMotion())return;const now=performance.now();if(now-lastHaptic<60)return;lastHaptic=now;try{if('vibrate' in navigator){if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;navigator.vibrate({tick:8,select:14,confirm:[12,60,20],warn:[30,60,30]}[kind]||8);}else if(isIOS)iosTap();}catch{}}
// Fire on the tap itself (navigation happens later via hashchange, outside the gesture).
document.addEventListener('click',e=>{if(e.target.closest('[data-nav], .mobile-nav a, .tabs button, .mini-ring, .monitor-card, .cal-day, [data-action="open-drawer"]'))haptic('tick');},true);
const dialMemory=new Map();
function animateDials(){
 const ctx=state.page+'|'+state.date;
 document.querySelectorAll('.score-ring .progress, .mini-ring .progress').forEach((el,i)=>{
  const key=ctx+'|'+i,host=el.closest('[style*="--progress"]'),target=Number(getComputedStyle(host||el).getPropertyValue('--progress'))||0,prev=dialMemory.get(key);
  const circ=Number(el.getAttribute('r'))*2*Math.PI;el.style.strokeDasharray=circ;
  const to=circ*(1-target),from=prev?.ctx===ctx?prev.offset:circ;
  dialMemory.set(key,{ctx,offset:to});
  if(reducedMotion()||from===to){el.style.transition='none';el.style.strokeDashoffset=to;return;}
  el.style.transition='none';el.style.strokeDashoffset=from;el.getBoundingClientRect();
  el.style.transition='stroke-dashoffset var(--t-dial) var(--ease-emph)';el.style.strokeDashoffset=to;
 });
 document.querySelectorAll('.count').forEach((el,i)=>{
  const text=el.textContent,target=parseFloat(text.replace(/,/g,'')),key='n|'+ctx+'|'+i,prev=dialMemory.get(key);
  if(!Number.isFinite(target)||reducedMotion()||/\d\s*h\s*\d|\d:\d/.test(text)){dialMemory.set(key,{ctx,v:target});return;}
  const from=prev?.ctx===ctx&&Number.isFinite(prev.v)?prev.v:0,digits=(text.split('.')[1]||'').length;dialMemory.set(key,{ctx,v:target});
  if(from===target)return;const t0=performance.now(),dur=700;
  const step=t=>{const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=(from+(target-from)*e).toLocaleString(undefined,{minimumFractionDigits:digits,maximumFractionDigits:digits});if(p<1)requestAnimationFrame(step);else el.textContent=text;};
  requestAnimationFrame(step);
 });
}
const inkMemory=new Map();
function placeTabInk(){
 document.querySelectorAll('.tabs').forEach((tabsEl,n)=>{
  const ink=tabsEl.querySelector('.tab-ink'),active=tabsEl.querySelector('button.active');if(!ink)return;if(!active){ink.style.opacity=0;return;}
  const key=tabsEl.className+'|'+n,last=inkMemory.get(key),to={left:active.offsetLeft,width:active.offsetWidth};
  if(last&&!reducedMotion()){ink.style.transition='none';ink.style.transform=`translateX(${last.left}px)`;ink.style.width=last.width+'px';ink.getBoundingClientRect();ink.style.transition='';}
  ink.style.transform=`translateX(${to.left}px)`;ink.style.width=to.width+'px';inkMemory.set(key,to);
 });
}
function afterRender(){
 const t=state.transition;state.transition=null;
 if(t&&!reducedMotion()){main.classList.remove('enter-left','enter-right','enter-zoom','enter-fade','enter-close');void main.offsetWidth;main.classList.add('enter-'+t);}
 if(state.crossfade){state.crossfade=false;document.querySelectorAll('.coach-result,.coach-sleep .need-row,.schedule').forEach(n=>{n.classList.remove('crossfade');void n.offsetWidth;n.classList.add('crossfade');});}
 animateDials();placeTabInk();hideTip();document.querySelectorAll('svg.scrub').forEach(attachScrub);
 document.querySelectorAll('[data-pager]').forEach(p=>{const dots=p.nextElementSibling?.querySelectorAll('button')||[];p.onscroll=()=>{const i=Math.round(p.scrollLeft/Math.max(1,p.clientWidth));dots.forEach((b,k)=>b.classList.toggle('on',k===i));};});
}
main.addEventListener('animationend',e=>{if(e.target===main)main.classList.remove('enter-left','enter-right','enter-zoom','enter-fade','enter-close');});
// Tooltips: reveal from the top centre of the tapped element.
let tipFor=null;
function hideTip(){document.querySelector('.tip')?.remove();tipFor=null;}
function showTip(el,override){
 const text=override||el.dataset.tip;if(!text)return;if(tipFor===el){hideTip();return;}hideTip();tipFor=el;
 const r=el.getBoundingClientRect(),tip=document.createElement('div');tip.className='tip';tip.setAttribute('role','tooltip');tip.textContent=text;document.body.appendChild(tip);
 const w=Math.min(300,innerWidth-32);tip.style.width=w+'px';
 const left=Math.max(16,Math.min(innerWidth-w-16,r.left+r.width/2-w/2));tip.style.left=left+'px';tip.style.top=(r.bottom+scrollY+8)+'px';
 tip.style.setProperty('--arrow',(r.left+r.width/2-left)+'px');haptic('tick');
}
document.addEventListener('click',e=>{const el=e.target.closest('[data-tip]');if(el&&el.dataset.tip){e.preventDefault();showTip(el);}else if(!e.target.closest('.tip'))hideTip();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideTip();closeDrawer();}if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('[data-tip][role="button"]')){e.preventDefault();showTip(e.target);}});
addEventListener('scroll',()=>{if(tipFor)hideTip();},{passive:true});
// Scrubbable charts: drag or tap to read exact values, with a haptic tick per point.
function attachScrub(svg){
 if(svg.dataset.scrubOn)return;svg.dataset.scrubOn='1';let pts;try{pts=JSON.parse(svg.dataset.points||'[]');}catch{pts=[];}if(!pts.length)return;
 const vb=svg.viewBox.baseVal,ns='http://www.w3.org/2000/svg',line=document.createElementNS(ns,'line'),dot=document.createElementNS(ns,'circle'),host=svg.parentElement,lab=document.createElement('div');
 line.setAttribute('class','scrub-line');dot.setAttribute('class','scrub-dot');dot.setAttribute('r','5.5');svg.append(line,dot);lab.className='scrub-label';lab.setAttribute('role','status');host.classList.add('scrub-host');host.append(lab);
 let last=-1,hideT=null;
 const show=e=>{const r=svg.getBoundingClientRect(),vx=(e.clientX-r.left)/r.width*vb.width;let best=0,bd=Infinity;pts.forEach((p,i)=>{const d=Math.abs(p[0]-vx);if(d<bd){bd=d;best=i;}});const p=pts[best];
  line.setAttribute('x1',p[0]);line.setAttribute('x2',p[0]);line.setAttribute('y1',0);line.setAttribute('y2',vb.height);dot.setAttribute('cx',p[0]);dot.setAttribute('cy',p[1]);svg.classList.add('scrubbing');
  lab.textContent=p[2];const hr=host.getBoundingClientRect(),px=r.left-hr.left+p[0]/vb.width*r.width;lab.style.left=Math.max(4,Math.min(hr.width-lab.offsetWidth-4,px-lab.offsetWidth/2))+'px';lab.style.top=(r.top-hr.top)+'px';lab.classList.add('on');
  if(best!==last){last=best;haptic('tick');}clearTimeout(hideT);};
 const end=()=>{clearTimeout(hideT);hideT=setTimeout(()=>{svg.classList.remove('scrubbing');lab.classList.remove('on');last=-1;},1600);};
 svg.addEventListener('pointerdown',e=>{try{svg.setPointerCapture(e.pointerId);}catch{}show(e);});
 svg.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||svg.hasPointerCapture?.(e.pointerId))show(e);});
 ['pointerup','pointercancel'].forEach(t=>svg.addEventListener(t,end));svg.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')end();});
}
// Long press: peek at an explanation without navigating.
let lpTimer=null,lpFired=false,lpStart=null;
document.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-longtip]');if(!el)return;lpFired=false;lpStart=[e.clientX,e.clientY];clearTimeout(lpTimer);lpTimer=setTimeout(()=>{lpFired=true;haptic('select');showTip(el,el.dataset.longtip);el.classList.add('peeking');setTimeout(()=>el.classList.remove('peeking'),300);},430);});
document.addEventListener('pointermove',e=>{if(lpStart&&Math.hypot(e.clientX-lpStart[0],e.clientY-lpStart[1])>10){clearTimeout(lpTimer);lpStart=null;}});
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,()=>{clearTimeout(lpTimer);lpStart=null;}));
document.addEventListener('click',e=>{if(lpFired&&e.target.closest('[data-longtip]')){e.preventDefault();e.stopImmediatePropagation();lpFired=false;}},true);
document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-longtip],.scrub'))e.preventDefault();});
// Drawer (mobile).
function openDrawer(){if(!document.body.classList.contains('drawer-open')){const y=scrollY;document.body.dataset.lockY=y;document.body.style.top=`-${y}px`;}document.body.classList.add('drawer-open');$('.sidebar').setAttribute('aria-hidden','false');haptic('tick');$('.sidebar .nav-link.active, .sidebar .nav-link')?.focus({preventScroll:true});}
function closeDrawer(){if(!document.body.classList.contains('drawer-open'))return;document.body.classList.remove('drawer-open');const y=Number(document.body.dataset.lockY||0);document.body.style.top='';window.scrollTo({top:y,behavior:'instant'});}
// Swipe: left/right between days on content; from the left edge opens the drawer; swipe the drawer closed.
let touch=null;
addEventListener('touchstart',e=>{if(e.touches.length!==1||$('#modal').open)return;const t=e.touches[0];touch={x:t.clientX,y:t.clientY,t:performance.now(),target:e.target,drawer:document.body.classList.contains('drawer-open')};},{passive:true});
addEventListener('touchmove',e=>{if(!touch||touch.drawer||!document.body.classList.contains('swipe-days')||touch.x<24)return;const t=e.touches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;if(Math.abs(dx)>Math.abs(dy)*1.4&&Math.abs(dx)>12&&!touch.target.closest('input,textarea,select,.scrub,.pager,dialog')){main.style.transition='none';main.style.transform=`translateX(${dx*.25}px)`;main.style.opacity=String(1-Math.min(.35,Math.abs(dx)/600));}},{passive:true});
addEventListener('touchend',async e=>{
 if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y,fast=performance.now()-touch.t<700,start=touch;touch=null;
 main.style.transition='transform 160ms var(--ease-out), opacity 160ms';main.style.transform='';main.style.opacity='';
 const horizontal=Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.4&&fast;if(!horizontal)return;
 if(start.drawer){if(dx<0)closeDrawer();return;}
 if(start.x<24&&dx>0&&innerWidth<=600){openDrawer();return;}
 if(!document.body.classList.contains('swipe-days')||start.target.closest('input,textarea,select,.scrub,.pager,dialog'))return;
 if(dx<0&&state.date>=today()){haptic('warn');return;}
 await action(dx>0?'previous-day':'next-day');
},{passive:true});
// Calendar month view coloured by score.
function dayScores(date){
 if(state.mode==='demo')return date>today()?null:demoHistory(date,1)[0].scores;
 for(const {data:dd} of dayCache.values()){const h=dd.history?.find(x=>x.date===date);if(h)return h.scores;}
 return null;
}
function calColor(metric,v){if(v==null)return null;if(metric==='recovery')return v>=67?'var(--lime)':v>=34?'var(--yellow)':'var(--red)';if(metric==='strain')return `color-mix(in srgb,var(--blue) ${Math.round(25+75*v/21)}%,transparent)`;return `color-mix(in srgb,var(--purple) ${Math.round(25+75*v/100)}%,transparent)`;}
const failedMonths=new Set();
async function ensureMonth(month){
 if(state.mode!=='live'||failedMonths.has(month))return;const [y,mo]=month.split('-').map(Number),last=new Date(y,mo,0).toLocaleDateString('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'}),target=last>today()?today():last;
 if(target<`${month}-01`||dayScores(target)||dayCache.has(target)||state.calLoading===target)return;
 state.calLoading=target;try{const d=await fetchDay(target);dayCache.set(target,{data:d,at:Date.now()});}catch{failedMonths.add(month);}finally{state.calLoading=null;if($('#modal').open&&$('.calendar'))openCalendar();if(state.page==='profile')render();}
}
function openCalendar(){
 const month=state.calMonth||state.date.slice(0,7),metric=state.calMetric||'recovery',[y,mo]=month.split('-').map(Number),first=new Date(y,mo-1,1),days=new Date(y,mo,0).getDate(),lead=first.getDay();
 const cells=Array.from({length:lead},()=>'<span></span>').concat(Array.from({length:days},(_,i)=>{const date=`${month}-${String(i+1).padStart(2,'0')}`,sc=dayScores(date),v=sc?.[metric],c=calColor(metric,v),future=date>today();
  return `<button class="cal-day${date===state.date?' selected':''}${date===today()?' today':''}" data-action="pick-day" data-date="${date}" ${future?'disabled':''} style="${c?`--day:${c}`:''}" aria-label="${new Date(date+'T12:00:00').toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'})}${v!=null?`, ${metric} ${metric==='strain'?number(v,1):v+'%'}`:''}"><span>${i+1}</span>${v!=null?`<i></i>`:''}</button>`;}));
 const vals=Array.from({length:days},(_,i)=>dayScores(`${month}-${String(i+1).padStart(2,'0')}`)?.[metric]).filter(v=>v!=null);
 const summary=vals.length?(metric==='recovery'?`Average ${Math.round(mean(vals))}% · ${vals.filter(v=>v>=67).length} green days`:metric==='strain'?`Average strain ${number(mean(vals),1)} · peak ${number(Math.max(...vals),1)}`:`Average sleep score ${Math.round(mean(vals))}%`):(state.calLoading?'Loading this month…':'No scores for this month yet.');
 const nextDisabled=month>=today().slice(0,7);
 modal('Calendar',`<div class="calendar ${state.calDir?'cal-'+state.calDir:''}"><div class="cal-head"><button data-action="cal-prev" aria-label="Previous month">‹</button><strong>${first.toLocaleDateString([],{month:'long',year:'numeric'})}</strong><button data-action="cal-next" aria-label="Next month" ${nextDisabled?'disabled':''}>›</button></div><div class="cal-metrics" role="group" aria-label="Colour days by">${['recovery','strain','sleep'].map(k=>`<button data-action="cal-metric" data-metric="${k}" class="${metric===k?'active':''}" aria-pressed="${metric===k}">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</div><div class="cal-week">${[0,1,2,3,4,5,6].map(i=>`<span>${new Date(2023,0,1+i).toLocaleDateString([],{weekday:'narrow'})}</span>`).join('')}</div><div class="cal-grid">${cells.join('')}</div><p class="cal-summary">${summary}</p></div>`);
 state.calDir=null;ensureMonth(month);
}
$('#modal').addEventListener('touchstart',e=>{if(!e.target.closest('.cal-grid'))return;const t=e.touches[0];$('#modal').dataset.sx=t.clientX;},{passive:true});
$('#modal').addEventListener('touchend',async e=>{const sx=Number($('#modal').dataset.sx);delete $('#modal').dataset.sx;if(!sx||!e.target.closest('.cal-grid'))return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50){if(dx<0&&(state.calMonth||'')>=today().slice(0,7))return;await action(dx>0?'cal-prev':'cal-next');}},{passive:true});
setInterval(()=>{if(state.mode==='live'&&!state.loading)navigation();},60000);
window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));
navigate(location.hash.slice(1),true);
await status();
const connection=new URLSearchParams(location.search).get('connection');
if(connection){history.replaceState(null,'',location.pathname+location.hash);if(connection==='success')toast(firstName()?`Welcome, ${firstName()}. Your Fitbit is connected.`:'Your Fitbit is connected.');else if(connection==='denied')toast('Google sign-in was cancelled. Your account is not connected.');else if(connection==='account_not_linked')toast('Sign in to the Google Health app with your Fitbit account, then reconnect.');}
if(state.status?.connected)await refresh();else{state.mode='demo';state.loading=false;render();}
