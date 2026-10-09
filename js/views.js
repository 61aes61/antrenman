'use strict';
/* Set Defteri — ekranlar */
/* ---------- Render ---------- */
function render(){
  pendingRender=false;
  $('#today').textContent=new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'long'});
  document.querySelectorAll('.tabs [data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
  if(tab==='lib')tab='w';
  const TT={home:'Set Defteri',w:'Antrenman Programı',kardiyo:'Kardiyo',beslenme:'Beslenme',karne:'Karne',hist:'Geçmiş'};
  if(!TT[tab])tab='home';
  $('#title').textContent=TT[tab];
  document.body.classList.toggle('nologin',needLogin());
  if(needLogin()){$('#title').textContent='Set Defteri';$('#main').innerHTML=loginView();return}
  $('#main').innerHTML=tab==='home'?homeView():tab==='w'?workoutView():tab==='kardiyo'?soonView('Kardiyo','Yürüyüş, koşu ve bisiklet kayıtların burada olacak.'):tab==='beslenme'?soonView('Beslenme','Öğünlerin ve günlük protein, karbonhidrat, yağ, kalori takibin burada olacak.'):tab==='karne'?karneView()+'<h2 class="hh">Kilo</h2>'+kiloView():histView();
  if(tab==='karne')drawChart();
  mountAnims();
}
function softRender(){const a=document.activeElement;if(a&&a.tagName==='INPUT'&&$('#main').contains(a)){pendingRender=true;return}render()}

