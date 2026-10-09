'use strict';
/* Set Defteri — profil, yağ oranı, kalori ve kişiye özel program üretici.
   Dayandığı genel ilkeler: kas grubu başına haftada en az ~10 set, her kası haftada en az 2 kez çalıştırmak,
   güç için ağır ve az tekrar, kas için orta tekrar; yağ kaybında haftada vücut ağırlığının ~%0,5-1'i;
   protein ~1,6-2,2 g/kg. Yağ oranı: ABD Donanması çevre ölçüsü formülü. */

let profile=lsGet('ad-profile',null);
function saveProfile(p){profile=p;lsSet('ad-profile',p);cloudSave('meta',0,{profile:p})}

/* ---------- Hesaplamalar ---------- */
function navyBF(p){
  const h=+p.height,n=+p.neck,w=+p.waist,hip=+p.hip;
  if(!h||!n||!w)return null;
  let bf;
  if(p.sex==='f'){if(!hip||w+hip-n<=0)return null;bf=495/(1.29579-0.35004*Math.log10(w+hip-n)+0.22100*Math.log10(h))-450}
  else{if(w-n<=0)return null;bf=495/(1.0324-0.19077*Math.log10(w-n)+0.15456*Math.log10(h))-450}
  return bf>2&&bf<70?Math.round(bf*10)/10:null;
}
function bfCategory(bf,sex){
  if(bf==null)return '';
  const t=sex==='f'?[14,21,25,32]:[6,14,18,25];
  return bf<t[0]?'Çok düşük (yarışmacı seviyesi)':bf<t[1]?'Atletik':bf<t[2]?'Fit':bf<t[3]?'Ortalama':'Yüksek';
}
function calcNutrition(p){
  const w=+p.weight,h=+p.height,a=+p.age,bf=navyBF(p);
  const lbm=bf!=null?w*(1-bf/100):null;
  const bmr=lbm!=null?370+21.6*lbm:(10*w+6.25*h-5*a+(p.sex==='f'?-161:5));
  const base={sit:1.2,stand:1.3,phys:1.45}[p.activity]||1.2;
  const tdee=bmr*(base+0.035*(+p.days||3));
  let kcal=tdee,why='';
  const high=bf!=null&&bf>(p.sex==='f'?32:25);
  if(a<18){kcal=tdee;why='18 yaşından küçükler için kalori açığı önerilmez; günlük ihtiyacın kadar ye.'}
  else if(p.goal==='fat'){kcal=tdee*(high?0.78:0.85);why='Haftada vücut ağırlığının yaklaşık %0,5-1\'i kadar yağ kaybı hedeflenir; bu hız kası korumaya yardım eder.'}
  else if(p.goal==='muscle'){kcal=tdee*(p.exp==='new'?1.10:1.05);why='Küçük bir kalori fazlası kas yapımını destekler, fazlası yağ olarak birikir.'}
  else if(p.goal==='recomp'){kcal=tdee*(high?0.9:0.97);why='İhtiyacına yakın kalori ve yüksek proteinle aynı anda yağ kaybedip kas kazanılabilir, özellikle yeni başlayanlarda.'}
  else if(p.goal==='strength'){kcal=tdee*1.03;why='Güç kazanmak için yeterli enerji önemli; ihtiyacının biraz üstünde ye.'}
  else{kcal=tdee;why='Kilonu korumak için ihtiyacın kadar ye.'}
  const floor=Math.max(bmr,p.sex==='f'?1400:1600);if(kcal<floor)kcal=floor;
  kcal=Math.round(kcal/10)*10;
  let protein=Math.round(Math.min(2.2*w,Math.max(1.6*w,lbm!=null?2.2*lbm:1.8*w)));
  let fat=Math.round(Math.max(0.6*w,Math.min(0.9*w,kcal*0.27/9)));
  let carb=Math.round((kcal-protein*4-fat*9)/4);
  if(carb<50){fat=Math.round(0.6*w);carb=Math.max(0,Math.round((kcal-protein*4-fat*9)/4))}
  const weekly=Math.round((kcal-tdee)*7/7700*100)/100;
  return {bf,lbm:lbm!=null?Math.round(lbm*10)/10:null,bmr:Math.round(bmr),tdee:Math.round(tdee),kcal,protein,fat,carb,weekly,why,cat:bfCategory(bf,p.sex)};
}

