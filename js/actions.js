'use strict';
/* Set Defteri — kaydetme ve dokunma olayları */
async function finish(){
  const d=getDraft(),P=PROGRAMS[prog];
  const ex={};
  curList().forEach(k=>{const e=E(k);const a=exSets(k).map(x=>({kg:e.t==='kg'?num(x.kg):null,reps:num(x.reps),done:!!x.done}));if(a.some(x=>x.done))ex[k]=a});
  const cardio=num(d.cardio);
  if(!Object.keys(ex).length&&!cardio){saveErr='Kaydetmek için en az bir seti ✓ ile işaretle.';render();return}
  saving=true;saveErr='';render();
  const doc={date:d.date||today(),program:prog,day,ex,createdAt:Date.now()};
  if(cardio)doc.cardio=cardio;
  if(d.startedAt)doc.duration=Math.max(1,Math.round((Date.now()-d.startedAt)/60000));
  const hist=sessions.slice();
  try{await addSession(doc);delete drafts[draftKey()];saveDrafts();saving=false;day=null;window.scrollTo(0,0);render();showSummary(doc,hist)}
  catch(e){saving=false;saveErr='Kaydedilemedi. Telefonda yer kalmamış olabilir; tekrar dene.';render()}
}

/* ---------- Events ---------- */
document.addEventListener('click',async ev=>{
  const b=ev.target.closest('button');if(!b){if(ev.target.classList&&ev.target.classList.contains('sheet'))closeSheet();return}
  if(b.dataset.close){closeSheet();return}
  if(b.dataset.settings){openSettings();return}
  if(b.dataset.wiz){closeSheet();startWizard();return}
  if(b.dataset.wzback){if(!wiz)return;if(wiz.step===0)wiz=null;else{wiz.step--;wiz.err=''}render();window.scrollTo(0,0);return}
  if(b.dataset.wznext){if(!wiz)return;const e=wizValidate();wiz.err=e;if(!e)wiz.step++;render();window.scrollTo(0,0);return}
  if(b.dataset.wzc){const id=b.dataset.wzc;let v=b.dataset.v;if(/^\d+$/.test(v))v=+v;if(b.dataset.multi){const a=wiz.d[id]=wiz.d[id]||[];const i=a.indexOf(v);i<0?a.push(v):a.splice(i,1)}else wiz.d[id]=v;render();return}
  if(b.dataset.wzsave){wizSave();return}
  if(b.id==='plrestore'){if(b.dataset.armed){const cur=plans[prog];plans[prog]=plans.bak[prog];plans.bak[prog]=cur;fixPlans();savePlans();day=null;render()}else{b.dataset.armed='1';b.textContent='Emin misin? Tekrar dokun'}return}
  if(b.dataset.lmode){loginMode=b.dataset.lmode;authErr='';const u=$('#lu')?$('#lu').value:'';render();keepLogin(u);return}
  if(b.dataset.tologin){closeSheet();lsSet('ad-guest',false);authErr='';render();window.scrollTo(0,0);return}
  if(b.dataset.guest){lsSet('ad-guest',true);render();return}
  if(b.id==='signout'){if(b.dataset.armed){signOutAll()}else{b.dataset.armed='1';b.textContent='Emin misin? Tekrar dokun'}return}
  if(b.dataset.set){const id=b.dataset.set,[mn,mx,st]=SET_RULES[id];settings[id]=Math.min(mx,Math.max(mn,settings[id]+st*(+b.dataset.d)));saveSettings();openSettings();render();return}
  if(b.dataset.opt){const id=b.dataset.opt;let v=b.dataset.v;if(v==='true')v=true;else if(v==='false')v=false;settings[id]=v;saveSettings();applyTheme();openSettings();render();return}
  if(b.dataset.warmup){openWarmup(prog);return}
  if(b.dataset.wuclose){closeWarmup();return}
  if(b.dataset.wu){if(!wu)return;if(b.dataset.wu==='pause'){if(wu.paused){wu.end+=Date.now()-wu.paused;wu.paused=0}else wu.paused=Date.now()}else{wu.i++;const st=WARMUP[wu.p][wu.i];if(st){wu.end=Date.now()+st.sec*1000;wu.paused=0}}wuTick();return}
  if(b.dataset.start){const [p,d]=b.dataset.start.split('-');closeWarmup();closeSheet();prog=p;day=d;lsSet('ad-prog',prog);tab='w';lsSet('ad-tab',tab);openEx=null;editing=false;render();window.scrollTo(0,0);return}
  if(b.dataset.edit){editing=true;openEx=null;render();window.scrollTo(0,0);return}
  if(b.dataset.editdone){editing=false;render();return}
  if(b.dataset.ed){const L=plans[prog][day],i=+b.dataset.i,x=L[i];if(!x)return;const e=LIB[x.k],c=Ecfg(prog,day,x.k),t=b.dataset.ed;
    if(t==='s')x.s=Math.max(1,Math.min(8,c.s+(+b.dataset.d)));
    else if(t==='r')x.reps=Math.max(1,Math.min(e.t==='sn'?300:50,c.reps+(+b.dataset.d)));
    else if(t==='up'&&i>0)L.splice(i-1,0,L.splice(i,1)[0]);
    else if(t==='down'&&i<L.length-1)L.splice(i+1,0,L.splice(i,1)[0]);
    else if(t==='del')L.splice(i,1);
    savePlans();render();return}
  if(b.dataset.addpick){closeSheet();document.body.insertAdjacentHTML('beforeend',pickerHTML());return}
  if(b.dataset.add){plans[prog][day].push({k:b.dataset.add});savePlans();closeSheet();render();toast(LIB[b.dataset.add].n+' eklendi');return}
  if(b.id==='plreset'){if(b.dataset.armed){plans[prog][day]=JSON.parse(JSON.stringify(DEFAULT_PLAN[prog][day]));savePlans();render()}else{b.dataset.armed='1';b.textContent='Emin misin? Tekrar dokun'}return}
  if(b.dataset.alt){closeSheet();document.body.insertAdjacentHTML('beforeend',altHTML(b.dataset.alt));return}
  if(b.dataset.swapto){const d=getDraft(),from=b.dataset.from,to=b.dataset.swapto,o=origOf(from);d.swap=d.swap||{};if(to===o)delete d.swap[o];else d.swap[o]=to;saveDrafts();closeSheet();openEx=to;try{history.replaceState({ex:to},'')}catch(e){}render();window.scrollTo(0,0);return}
  if(b.dataset.play){openPlayer(b.dataset.play);return}
  if(b.dataset.pclose){closePlayer();return}
  if(b.dataset.vmode){vmode=b.dataset.vmode;lsSet('ad-vmode',vmode);const art=b.closest('article');if(art){const k=art.id.slice(3);art.outerHTML=exCard(k);mountAnims()}return}
  if(b.dataset.sum){const x=sessions.find(z=>z.id===b.dataset.sum);if(x)showSummary(x,sessions.filter(z=>(z.createdAt||0)<(x.createdAt||0)));return}
  if(b.dataset.plan){const [p,dd]=b.dataset.plan.split('-');prog=p;day=dd;lsSet('ad-prog',prog);openEx=null;saveErr='';render();return}
  if(b.dataset.open){openEx=b.dataset.open;try{history.pushState({ex:openEx},'')}catch(e){}render();window.scrollTo(0,0);return}
  if(b.dataset.goto){openEx=b.dataset.goto;try{history.replaceState({ex:openEx},'')}catch(e){}render();window.scrollTo(0,0);return}
  if(b.dataset.back){const k=openEx;if(history.state&&history.state.ex){history.back()}else{openEx=null;render()}setTimeout(()=>{const r=document.querySelector('[data-open="'+k+'"]');if(r)r.scrollIntoView({block:'center'})},80);return}
  if(b.dataset.tab){openEx=null;editing=false;tab=b.dataset.tab;lsSet('ad-tab',tab);pendingDel=null;render();window.scrollTo(0,0);return}
  if(b.dataset.act==='rest-add'){timer.end=Math.max(timer.end,Date.now())+30000;timer.total+=30;if(!timer.iv){timer.iv=setInterval(tick,250);$('#rest').classList.remove('ready')}tick();return}
  if(b.dataset.act==='rest-skip'){clearInterval(timer.iv);timer.iv=null;$('#rest').hidden=true;return}
  if(b.dataset.prog){prog=b.dataset.prog;lsSet('ad-prog',prog);day=null;saveErr='';render();return}
  if(b.dataset.day){day=b.dataset.day;saveErr='';render();return}
  if(b.dataset.chk){
    const k=b.dataset.chk,i=+b.dataset.i,e=E(k),sets=exSets(k),x=sets[i];
    x.done=!x.done;
    if(x.done){
      if(x.reps==='')x.reps=String(e.reps);
      const dd=getDraft();if(!dd.startedAt)dd.startedAt=Date.now();
      if(e.t==='kg'&&x.kg===''){const L=lastFor(k);const v=L&&L.sets[0].kg!=null?String(L.sets[0].kg):'';sets.forEach(z=>{if(z.kg==='')z.kg=v})}
      const nextIdx=sets.findIndex(z=>!z.done);
      let label;if(nextIdx>=0)label=e.n+' · set '+(nextIdx+1);else{const list=curList();const n=list[list.indexOf(k)+1];label=n?LIB[n].n:'Son hareket bitti'}
      const sup=e.ss&&nextIdx>=0;
      startRest(sup?settings.ss:restFor(e),sup?LIB[e.ss].n+' (süper set)':label);
    }
    saveDrafts();const card=$('#ex-'+k);if(card){card.outerHTML=exCard(k);mountAnims()}
    const f=$('#finish');if(f){const list=curList();f.textContent=`Antrenmanı bitir · ${list.reduce((n,z)=>n+exSets(z).filter(q=>q.done).length,0)}/${list.reduce((n,z)=>n+E(z).s,0)} set`}
    return;
  }
  if(b.id==='finish'){finish();return}
  if(b.id==='exp'){exportData();return}
  if(b.id==='reset'){if(b.dataset.armed){delete drafts[draftKey()];saveDrafts();render()}else{b.dataset.armed='1';b.textContent='Emin misin? Tekrar dokun'}return}
  if(b.dataset.del){const id=b.dataset.del;if(pendingDel!==id){pendingDel=id;b.textContent='Silmek için tekrar dokun';return}pendingDel=null;try{await delSession(id);render();toast('Antrenman silindi')}catch(e){toast('Silinemedi, tekrar dene')}return}
  if(b.id==='w-add'){const kg=num($('#w-kg').value),d=$('#w-date').value;if(!kg||!d){toast('Tarih ve kilo gir');return}try{await setWeight(d,kg);render();toast('Kilo eklendi')}catch(e){toast('Kaydedilemedi, tekrar dene')}return}
  if(b.dataset.wdel){try{await delWeight(b.dataset.wdel);render()}catch(e){toast('Silinemedi')}return}
});
document.addEventListener('submit',ev=>{if(ev.target.id==='lform'){ev.preventDefault();loginSubmit()}});
window.addEventListener('popstate',()=>{if(openEx){openEx=null;render()}});
let saveT=null;
document.addEventListener('input',ev=>{
  const t=ev.target;
  if(t.dataset.wz&&wiz){wiz.d[t.dataset.wz]=t.value;return}
  if(t.dataset.f==='kgall'){exSets(t.dataset.k).forEach(x=>x.kg=t.value)}
  else if(t.dataset.f){const sets=exSets(t.dataset.k);sets[+t.dataset.i][t.dataset.f]=t.value}
  else if(t.id==='cardio'){getDraft().cardio=t.value}
  else return;
  clearTimeout(saveT);saveT=setTimeout(saveDrafts,300);
});
document.addEventListener('focusout',()=>{setTimeout(()=>{const a=document.activeElement;if(pendingRender&&!(a&&a.tagName==='INPUT'))render()},50)});