function initials(n){const w=n.replace(/[()\/·.]/g,' ').split(/\s+/).filter(Boolean);return (w.length>1?w[0][0]+w[1][0]:w[0].slice(0,2)).toLocaleUpperCase('tr-TR')}
function thumb(k){const e=LIB[k];return `<span class="thumb" style="--g:var(--g-${GROUP[e.r]||'cardio'})" aria-hidden="true">${esc(initials(e.n))}</span>`}
function curList(){const sw=getDraft().swap||{};return baseKeys(prog,day).map(k=>sw[k]||k)}
function progIcon(k){
  const e=E(k),n=exSets(k).filter(x=>x.done).length,C=2*Math.PI*15,f=n/e.s;
  if(n===e.s)return `<svg class="prog" viewBox="0 0 38 38" role="img" aria-label="Tamamlandı"><circle cx="19" cy="19" r="17" style="fill:var(--good);stroke:none"/><path d="M12 19.5l4.5 4.5L26 14.5" style="fill:none;stroke:var(--bg)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `<svg class="prog" viewBox="0 0 38 38" role="img" aria-label="${n}/${e.s} set"><circle cx="19" cy="19" r="15" style="stroke:var(--line)"/>${n?`<circle cx="19" cy="19" r="15" style="stroke:var(--accent)" stroke-dasharray="${(C*f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 19 19)" stroke-linecap="round"/>`:''}<text x="19" y="23.5" text-anchor="middle" font-size="12" font-weight="700" style="fill:var(--muted)">${n}/${e.s}</text></svg>`;
}
function exRow(k){const e=E(k);return `<button type="button" class="exrow" data-open="${k}">${thumb(k)}<span class="txt"><span class="nm">${esc(e.n)}</span><span class="rg"><span class="sr">${e.s} × ${e.reps}${e.t==='sn'?' sn':''}</span> · ${esc(e.r)}</span></span>${progIcon(k)}</button>`}
function dayNo(d){return d==='B'?2:1}
function planName(p,d){return (p==='salon'?'Salon ':'Ev ')+dayNo(d)}
function workoutView(){
  if(!day)day=nextDay(prog);
  if(editing)return editView();
  if(openEx&&curList().includes(openEx))return detailView(openEx);
  openEx=null;
  const P=PROGRAMS[prog],d=getDraft(),list=curList();
  const nd=nextDay(prog),sub={salon:{A:'Göğüs',B:'Sırt'},ev:{A:'',B:''}}[prog];
  let h=`<div class="switch"><div class="mseg" role="group" aria-label="Program">${Object.entries(PROGRAMS).map(([pk,PP])=>`<button type="button" data-prog="${pk}" aria-pressed="${prog===pk}">${pk==='salon'?'Salon':'Ev'}</button>`).join('')}</div>
  <div class="dseg" role="group" aria-label="Gün">${['A','B'].map(x=>`<button type="button" data-day="${x}" aria-pressed="${day===x}">Gün ${dayNo(x)}${sub[x]?' · '+sub[x]:''}${nd===x?'<i>Sıradaki</i>':''}</button>`).join('')}</div></div>
  <details class="notes"><summary><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3L2 20h20z" style="fill:var(--warn)"/><path d="M12 9v5" style="stroke:var(--bg)" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17" r="1.3" style="fill:var(--bg)"/></svg>Antrenman Notları<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary><div class="nb"><p class="note">${esc(P.note)}</p><p class="note">Bir harekete dokun, setlerini orada işaretle. Mavi kutudaki hareketler süper set: arka arkaya yapılır.</p><button type="button" class="ghost" data-warmup="1" style="justify-self:start">Isınmayı başlat</button></div></details>
  <div class="hhrow"><h2 class="hh">Hareketler</h2><button type="button" class="ghost sm" data-edit="1">Düzenle</button></div><div class="list">`;
  for(let i=0;i<list.length;i++){const k=list[i],e=E(k);
    if(e.ss&&list[i+1]===e.ss){h+=`<div class="ssg">${exRow(k)}${exRow(list[i+1])}<span class="ssb">Süper Set</span></div>`;i++}
    else h+=exRow(k);}
  if(P.cardio)h+=`<div class="crow"><span class="thumb" style="--g:var(--g-cardio)" aria-hidden="true">YÜ</span><span class="txt"><span style="font-weight:600;font-size:1.06rem">Eğimli yürüyüş</span><span class="rg">10-15 dk · vaktin daralırsa kısalt</span></span><div class="field"><input id="cardio" inputmode="numeric" value="${esc(d.cardio)}" placeholder="15" aria-label="Yürüyüş dakika"><span>dk</span></div></div>`;
  h+='</div>';
  const doneCount=list.reduce((n,k)=>n+exSets(k).filter(x=>x.done).length,0),total=list.reduce((n,k)=>n+E(k).s,0);
  h+=`<button class="primary" id="finish" ${saving?'disabled':''}>${saving?'Kaydediliyor…':`Antrenmanı bitir · ${doneCount}/${total} set`}</button>`;
  h+=`<p class="msg${saveErr?' err':''}" role="status">${esc(saveErr)}</p>`;
  if(draftHasData(d))h+=`<button class="ghost" id="reset" style="justify-self:start">Bu antrenmanı sıfırla</button>`;
  return h;
}
function detailView(k){
  const list=curList(),i=list.indexOf(k),prev=list[i-1],next=list[i+1];
  return `<button type="button" class="back" data-back="1"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style="fill:none;stroke:currentColor" stroke-width="2.5"><path d="M15 6l-6 6 6 6"/></svg>${esc(planName(prog,day))} · Hareketler</button>
  <div class="altrow">${origOf(k)!==k?`<span class="sub">${esc(LIB[origOf(k)].n)} yerine</span>`:'<span></span>'}<button type="button" class="ghost sm" data-alt="${k}">Alternatif hareket</button></div>
  ${exCard(k)}
  <div class="dnav"><button type="button" ${prev?`data-goto="${prev}"`:'disabled style="opacity:.4"'}>‹ ${prev?esc(LIB[prev].n):'Önceki'}</button><button type="button" class="go" ${next?`data-goto="${next}"`:'data-back="1"'}>${next?esc(LIB[next].n)+' ›':'Listeye dön'}</button></div>`;
}
function exCard(k){
  const e=E(k),sets=exSets(k),L=lastFor(k),pa=L?L.s.ex[k]:null,kg=e.t==='kg';
  let hint='';
  if(L&&L.sets.length>=e.s&&L.sets.every(x=>num(x.reps)>=e.reps))hint=` <span class="up">↑ ${kg?'Ağırlığı artır':e.t==='sn'?'Süreyi uzat':'Zorlaştır'}</span>`;
  const doneN=sets.filter(x=>x.done).length;
  const lastKg=L&&kg?L.sets[0].kg:null;
  const wrow=kg?`<div class="wrow"><label for="kgx-${k}">Ağırlık<small>${lastKg!=null?'Geçen sefer '+esc(fmtN(lastKg))+' '+esc(U(e)):'Tüm setler için'}</small></label><div class="field"><input class="in big" id="kgx-${k}" data-k="${k}" data-f="kgall" inputmode="decimal" value="${esc(sets[0].kg)}" placeholder="${lastKg!=null?esc(fmtN(lastKg)):'0'}" aria-label="Ağırlık"><span>${esc(U(e))}</span></div></div>`:'';
  const hdr=`<div class="set hdr"><span>SET</span><span>ÖNCEKİ</span><span>${e.t==='sn'?'SÜRE (SN)':'TEKRAR'}</span><span></span></div>`;
  const rows=sets.map((x,i)=>{
    const p=pa&&pa[i]&&pa[i].done?pa[i]:null;
    const pv=p?((kg&&p.kg!=null?fmtN(p.kg)+'×':'')+(p.reps==null?'?':p.reps)):'–';
    return `<div class="set${x.done?' done':''}"><span class="sn">${i+1}</span><span class="pv">${esc(pv)}</span><input class="in" id="r-${k}-${i}" data-k="${k}" data-i="${i}" data-f="reps" inputmode="numeric" value="${esc(x.reps)}" placeholder="${e.reps}" aria-label="Set ${i+1} ${e.t==='sn'?'saniye':'tekrar'}"><button type="button" class="chk" data-chk="${k}" data-i="${i}" aria-pressed="${x.done}" aria-label="Set ${i+1} tamam">✓</button></div>`;
  }).join('');
  const hasAnim=window.ExAnim&&ExAnim.has(k),V=VIDEOS[k],showVid=V&&(vmode==='video'||!hasAnim);
  const swap=V&&hasAnim?`<button type="button" class="vswap" data-vmode="${showVid?'cizim':'video'}">${showVid?'Çizime geç':'Videoya geç'}</button>`:'';
  const vid=V?(V.p.match(/-(\d+)\/?$/)||[])[1]:'';
  const video=showVid?`<div class="vbox real"><button type="button" class="vthumb" data-play="${k}" aria-label="${esc(e.n)} videosunu tam ekran oynat"><img src="https://images.pexels.com/videos/${vid}/pexels-photo-${vid}.jpeg?auto=compress&w=640" alt="" onerror="this.remove()"><span class="pbtn" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span><span class="vlbl">Videoyu izle</span></button>${swap}</div><a class="credit" href="${esc(V.p)}" target="_blank" rel="noopener">Video: Pexels</a>`
    :hasAnim?`<div class="vbox" data-anim="${k}" role="img" aria-label="${esc(e.n)} hareket animasyonu"><canvas></canvas><div class="vcap"></div><span class="vhint">Durdurmak için dokun</span>${swap}</div>`:'';
  return `<article class="ex${doneN===e.s?' complete':''}" id="ex-${k}">
    <div class="dhead">${thumb(k)}<div class="dt"><div class="chips"><span class="pill${e.leg?' leg':''}">${esc(e.r)}</span>${e.ss?`<span class="pill ss">Süper set · ${esc(LIB[e.ss].n)}</span>`:''}</div><h3>${esc(e.n)}</h3><div class="meta">${e.s} × ${e.reps}${e.t==='sn'?' sn':''}${e.per?' · '+esc(e.per):''} · ${doneN}/${e.s} set${hint}</div></div></div>
    ${wrow}<div class="sets">${hdr}${rows}</div>
    ${video}
    ${progChart(k)}
    ${howTo(k)}
  </article>`;
}
function openPlayer(k){
  const V=VIDEOS[k],e=LIB[k];if(!V)return;closePlayer();
  document.body.insertAdjacentHTML('beforeend',`<div class="player" role="dialog" aria-modal="true" aria-label="${esc(e.n)} videosu"><div class="ptop"><button type="button" class="pclose" data-pclose="1">✕ Kapat</button><b>${esc(e.n)}</b></div><div class="pcap"></div><video src="${esc(V.u)}" controls autoplay playsinline loop preload="auto"></video><a class="pcredit" href="${esc(V.p)}" target="_blank" rel="noopener">Video: Pexels</a></div>`);
  const pl=document.querySelector('.player'),v=pl.querySelector('video'),cap=pl.querySelector('.pcap'),cues=window.ExAnim?ExAnim.cues(k):[];let i=0;
  if(cues.length){cap.textContent=cues[0];pl._iv=setInterval(()=>{i=(i+1)%cues.length;cap.textContent=cues[i]},3000)}else cap.hidden=true;
  v.addEventListener('error',()=>{cap.hidden=false;cap.textContent='Video yüklenemedi. İnternet bağlantını kontrol et.'});
  v.play().catch(()=>{});
}
function closePlayer(){document.querySelectorAll('.player').forEach(p=>{clearInterval(p._iv);const v=p.querySelector('video');if(v){v.pause();v.removeAttribute('src');v.load()}p.remove()})}
function progChart(k){
  const e=LIB[k],kg=e.t==='kg';
  const pts=[...sessions].sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)).map(s=>{const a=s.ex&&s.ex[k];if(!a)return null;const b=bestOf(e,a.filter(z=>z.done));if(!b)return null;const v=kg?b.kg:b.reps;return v==null?null:{d:s.date,v,r:b.reps}}).filter(Boolean).slice(-12);
  const unit=kg?U(e):e.t==='sn'?'sn':'tekrar';
  if(!pts.length)return `<div class="pchart"><div class="pc-h"><b>İlerleme</b></div><p class="note">Bu hareketi kaydettikçe ${kg?'kilonun':'tekrarının'} nasıl arttığı burada grafik olarak görünecek.</p></div>`;
  const best=Math.max(...pts.map(p=>p.v)),first=pts[0].v,last=pts[pts.length-1].v,diff=Math.round((last-first)*10)/10;
  let svg='';
  if(pts.length>1){
    const W=300,H=96,pl=30,pr=10,pt=10,pb=20;let lo=Math.min(...pts.map(p=>p.v)),hi=best;if(hi===lo){lo-=1;hi+=1}
    const X=i=>pl+(W-pl-pr)*i/(pts.length-1),Y=v=>pt+(H-pt-pb)*(1-(v-lo)/(hi-lo));
    const line=pts.map((p,i)=>X(i).toFixed(1)+','+Y(p.v).toFixed(1)).join(' ');
    svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(e.n)} ilerleme grafiği">
      <line x1="${pl}" x2="${W-pr}" y1="${Y(hi)}" y2="${Y(hi)}" style="stroke:var(--line)"/><line x1="${pl}" x2="${W-pr}" y1="${Y(lo)}" y2="${Y(lo)}" style="stroke:var(--line)"/>
      <text x="${pl-5}" y="${Y(hi)+4}" text-anchor="end" font-size="10" style="fill:var(--muted)">${fmtN(hi)}</text><text x="${pl-5}" y="${Y(lo)+4}" text-anchor="end" font-size="10" style="fill:var(--muted)">${fmtN(lo)}</text>
      <path d="M${X(0)},${Y(lo)} L${line.split(' ').join(' L')} L${X(pts.length-1)},${Y(lo)} Z" style="fill:var(--accent);opacity:.14"/>
      <polyline points="${line}" fill="none" style="stroke:var(--accent)" stroke-width="2.2" stroke-linejoin="round"/>
      ${pts.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.v)}" r="${i===pts.length-1?4:2.5}" style="fill:${p.v===best?'var(--warn)':'var(--accent)'}"/>`).join('')}
      <text x="${pl}" y="${H-4}" font-size="10" style="fill:var(--muted)">${esc(fmtD(pts[0].d))}</text><text x="${W-pr}" y="${H-4}" font-size="10" text-anchor="end" style="fill:var(--muted)">${esc(fmtD(pts[pts.length-1].d))}</text></svg>`;
  }
  return `<div class="pchart"><div class="pc-h"><b>İlerleme</b><span>${pts.length} antrenman</span></div>
    <div class="pc-s"><span>Rekor <b>${fmtN(best)} ${unit}</b></span><span>Son <b>${fmtN(last)} ${unit}</b></span>${pts.length>1?`<span>Fark <b style="color:${diff>0?'var(--good)':'var(--ink)'}">${diff>0?'+':''}${fmtN(diff)}</b></span>`:''}</div>${svg}</div>`;
}
function mountAnims(){
  if(window.ExAnim)document.querySelectorAll('[data-anim]:not([data-on])').forEach(el=>ExAnim.mount(el,el.dataset.anim));
  document.querySelectorAll('[data-vid]:not([data-on])').forEach(el=>{el.dataset.on='1';const k=el.dataset.vid,cap=el.querySelector('.vcap'),v=el.querySelector('video'),cues=window.ExAnim?ExAnim.cues(k):[];let i=0;
    if(cues.length){cap.textContent=cues[0];const iv=setInterval(()=>{if(!el.isConnected){clearInterval(iv);return}i=(i+1)%cues.length;cap.textContent=cues[i]},2600)}else cap.hidden=true;
    v.addEventListener('error',()=>{if(window.ExAnim&&ExAnim.has(k)){el.outerHTML=`<div class="vbox" data-anim="${k}"><canvas></canvas><div class="vcap"></div><span class="vhint">Video yüklenemedi, çizim gösteriliyor</span></div>`;mountAnims()}});
    el.addEventListener('click',ev=>{if(ev.target.closest('button'))return;v.paused?v.play().catch(()=>{}):v.pause()});
    v.play().catch(()=>{});});
}
function howTo(k){const e=LIB[k];return `<details class="how"><summary>Nasıl yapılır · YouTube</summary><ul>${e.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><a class="vid" href="${yt(e.q)}" target="_blank" rel="noopener">Videoyu YouTube'da izle</a></details>`}

function histView(){
  const s=sortedSessions();
  if(mode==='loading'&&!s.length)return '<div class="empty">Kayıtlar yükleniyor…</div>';
  if(!s.length)return backupBox()+'<div class="empty">Henüz kayıtlı antrenman yok.<br>Antrenman sekmesinde setleri ✓ ile işaretleyip <b>Antrenmanı bitir</b>\'e dokununca burada görünür.</div>';
  return backupBox()+s.map(x=>{
    const P=PROGRAMS[x.program]||{name:x.program};
    const keys=Object.keys(x.ex||{}).filter(k=>x.ex[k].some(z=>z.done));
    const lines=keys.map(k=>{const e=LIB[k]||{n:k,t:'kg'};const sets=x.ex[k].filter(z=>z.done).map(z=>(e.t==='kg'&&z.kg!=null&&z.kg!==''?fmtN(z.kg)+'×':'')+z.reps).join(', ');return `<li><b>${esc(e.n)}</b><span>${esc(sets)}${e.t==='sn'?' sn':''}</span></li>`}).join('');
    return `<details class="sess"><summary><span>${esc(fmtD(x.date))}</span><span><span class="daychip">${esc(planName(x.program,x.day))}</span></span></summary>
      <ul>${lines}${x.cardio?`<li><b>Eğimli yürüyüş</b><span>${esc(x.cardio)} dk</span></li>`:''}${x.noLegs?'<li><b>Not</b><span>Bacak yapılmadı</span></li>':''}</ul>
      <div class="row" style="justify-content:flex-start"><button class="ghost" data-sum="${esc(x.id)}">Özeti gör</button><button class="ghost danger" data-del="${esc(x.id)}">${pendingDel===x.id?'Silmek için tekrar dokun':'Bu antrenmanı sil'}</button></div></details>`}).join('');
}

function backupBox(){return `<section class="panel"><p class="note">Kayıtların bu telefonda saklanıyor. Ayda bir yedek al; telefon değiştirirsen yedeği geri yükle.</p><div class="row" style="justify-content:flex-start"><button class="ghost" id="exp">Yedeği indir</button><label class="ghost" for="imp" style="cursor:pointer">Yedeği geri yükle</label><input type="file" id="imp" accept="application/json,.json" hidden></div></section>`}
function kiloView(){
  const w=[...weights].sort((a,b)=>a.date<b.date?-1:1);
  const start=w.length?w[0].kg:95,cur=w.length?w[w.length-1].kg:95;
  const diff=Math.round((cur-start)*10)/10;
  return `<section class="panel">
    <div class="stats"><div class="stat"><span class="lbl">Başlangıç</span><strong>${fmtN(start)}</strong></div><div class="stat"><span class="lbl">Şimdi</span><strong>${fmtN(cur)}</strong></div><div class="stat"><span class="lbl">Fark</span><strong style="color:${diff<0?'var(--good)':'var(--ink)'}">${diff>0?'+':''}${fmtN(diff)}</strong></div></div>
    <div class="chart" id="chart"></div>
    <p class="note">Hedef hız ayda 2-3 kg. Haftada bir, aynı gün sabah aç karnına tartıl.</p></section>
  <section class="panel">
    <div class="wform"><label for="w-date"><span class="lbl">Tarih</span><input type="date" id="w-date" value="${today()}"></label><label for="w-kg"><span class="lbl">Kilo</span><input id="w-kg" inputmode="decimal" placeholder="${fmtN(cur)}"></label><button class="ghost" id="w-add">Ekle</button></div>
    <ul class="wlist">${[...w].reverse().slice(0,15).map(x=>`<li><span>${esc(fmtD(x.date))}</span><span><b>${fmtN(x.kg)} kg</b><button class="x" aria-label="${esc(fmtD(x.date))} kaydını sil" data-wdel="${esc(x.date)}">×</button></span></li>`).join('')}</ul>
  </section>`;
}
function drawChart(){
  const el=$('#chart');if(!el)return;
  const w=[...weights].sort((a,b)=>a.date<b.date?-1:1);
  if(w.length<2){el.innerHTML='<p class="note">İkinci tartını eklediğinde grafik burada çizilir.</p>';return}
  const W=340,H=150,pl=34,pr=12,pt=12,pb=24;
  const t=w.map(x=>new Date(x.date+'T12:00').getTime()),ks=w.map(x=>x.kg);
  const lo=Math.floor(Math.min(...ks)-1),hi=Math.ceil(Math.max(...ks)+1),mid=Math.round((lo+hi)/2);
  const t0=t[0],t1=t[t.length-1];
  const X=v=>pl+(W-pl-pr)*((v-t0)/((t1-t0)||1)),Y=v=>pt+(H-pt-pb)*(1-(v-lo)/(hi-lo));
  const pts=w.map((x,i)=>[X(t[i]),Y(x.kg)]);
  const line=pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const area=`M${pts[0][0]},${Y(lo)} L${line.split(' ').join(' L')} L${pts[pts.length-1][0]},${Y(lo)} Z`;
  const L=pts[pts.length-1];
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kilo grafiği">
   ${[lo,mid,hi].map(v=>`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--line)" stroke-width="1"/><text x="${pl-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" style="fill:var(--muted)">${v}</text>`).join('')}
   <path d="${area}" style="fill:var(--accent);opacity:.14"/>
   <polyline points="${line}" fill="none" style="stroke:var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>
   <circle cx="${L[0]}" cy="${L[1]}" r="4.5" style="fill:var(--accent)"/>
   <text x="${pl}" y="${H-6}" font-size="11" style="fill:var(--muted)">${esc(fmtD(w[0].date))}</text>
   <text x="${W-pr}" y="${H-6}" font-size="11" text-anchor="end" style="fill:var(--muted)">${esc(fmtD(w[w.length-1].date))}</text></svg>`;
}

function bestOf(e,arr){let b=null;arr.forEach(x=>{if(e.t==='kg'){if(x.kg==null)return;if(!b||x.kg>b.kg||(x.kg===b.kg&&(x.reps||0)>(b.reps||0)))b=x}else if(!b||(x.reps||0)>(b.reps||0))b=x});return b}
function histBest(k,hist){const e=LIB[k];let v=null;hist.forEach(s=>{const a=s.ex&&s.ex[k];if(!a)return;const x=bestOf(e,a.filter(z=>z.done));if(!x)return;const y=e.t==='kg'?x.kg:x.reps;if(v==null||y>v)v=y});return v}
function summaryHTML(doc,hist){
  let vol=0,sets=0,prs=0;const rows=[];
  for(const k of Object.keys(doc.ex||{})){const e=LIB[k];if(!e)continue;const done=doc.ex[k].filter(z=>z.done);if(!done.length)continue;sets+=done.length;
    if(e.t==='kg')done.forEach(z=>vol+=(z.kg||0)*(z.reps||0));
    const b=bestOf(e,done),hb=histBest(k,hist),v=b?(e.t==='kg'?b.kg:b.reps):null,pr=b&&hb!=null&&v>hb;if(pr)prs++;
    const bt=b?((e.t==='kg'&&b.kg!=null?fmtN(b.kg)+' '+U(e)+' × ':'')+(b.reps==null?'?':b.reps)+(e.t==='sn'?' sn':'')):'–';
    rows.push(`<li>${thumb(k)}<span class="txt"><b>${esc(e.n)}</b><span class="rg">${done.length} set · en iyi ${esc(bt)}</span></span>${pr?`<span class="pr">${TROPHY}Rekor</span>`:''}</li>`)}
  const tile=(l,v)=>`<div class="tile"><span class="lbl">${l}</span><strong>${v}</strong></div>`;
  return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Antrenman özeti"><div class="sheet-in">
    <div><span class="lbl">${esc(fmtD(doc.date))} · ${esc(planName(doc.program,doc.day))}</span><h2 class="sh">Antrenman tamamlandı</h2></div>
    <div class="tiles">${tile('Süre',doc.duration?doc.duration+'<small> dk</small>':'–')}${tile('Hacim',volTxt(vol))}${tile('Set',sets)}${tile('Rekor',prs)}</div>
    <ul class="sumlist">${rows.join('')}${doc.cardio?`<li><span class="thumb" style="--g:var(--g-cardio)" aria-hidden="true">YÜ</span><span class="txt"><b>Eğimli yürüyüş</b><span class="rg">${esc(doc.cardio)} dk</span></span></li>`:''}</ul>
    <button class="primary" type="button" data-close="1">Kapat</button></div></div>`;
}
function closeSheet(){document.querySelectorAll('.sheet').forEach(x=>x.remove())}
function showSummary(doc,hist){closeSheet();document.body.insertAdjacentHTML('beforeend',summaryHTML(doc,hist))}

function weekStats(){
  const since=Date.now()-7*864e5,c={};Object.keys(MUSCLE).forEach(m=>c[m]=0);let w=0,sets=0,vol=0,mins=0;
  sessions.forEach(s=>{if((s.createdAt||0)<since)return;w++;mins+=s.duration||0;
    Object.keys(s.ex||{}).forEach(k=>{const e=LIB[k];if(!e)return;const done=s.ex[k].filter(z=>z.done);sets+=done.length;
      if(e.t==='kg')done.forEach(z=>vol+=(z.kg||0)*(z.reps||0));(R2M[e.r]||[]).forEach(m=>c[m]+=done.length)})});
  return {c,w,sets,vol,mins};
}
function lvlFill(n){return n===0?'var(--line)':n<4?'color-mix(in srgb,var(--accent) 35%,var(--surface2))':n<8?'color-mix(in srgb,var(--accent) 68%,var(--surface2))':'var(--accent)'}
function bodySVG(c,side){
  const f=m=>`style="fill:${lvlFill(c[m])}"`,B='style="fill:var(--surface2);stroke:var(--line)" stroke-width="1"';
  const base=`<circle cx="60" cy="18" r="11" ${B}/><rect x="54" y="27" width="12" height="10" rx="3" ${B}/>
   <path d="M34 40 Q60 34 86 40 L84 74 Q82 100 78 118 L42 118 Q38 100 36 74 Z" ${B}/>
   <rect x="20" y="46" width="13" height="34" rx="6" ${B}/><rect x="87" y="46" width="13" height="34" rx="6" ${B}/>
   <rect x="17" y="82" width="12" height="34" rx="6" ${B}/><rect x="91" y="82" width="12" height="34" rx="6" ${B}/>
   <path d="M42 116 L78 116 L82 136 L38 136 Z" ${B}/>
   <rect x="39" y="134" width="19" height="62" rx="9" ${B}/><rect x="62" y="134" width="19" height="62" rx="9" ${B}/>
   <rect x="41" y="198" width="15" height="44" rx="7" ${B}/><rect x="64" y="198" width="15" height="44" rx="7" ${B}/>`;
  const front=`<ellipse cx="31" cy="47" rx="9" ry="9" ${f('shoulders')}/><ellipse cx="89" cy="47" rx="9" ry="9" ${f('shoulders')}/>
   <path d="M41 46 Q50 42 59 45 L59 64 Q49 68 41 62 Z" ${f('chest')}/><path d="M79 46 Q70 42 61 45 L61 64 Q71 68 79 62 Z" ${f('chest')}/>
   <rect x="49" y="68" width="22" height="44" rx="5" ${f('abs')}/><path d="M49 82h22M49 96h22M60 68v44" style="stroke:var(--surface)" stroke-width="1.2"/>
   <ellipse cx="26.5" cy="64" rx="5.5" ry="13" ${f('biceps')}/><ellipse cx="93.5" cy="64" rx="5.5" ry="13" ${f('biceps')}/>
   <rect x="41" y="138" width="15" height="52" rx="7" ${f('quads')}/><rect x="64" y="138" width="15" height="52" rx="7" ${f('quads')}/>`;
  const back=`<path d="M48 32 L72 32 L84 44 L60 56 L36 44 Z" ${f('upper')}/>
   <ellipse cx="31" cy="47" rx="9" ry="9" ${f('shoulders')}/><ellipse cx="89" cy="47" rx="9" ry="9" ${f('shoulders')}/>
   <rect x="51" y="57" width="18" height="24" rx="4" ${f('mid')}/>
   <path d="M38 50 L49 58 L51 98 L41 88 Z" ${f('lats')}/><path d="M82 50 L71 58 L69 98 L79 88 Z" ${f('lats')}/>
   <ellipse cx="26.5" cy="64" rx="5.5" ry="13" ${f('triceps')}/><ellipse cx="93.5" cy="64" rx="5.5" ry="13" ${f('triceps')}/>
   <ellipse cx="51" cy="127" rx="10" ry="9" ${f('glutes')}/><ellipse cx="69" cy="127" rx="10" ry="9" ${f('glutes')}/>
   <rect x="41" y="142" width="15" height="48" rx="7" ${f('hams')}/><rect x="64" y="142" width="15" height="48" rx="7" ${f('hams')}/>`;
  return `<figure class="fig"><svg viewBox="0 0 120 250" role="img" aria-label="${side==='f'?'Önden':'Arkadan'} çalışan kaslar">${base}${side==='f'?front:back}</svg><figcaption>${side==='f'?'Ön':'Arka'}</figcaption></figure>`;
}
function soonView(t,d){return `<div class="empty" style="display:grid;gap:6px;justify-items:center;padding:40px 16px"><b style="font-size:1.05rem;color:var(--ink)">${esc(t)} yakında</b><span>${esc(d)}</span></div>`}
function karneView(){
  const W=weekStats(),max=Math.max(10,...Object.values(W.c));
  const tile=(l,v)=>`<div class="tile"><span class="lbl">${l}</span><strong>${v}</strong></div>`;
  return `<p class="note" style="text-align:center">Son 7 gün</p>
  <div class="tiles">${tile('Antrenman',W.w)}${tile('Set',W.sets)}${tile('Hacim',volTxt(W.vol))}${tile('Süre',W.mins+'<small> dk</small>')}</div>
  <section class="panel"><div class="figs">${bodySVG(W.c,'f')}${bodySVG(W.c,'b')}</div>
    <div class="legend"><span><i style="background:${lvlFill(0)}"></i>0</span><span><i style="background:${lvlFill(1)}"></i>1-3 set</span><span><i style="background:${lvlFill(5)}"></i>4-7</span><span><i style="background:${lvlFill(9)}"></i>8+</span></div>
    ${W.w?'':'<p class="note" style="text-align:center">İlk antrenmanını kaydedince çalışan kasların burada renklenir.</p>'}</section>
  <section class="panel"><span class="lbl">Kas grubu başına haftalık set</span>
    <div class="bars">${Object.entries(MUSCLE).map(([m,n])=>`<div class="bar"><span>${n}</span><span class="track"><i style="width:${(W.c[m]/max*100).toFixed(0)}%"></i></span><b>${W.c[m]}</b></div>`).join('')}</div>
    <p class="note">Her kas grubu için haftada 6-12 set iyi bir hedef.</p></section>`;
}

function applyTheme(){
  const r=document.documentElement;if(settings.theme==='system')delete r.dataset.theme;else r.dataset.theme=settings.theme;
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=getComputedStyle(r).getPropertyValue('--bg').trim()||'#0E1412';
}
function settingsHTML(){
  const step=(id,label,val,unit)=>`<div class="srow"><span>${label}</span><div class="stepper"><button type="button" data-set="${id}" data-d="-1" aria-label="${label} azalt">−</button><b>${val}${unit?'<small> '+unit+'</small>':''}</b><button type="button" data-set="${id}" data-d="1" aria-label="${label} artır">+</button></div></div>`;
  const seg=(id,label,opts)=>`<div class="srow"><span>${label}</span><div class="sseg">${opts.map(([v,t])=>`<button type="button" data-opt="${id}" data-v="${v}" aria-pressed="${String(settings[id])===String(v)}">${t}</button>`).join('')}</div></div>`;
  return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Ayarlar"><div class="sheet-in">
    <div class="row"><h2 class="sh">Ayarlar</h2><button type="button" class="ghost" data-close="1">Kapat</button></div>
    ${accountHTML()}
    <section class="panel"><span class="lbl">Hedef</span>${step('goal','Haftalık antrenman',settings.goal,'gün')}</section>
    <section class="panel"><span class="lbl">Dinlenme süreleri</span>
      ${step('restBig','Ana hareketler',settings.restBig,'sn')}${step('restMid','Orta hareketler',settings.restMid,'sn')}${step('restIso','Küçük hareketler',settings.restIso,'sn')}${step('ss','Süper set arası',settings.ss,'sn')}</section>
    <section class="panel"><span class="lbl">Görünüm ve birim</span>
      ${seg('theme','Tema',[['system','Sistem'],['dark','Koyu'],['light','Açık']])}${seg('unit','Ağırlık birimi',[['kg','kg'],['lb','lb']])}
      ${seg('sound','Sayaç sesi',[['true','Açık'],['false','Kapalı']])}${seg('vib','Titreşim',[['true','Açık'],['false','Kapalı']])}
      <p class="note">Birim değiştirmek eski kayıtları çevirmez, sadece yazılan birimi değiştirir.</p></section>
  </div></div>`;
}
function openSettings(){closeSheet();document.body.insertAdjacentHTML('beforeend',settingsHTML())}
/* ---------- Ana sayfa ---------- */
function homeView(){
  const ws=weekStart(Date.now()),wc=weekCount(ws),goal=settings.goal,st=streak();
  const C=2*Math.PI*42,f=Math.min(1,wc/goal);
  const nd=nextDay(prog),P=PROGRAMS[prog],keys=baseKeys(prog,nd),totalSets=keys.reduce((n,k)=>n+(Ecfg(prog,nd,k).s||0),0);
  const last=sortedSessions()[0];
  const w=[...weights].sort((a,b)=>a.date<b.date?-1:1),wl=w[w.length-1],w0=w[0];
  const hr=new Date().getHours(),greet=hr<12?'Günaydın':hr<18?'İyi günler':'İyi akşamlar';
  const days=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map((t,i)=>{const s0=ws+i*864e5,has=sessions.some(s=>(s.createdAt||0)>=s0&&(s.createdAt||0)<s0+864e5),isT=weekStart(Date.now())===ws&&((new Date().getDay()+6)%7)===i;return `<span class="wd${has?' on':''}${isT?' today':''}">${t}</span>`}).join('');
  return `<div class="hrow"><span class="greet">${greet}${firstName()?', '+esc(firstName()):''}</span><button type="button" class="iconbtn" data-settings="1" aria-label="Ayarlar"><svg viewBox="0 0 24 24" width="22" height="22" style="fill:none;stroke:currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button></div>
  <section class="panel goal">
    <svg class="gring" viewBox="0 0 100 100" role="img" aria-label="Bu hafta ${wc} / ${goal} antrenman"><circle cx="50" cy="50" r="42" style="fill:none;stroke:var(--line)" stroke-width="9"/><circle cx="50" cy="50" r="42" style="fill:none;stroke:${wc>=goal?'var(--good)':'var(--accent)'}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(C*f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 50 50)"/><text x="50" y="56" text-anchor="middle" font-size="22" font-weight="700" style="fill:var(--ink)">${wc}/${goal}</text></svg>
    <div class="gtxt"><b>${wc>=goal?'Haftalık hedef tamam':'Bu hafta '+(goal-wc)+' antrenman kaldı'}</b><span class="sub">${st?`<svg viewBox="0 0 24 24" width="14" height="14" style="fill:var(--warn);vertical-align:-2px"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-4-1-6 1-9z"/></svg> ${st} hafta üst üste hedef`:'Hedefi tuttur, seri başlasın'}</span><div class="wdays">${days}</div></div>
  </section>
  <section class="panel next">
    <span class="lbl">Sıradaki antrenman</span>
    <div class="nx"><b>${esc(planName(prog,nd))}</b><span class="sub">${esc(P.days[nd].title)} · ${keys.length} hareket · ${totalSets} set</span></div>
    <div class="nbtns"><button type="button" class="ghost" data-warmup="1">Isınmayı başlat</button><button type="button" class="primary sm" data-start="${prog}-${nd}">Antrenmana başla</button></div>
  </section>
  ${last?`<section class="panel"><span class="lbl">Son antrenman</span><div class="row"><span><b>${esc(planName(last.program,last.day))}</b> <span class="sub">${esc(fmtD(last.date))}${last.duration?' · '+last.duration+' dk':''}</span></span><button type="button" class="ghost" data-sum="${esc(last.id)}">Özet</button></div></section>`:''}
  <button type="button" class="panel wmini" data-tab="karne"><span class="lbl">Kilo</span><span><b>${wl?fmtN(wl.kg)+' kg':'–'}</b>${wl&&w0&&w.length>1?` <span class="sub">başlangıçtan ${wl.kg-w0.kg>0?'+':''}${fmtN(Math.round((wl.kg-w0.kg)*10)/10)} kg</span>`:''}</span></button>`;
}

/* ---------- Program düzenleyici ---------- */
function editView(){
  const list=plans[prog][day]||[];
  const rows=list.map((x,i)=>{const e=LIB[x.k];if(!e)return '';const c=Ecfg(prog,day,x.k),stp=e.t==='sn'?5:1;
    return `<div class="edrow">${thumb(x.k)}<div class="edt"><b>${esc(e.n)}</b><div class="edc">
      <span class="stepper sm"><button type="button" data-ed="s" data-d="-1" data-i="${i}" aria-label="Set azalt">−</button><b>${c.s}<small> set</small></b><button type="button" data-ed="s" data-d="1" data-i="${i}" aria-label="Set artır">+</button></span>
      <span class="stepper sm"><button type="button" data-ed="r" data-d="-${stp}" data-i="${i}" aria-label="Tekrar azalt">−</button><b>${c.reps}<small> ${e.t==='sn'?'sn':'tkr'}</small></b><button type="button" data-ed="r" data-d="${stp}" data-i="${i}" aria-label="Tekrar artır">+</button></span></div></div>
      <div class="edm"><button type="button" data-ed="up" data-i="${i}" aria-label="Yukarı taşı" ${i?'':'disabled'}>▲</button><button type="button" data-ed="down" data-i="${i}" aria-label="Aşağı taşı" ${i<list.length-1?'':'disabled'}>▼</button><button type="button" class="del" data-ed="del" data-i="${i}" aria-label="${esc(e.n)} hareketini çıkar">✕</button></div></div>`}).join('');
  return `<button type="button" class="back" data-editdone="1"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style="fill:none;stroke:currentColor" stroke-width="2.5"><path d="M15 6l-6 6 6 6"/></svg>Bitti</button>
    <h2 class="hh" style="margin:0">${esc(planName(prog,day))} programı</h2>
    <p class="note">Set ve tekrar sayısını değiştir, okla sırala, ✕ ile çıkar. Değişiklikler hemen kaydedilir.</p>
    <div class="list">${rows||'<p class="note" style="padding:14px">Bu günde hareket yok. Aşağıdan ekle.</p>'}</div>
    <button type="button" class="primary" data-addpick="1">+ Hareket ekle</button>
    <button type="button" class="ghost" id="plreset" style="justify-self:start">Bu günü varsayılana döndür</button>`;
}
function pickerHTML(){
  const have=new Set((plans[prog][day]||[]).map(x=>x.k));
  const groups={chest:'Göğüs',back:'Sırt',shoulder:'Omuz',arm:'Kol',leg:'Bacak',core:'Karın'};
  let h='';for(const [g,t] of Object.entries(groups)){const ks=Object.keys(LIB).filter(k=>GROUP[LIB[k].r]===g&&!have.has(k));if(!ks.length)continue;
    h+=`<span class="lbl">${t}</span><div class="list">${ks.map(k=>`<button type="button" class="exrow" data-add="${k}">${thumb(k)}<span class="txt"><span class="nm">${esc(LIB[k].n)}</span><span class="rg">${LIB[k].s} × ${LIB[k].reps}${LIB[k].t==='sn'?' sn':''} · ${esc(LIB[k].r)}</span></span><span class="plus">+</span></button>`).join('')}</div>`}
  return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Hareket ekle"><div class="sheet-in"><div class="row"><h2 class="sh">Hareket ekle</h2><button type="button" class="ghost" data-close="1">Kapat</button></div>${h}</div></div>`;
}

function origOf(k){const sw=getDraft().swap||{};return Object.keys(sw).find(o=>sw[o]===k)||k}
function altHTML(k){
  const o=origOf(k),opts=[...new Set([o,...(ALT[o]||[])])].filter(x=>x!==k&&LIB[x]);
  return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Alternatif hareket"><div class="sheet-in"><div class="row"><h2 class="sh">Alternatif hareket</h2><button type="button" class="ghost" data-close="1">Kapat</button></div>
    <p class="note">Seçtiğin hareket sadece bu antrenman için ${esc(LIB[o].n)} yerine geçer. Kalıcı değiştirmek için programı düzenle.</p>
    <div class="list">${opts.map(x=>`<button type="button" class="exrow" data-swapto="${x}" data-from="${k}">${thumb(x)}<span class="txt"><span class="nm">${esc(LIB[x].n)}${x===o?' <span class="pill">Orijinal</span>':''}</span><span class="rg">${esc(LIB[x].r)}</span></span><span class="plus">›</span></button>`).join('')||'<p class="note" style="padding:12px">Bu hareket için alternatif yok.</p>'}</div></div></div>`;
}