/* ---------- Program üretici ---------- */
const SLOTS={
  salon:{
    sq:['squat','legpress','gobletsquat'],sq2:['legpress','gobletsquat','lunge'],hinge:['rdl','hipthrust','legcurl'],ham:['legcurl','rdl'],glute:['hipthrust'],
    ph:['bench','dbbench','machinechest'],ph2:['dbbench','machinechest','pushup'],pi:['incline','inclinebar','machinechest'],pv:['ohp','machineshoulder'],
    lv:['pulldown','pullup'],lv2:['pullup','pulldown'],lh:['seatedrow','csrow','dbrow'],lh2:['csrow','dbrow','seatedrow'],
    lat:['lateral','cablelateral'],fly:['crossover','pecdeck','dbfly'],bi:['curl','cablecurl'],bi2:['hammer','cablecurl'],tri:['pushdown','ohext'],tri2:['ohext','pushdown','dips'],
    core:['plank','deadbug'],core2:['legraise','cablecrunch','deadbug'],rear:['ytw']
  },
  ev:{
    sq:['bwsquat','lunge'],sq2:['lunge','bwsquat'],hinge:['bridge'],ham:['bridge'],glute:['bridge'],
    ph:['pushup'],ph2:['pushup'],pi:['pushup'],pv:['pike'],lv:['bagrow'],lv2:['bagrow'],lh:['bagrow'],lh2:['bagrow'],
    lat:['ytw'],fly:[],bi:[],bi2:[],tri:[],tri2:[],core:['plank','deadbug'],core2:['deadbug','plank'],rear:['ytw']
  }
};
const SLOT_MUSCLE={sq:'quads',sq2:'quads',hinge:'hams',ham:'hams',glute:'glutes',ph:'chest',ph2:'chest',pi:'chest',fly:'chest',pv:'shoulders',lat:'shoulders',rear:'back',lv:'back',lv2:'back',lh:'back',lh2:'back',bi:'biceps',bi2:'biceps',tri:'triceps',tri2:'triceps',core:'core',core2:'core'};
const MAIN_SLOTS=new Set(['sq','hinge','ph','pi','pv','lv','lh']);
const TEMPLATES={
  F1:{t:'Tüm vücut',s:['sq','ph','lh','pv','lat','bi','tri','core']},
  F2:{t:'Tüm vücut',s:['hinge','lv','pi','lh2','fly','bi2','tri2','core2']},
  F3:{t:'Tüm vücut',s:['sq2','ph2','lv2','pv','ham','lat','core']},
  U1:{t:'Üst vücut',s:['ph','lv','pv','lh','lat','bi','tri']},
  L1:{t:'Alt vücut',s:['sq','hinge','sq2','ham','glute','core']},
  U2:{t:'Üst vücut',s:['pi','lh2','pv','lv2','fly','bi2','tri2']},
  L2:{t:'Alt vücut',s:['hinge','sq2','ham','glute','core2']},
  PU:{t:'İtiş',s:['ph','pv','pi','lat','fly','tri']},
  PL:{t:'Çekiş',s:['lv','lh','lh2','rear','bi','bi2']},
  LG:{t:'Bacak',s:['sq','hinge','sq2','ham','glute','core']}
};
const SPLITS={2:['F1','F2'],3:['F1','F2','F3'],4:['U1','L1','U2','L2'],5:['U1','L1','PU','PL','LG'],6:['PU','PL','LG','PU','PL','LG']};
const INJURY_EX={
  shoulder:['ohp','machineshoulder','pike','dips','inclinebar','bench'],
  back:['squat','rdl','legraise','bagrow'],
  knee:['squat','lunge','gobletsquat','bwsquat'],
  elbow:['dips','ohext']
};
function buildProgram(p){
  const place=p.place==='ev'?'ev':'salon',days=Math.min(6,Math.max(2,+p.days||3)),split=SPLITS[days];
  const banned=new Set((p.injuries||[]).flatMap(i=>INJURY_EX[i]||[]));
  const target={new:10,mid:14,adv:18}[p.exp]||10;
  const pick=(slot,used)=>(SLOTS[place][slot]||[]).find(k=>LIB[k]&&!banned.has(k)&&!used.has(k));
  // 1) her güne hareketleri seç
  let sessions=split.map(id=>{const used=new Set();const items=[];TEMPLATES[id].s.forEach(slot=>{const k=pick(slot,used);if(k){used.add(k);items.push({slot,k})}});return {id,items}});
  // 2) haftalık set hedefini kas gruplarına dağıt
  const count={};sessions.forEach(s=>s.items.forEach(x=>{const m=SLOT_MUSCLE[x.slot];count[m]=(count[m]||0)+1}));
  sessions.forEach(s=>s.items.forEach(x=>{
    const e=LIB[x.k],m=SLOT_MUSCLE[x.slot],arm=m==='biceps'||m==='triceps';
    const t=m==='core'?3*count[m]:arm?Math.round(target*0.6):target;
    const main=MAIN_SLOTS.has(x.slot)&&e.t!=='bw';
    const cap=MAIN_SLOTS.has(x.slot)?({new:3,mid:4,adv:5}[p.exp]||4):3;
    x.s=m==='core'?3:Math.max(2,Math.min(cap,Math.round(t/count[m])));
    if(e.t==='sn')x.reps={new:30,mid:45,adv:60}[p.exp]||30;
    else if(e.t==='bw')x.reps=e.reps;
    else if(main)x.reps=p.goal==='strength'?5:p.goal==='health'?10:8;
    else x.reps=/lat|fly|bi|tri|rear/.test(x.slot)?12:10;
    if(main&&p.goal==='strength')x.s=Math.min(5,x.s+1);
  }));
  // 3) seans süresine sığdır (set başına ~2,6 dk + 10 dk ısınma)
  const cap=+p.duration||60;
  sessions.forEach(s=>{
    const mins=()=>10+s.items.reduce((n,x)=>n+x.s*2.6,0);
    const acc=x=>!MAIN_SLOTS.has(x.slot)&&SLOT_MUSCLE[x.slot]!=='core';
    for(let g=0;g<60&&mins()>cap;g++){
      const hi=s.items.filter(x=>!MAIN_SLOTS.has(x.slot)&&x.s>2).sort((a,b)=>b.s-a.s)[0];if(hi){hi.s--;continue}
      const mh=s.items.filter(x=>MAIN_SLOTS.has(x.slot)&&x.s>3).sort((a,b)=>b.s-a.s)[0];if(mh){mh.s--;continue}
      const drop=[...s.items].reverse().find(acc);if(drop){s.items.splice(s.items.indexOf(drop),1);continue}
      const core=s.items.find(x=>SLOT_MUSCLE[x.slot]==='core');if(core){s.items.splice(s.items.indexOf(core),1);continue}
      const m2=s.items.filter(x=>x.s>2).sort((a,b)=>b.s-a.s)[0];if(m2)m2.s--;else break;
    }
  });
  // 4) başlıklar
  const seen={};const keys='ABCDEF'.split('').slice(0,days);
  const titles={},out={order:keys,titles,gen:true};
  sessions.forEach((s,i)=>{const t=TEMPLATES[s.id].t;seen[t]=(seen[t]||0)+1;const tot=split.filter(x=>TEMPLATES[x].t===t).length;titles[keys[i]]=tot>1?t+' '+seen[t]:t;
    out[keys[i]]=s.items.map(x=>({k:x.k,s:x.s,reps:x.reps}))});
  return {place,plan:out};
}

