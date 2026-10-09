'use strict';
/* Set Defteri — durum, kayıt ve ayarlar (tarayıcı hafızası) */
/* ---------- Kullanıcı programı ve ayarlar ---------- */
const DEFAULT_PLAN=(()=>{const o={};for(const [p,P] of Object.entries(PROGRAMS)){o[p]={};for(const d of ['A','B'])o[p][d]=P.days[d].ex.map(k=>({k}))}return o})();
let plans=lsGet('ad-plans',null)||JSON.parse(JSON.stringify(DEFAULT_PLAN));
function fixPlans(){if(!plans||typeof plans!=='object')plans={};['salon','ev'].forEach(p=>{plans[p]=plans[p]||{};['A','B'].forEach(d=>{if(!Array.isArray(plans[p][d]))plans[p][d]=JSON.parse(JSON.stringify(DEFAULT_PLAN[p][d]))})})}
fixPlans();
function savePlans(){lsSet('ad-plans',plans);cloudSave('meta',0,{plans})}
function baseKeys(p,d){return (plans[p][d]||[]).map(x=>x.k).filter(k=>LIB[k])}
function Ecfg(p,d,k){const ent=(plans[p][d]||[]).find(x=>x.k===k),b=LIB[k];return ent&&(ent.s||ent.reps)?Object.assign({},b,ent.s?{s:ent.s}:{},ent.reps?{reps:ent.reps}:{}):b}
function E(k){return Ecfg(prog,day,k)}
const settings=Object.assign({goal:3,restBig:120,restMid:90,restIso:60,ss:20,theme:'system',unit:'kg',sound:true,vib:true},lsGet('ad-settings',{}));
function saveSettings(){lsSet('ad-settings',settings);cloudSave('meta',0,{settings})}
let editing=false;
let vmode=lsGet('ad-vmode','video');
/* ---------- State ---------- */
let tab=lsGet('ad-tab','home');if(tab==='kilo')tab='karne';if(tab==='lib')tab='w';
let prog=lsGet('ad-prog','salon');
let day=null;
let drafts=lsGet('ad-drafts',{});
let sessions=[],weights=[];
let mode='local';
let openEx=null,pendingDel=null,pendingRender=false,saving=false,saveErr='';

function sortedSessions(){return [...sessions].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))}
function nextDay(p){const s=sortedSessions().find(x=>x.program===p);return s?(s.day==='A'?'B':'A'):'A'}
function lastFor(k){for(const s of sortedSessions()){const e=s.ex&&s.ex[k];if(e&&e.some(x=>x.done))return {s,sets:e.filter(x=>x.done)}}return null}
function draftKey(){return prog+'-'+day}
function getDraft(){const k=draftKey();if(!drafts[k]){drafts[k]={date:today(),ex:{},cardio:''}}return drafts[k]}
function saveDrafts(){lsSet('ad-drafts',drafts)}
function exSets(k){const d=getDraft(),e=E(k);let a=d.ex[k];if(!a)a=d.ex[k]=[];while(a.length<e.s)a.push({kg:a.length?a[0].kg:'',reps:'',done:false});if(a.length>e.s&&!a.slice(e.s).some(x=>x.done))a.length=e.s;return a}
function draftHasData(d){return d&&(Object.values(d.ex||{}).some(a=>a.some(x=>x.done||x.kg!==''||x.reps!==''))||d.cardio)}
function loadLocal(){sessions=lsGet('ad-sessions',[]);weights=lsGet('ad-weights',[{date:'2026-10-07',kg:95}])}
function persist(){lsSet('ad-sessions',sessions);lsSet('ad-weights',weights)}
async function addSession(doc){const id='s'+Date.now();sessions=[{id,...doc},...sessions];persist();cloudSave('sessions',id,doc)}
async function delSession(id){sessions=sessions.filter(s=>s.id!==id);persist();cloudSave('sessions',id,null)}
async function setWeight(date,kg){weights=[...weights.filter(x=>x.date!==date),{date,kg}];persist();cloudSave('weights',date,{date,kg})}
async function delWeight(date){weights=weights.filter(x=>x.date!==date);persist();cloudSave('weights',date,null)}
function exportData(){
  const blob=new Blob([JSON.stringify({app:'antrenman-defteri',v:1,exportedAt:new Date().toISOString(),sessions,weights},null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='antrenman-yedek-'+today()+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
}
function importData(file){
  const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.sessions)||!Array.isArray(d.weights))throw 0;
    const ids=new Set(sessions.map(s=>s.id));d.sessions.forEach(s=>{if(s&&s.id&&!ids.has(s.id))sessions.push(s)});
    const wd=new Map(weights.map(w=>[w.date,w]));d.weights.forEach(w=>{if(w&&w.date)wd.set(w.date,w)});weights=[...wd.values()];
    persist();if(fbUser){sessions.forEach(s=>{const {id,...d}=s;cloudSave('sessions',id,d)});weights.forEach(w=>cloudSave('weights',w.date,w))}render();toast('Yedek geri yüklendi')}catch(e){toast('Bu dosya bir Set Defteri yedeği değil')}};
  r.readAsText(file);
}
function restFor(e){return e.rest>=120?settings.restBig:e.rest>=90?settings.restMid:settings.restIso}
function U(e){return (e&&e.unit)||settings.unit}
/* ---------- Hafta ve seri ---------- */
function weekStart(t){const d=new Date(t);d.setHours(0,0,0,0);const wd=(d.getDay()+6)%7;d.setDate(d.getDate()-wd);return d.getTime()}
function weekCount(ws){const we=ws+7*864e5;return sessions.filter(s=>(s.createdAt||0)>=ws&&(s.createdAt||0)<we).length}
function streak(){
  let ws=weekStart(Date.now()),n=0;
  if(weekCount(ws)>=settings.goal)n++;
  for(let i=0;i<200;i++){ws-=7*864e5;if(weekCount(ws)>=settings.goal)n++;else break}
  return n;
}