/* ---------- Sihirbaz ---------- */
let wiz=null;
const WIZ_STEPS=5;
function startWizard(){wiz={step:0,d:Object.assign({sex:'m',activity:'sit',exp:'mid',goal:'recomp',days:3,duration:60,place:'salon',injuries:[]},profile||{})};if(!wiz.d.weight){const w=[...weights].sort((a,b)=>a.date<b.date?-1:1).pop();if(w)wiz.d.weight=w.kg}tab='home';render();window.scrollTo(0,0)}
function wizField(id,label,unit,hint){return `<label class="wf" for="wz-${id}"><span class="lbl">${label}</span><span class="field"><input id="wz-${id}" data-wz="${id}" inputmode="decimal" value="${esc(wiz.d[id]??'')}" placeholder="${hint||''}"><span>${unit}</span></span></label>`}
function wizChoice(id,opts,multi){return `<div class="wch${opts.length>3?' col':''}">${opts.map(([v,t,sub])=>{const on=multi?(wiz.d[id]||[]).includes(v):String(wiz.d[id])===String(v);return `<button type="button" class="chc" data-wzc="${id}" data-v="${v}" ${multi?'data-multi="1"':''} aria-pressed="${on}"><b>${t}</b>${sub?`<small>${sub}</small>`:''}</button>`}).join('')}</div>`}
function wizView(){
  const s=wiz.step,d=wiz.d;let body='',title='';
  if(s===0){title='Seni tanıyalım';body=`<span class="lbl">Cinsiyet</span>${wizChoice('sex',[['m','Erkek'],['f','Kadın']])}<div class="wgrid">${wizField('age','Yaş','yaş','30')}${wizField('height','Boy','cm','178')}${wizField('weight','Kilo','kg','95')}</div>`}
  if(s===1){title='Ölçüler';body=`<p class="note">Yağ oranını hesaplamak için mezura ile ölç. Sabah, aç karnına, nefes verirken ölçmek en doğrusu.</p><div class="wgrid">${wizField('neck','Boyun','cm','40')}${wizField('waist',d.sex==='f'?'Bel (en ince yer)':'Bel (göbek deliği hizası)','cm','100')}${d.sex==='f'?wizField('hip','Kalça (en geniş yer)','cm','105'):''}</div><p class="note small">Boyun: gırtlağın hemen altından. Ölçemiyorsan boş bırak; yağ oranı olmadan da hesaplarım ama daha kaba olur.</p>`}
  if(s===2){title='Günlük yaşam ve deneyim';body=`<span class="lbl">Gün içinde ne kadar hareketlisin?</span>${wizChoice('activity',[['sit','Masa başı','Çoğunlukla oturuyorum'],['stand','Ayakta','Gün içinde sık yürüyorum'],['phys','Fiziksel iş','Bedenen çalışıyorum']])}<span class="lbl">Ağırlık antrenmanı deneyimin</span>${wizChoice('exp',[['new','Yeni başlıyorum','6 aydan az'],['mid','Orta','6 ay - 2 yıl'],['adv','İleri','2 yıldan fazla']])}`}
  if(s===3){title='Hedefin ne?';body=wizChoice('goal',[['fat','Yağ yakmak','Kilo vermek, incelmek'],['muscle','Kas kazanmak','Büyümek, kilo almak'],['recomp','Sıkılaşmak','Yağ verip kas kazanmak'],['strength','Güçlenmek','Daha ağır kaldırmak'],['health','Formda kalmak','Sağlıklı ve aktif olmak']])}
  if(s===4){title='Antrenman planı';body=`<span class="lbl">Haftada kaç gün?</span>${wizChoice('days',[[2,'2'],[3,'3'],[4,'4'],[5,'5'],[6,'6']])}<span class="lbl">Bir antrenman ne kadar sürsün?</span>${wizChoice('duration',[[45,'45 dk'],[60,'60 dk'],[75,'75 dk'],[90,'90 dk']])}<span class="lbl">Nerede?</span>${wizChoice('place',[['salon','Salonda'],['ev','Evde']])}<span class="lbl">Ağrı ya da sakatlık var mı? (birden çok seçebilirsin)</span>${wizChoice('injuries',[['shoulder','Omuz'],['back','Bel'],['knee','Diz'],['elbow','Dirsek / bilek']],true)}`}
  if(s===5)return resultView();
  return `<div class="wiz"><div class="wtop"><button type="button" class="back" data-wzback="1">‹ ${s?'Geri':'Vazgeç'}</button><span class="sub">${s+1} / ${WIZ_STEPS}</span></div><div class="wbar"><i style="width:${(s+1)/WIZ_STEPS*100}%"></i></div><h2 class="sh">${title}</h2>${body}${wiz.err?`<p class="msg err">${esc(wiz.err)}</p>`:''}<button type="button" class="primary" data-wznext="1">${s===WIZ_STEPS-1?'Sonuçları gör':'Devam'}</button></div>`;
}
function wizValidate(){
  const d=wiz.d,s=wiz.step,n=k=>{const v=num(d[k]);return v};
  if(s===0){const a=n('age'),h=n('height'),w=n('weight');if(!a||a<14||a>90)return 'Yaşını gir (14-90).';if(!h||h<130||h>230)return 'Boyunu santimetre olarak gir.';if(!w||w<35||w>250)return 'Kilonu gir.';d.age=a;d.height=h;d.weight=w}
  if(s===1){['neck','waist','hip'].forEach(k=>{d[k]=num(d[k])});if(d.neck&&d.waist&&navyBF(d)==null)return 'Ölçüler tutarsız görünüyor; boyun ve beli tekrar kontrol et ya da boş bırak.'}
  return '';
}
function resultView(){
  const d=wiz.d,N=calcNutrition(d),G=buildProgram(d);wiz.gen=G;
  const tile=(l,v)=>`<div class="tile"><span class="lbl">${l}</span><strong>${v}</strong></div>`;
  const goalTxt={fat:'Yağ yakmak',muscle:'Kas kazanmak',recomp:'Sıkılaşmak',strength:'Güçlenmek',health:'Formda kalmak'}[d.goal];
  const pv=G.plan.order.map(k=>`<details class="sess"><summary><span>Gün ${G.plan.order.indexOf(k)+1}</span><span class="sub">${esc(G.plan.titles[k])} · ${G.plan[k].length} hareket</span></summary><ul>${G.plan[k].map(x=>`<li><b>${esc(LIB[x.k].n)}</b><span>${x.s} × ${x.reps}${LIB[x.k].t==='sn'?' sn':''}</span></li>`).join('')}</ul></details>`).join('');
  return `<div class="wiz"><div class="wtop"><button type="button" class="back" data-wzback="1">‹ Geri</button><span class="sub">Sonuç</span></div>
    <h2 class="sh">Senin için hesapladıklarım</h2>
    <div class="tiles">${tile('Yağ oranı',N.bf!=null?fmtN(N.bf)+'<small> %</small>':'–')}${tile('Yağsız kütle',N.lbm!=null?fmtN(N.lbm)+'<small> kg</small>':'–')}${tile('Bazal',N.bmr+'<small> kcal</small>')}${tile('Günlük',N.tdee+'<small> kcal</small>')}</div>
    ${N.bf!=null?`<p class="note">Yağ oranın <b>${esc(N.cat)}</b> aralığında. Bu yöntem ±%3-4 sapabilir; değişimi takip etmek için aynı koşullarda tekrar ölç.</p>`:'<p class="note">Ölçü girmediğin için yağ oranını hesaplamadım; kalori yaş, boy ve kiloya göre.</p>'}
    <section class="panel"><span class="lbl">Hedef: ${esc(goalTxt)}</span>
      <div class="kcal"><strong>${N.kcal}</strong><span>kcal / gün</span></div>
      <div class="macros"><span><b>${N.protein} g</b>protein</span><span><b>${N.carb} g</b>karbonhidrat</span><span><b>${N.fat} g</b>yağ</span></div>
      <p class="note">${esc(N.why)}${N.weekly?` Bu kaloriyle haftada yaklaşık <b>${N.weekly>0?'+':''}${fmtN(N.weekly)} kg</b> değişim beklenir.`:''}</p></section>
    <section class="panel"><span class="lbl">Programın · ${G.place==='ev'?'Ev':'Salon'} · haftada ${d.days} gün · ~${d.duration} dk</span>${pv}
      <p class="note small">Her kas grubu haftada en az 2 kez ve yeterli set sayısıyla çalışacak şekilde dağıtıldı.${(d.injuries||[]).length?' Seçtiğin ağrılı bölgeyi zorlayan hareketler çıkarıldı.':''} Kaydettikten sonra Düzenle'den istediğin gibi değiştirebilirsin.</p></section>
    <button type="button" class="primary" data-wzsave="1">Profili ve programı kaydet</button>
    <p class="note small" style="text-align:center">Mevcut programın yedeklenir; istersen Düzenle ekranından geri dönebilirsin. Sağlık sorunun varsa programa başlamadan önce doktoruna danış.</p></div>`;
}
function wizSave(){
  const d=wiz.d,N=calcNutrition(d),G=wiz.gen||buildProgram(d);
  plans.bak=plans.bak||{};plans.bak[G.place]=JSON.parse(JSON.stringify(plans[G.place]));
  plans[G.place]=G.plan;fixPlans();savePlans();
  const prof=Object.assign({},d,{n:N,updated:Date.now()});delete prof.err;saveProfile(prof);
  if(d.weight&&!weights.some(w=>w.date===today()))setWeight(today(),+d.weight);
  // eski taslakları temizle (gün yapısı değişti)
  Object.keys(drafts).forEach(k=>{if(k.startsWith(G.place+'-'))delete drafts[k]});saveDrafts();
  settings.goal=+d.days||settings.goal;saveSettings();
  prog=G.place;lsSet('ad-prog',prog);day=null;wiz=null;tab='w';lsSet('ad-tab',tab);render();window.scrollTo(0,0);toast('Programın hazır');
}
function profileCard(){
  if(!profile)return `<section class="panel coach"><b>Sana özel program</b><p class="note">Ölçülerini ve hedefini gir; yağ oranını, günlük kalori ve protein ihtiyacını hesaplayıp sana uygun programı kurayım.</p><button type="button" class="primary sm" data-wiz="1">Başla</button></section>`;
  const N=profile.n||calcNutrition(profile);
  return `<section class="panel coach"><div class="row"><span class="lbl">Günlük hedefin</span><button type="button" class="ghost sm" data-wiz="1">Güncelle</button></div>
    <div class="macros"><span><b>${N.kcal}</b>kcal</span><span><b>${N.protein} g</b>protein</span><span><b>${N.carb} g</b>karb.</span><span><b>${N.fat} g</b>yağ</span></div>${N.bf!=null?`<p class="note small">Yağ oranı %${fmtN(N.bf)} · ${esc(N.cat)}</p>`:''}</section>`;
}
