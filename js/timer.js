'use strict';
/* Set Defteri — dinlenme sayacı ve ısınma */
/* ---------- Rest timer ---------- */
let timer={end:0,total:0,iv:null,label:''},actx=null;
function initAudio(){try{if(!actx){const AC=window.AudioContext||window.webkitAudioContext;if(AC)actx=new AC()}else if(actx.state==='suspended')actx.resume()}catch(e){}}
function alertDone(){if(settings.sound)beep();if(settings.vib)try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}
function beep(){try{if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=880;g.gain.setValueAtTime(.2,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.5);o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+.5)}catch(e){}}
function startRest(sec,label){
  initAudio();
  timer.end=Date.now()+sec*1000;timer.total=sec;timer.label=label;
  const r=$('#rest');r.hidden=false;r.classList.remove('ready');
  clearInterval(timer.iv);timer.iv=setInterval(tick,250);tick();
}
function tick(){
  const left=Math.max(0,Math.round((timer.end-Date.now())/1000));
  const m=Math.floor(left/60),s=left%60;
  $('#rest-t').textContent=m+':'+String(s).padStart(2,'0');
  $('#rest-l').textContent=left?'Dinlenme · sıradaki: '+timer.label:'Hazırsın · '+timer.label;
  $('#rest-bar').style.transform='scaleX('+(timer.total?left/timer.total:0)+')';
  if(!left){clearInterval(timer.iv);timer.iv=null;$('#rest').classList.add('ready');alertDone();setTimeout(()=>{if(!timer.iv)$('#rest').hidden=true},4000)}
}

let wu=null;
function wuHTML(){
  const st=WARMUP[wu.p],s=st[wu.i];
  if(!s)return `<div class="wu-done"><b>Isınma bitti</b><span class="sub">Hazırsın. İyi antrenmanlar!</span><button type="button" class="primary" data-start="${wu.p}-${nextDay(wu.p)}">Antrenmana başla</button></div>`;
  const left=Math.max(0,Math.ceil((wu.end-(wu.paused||Date.now()))/1000)),m=Math.floor(left/60),sec=left%60;
  return `<div class="wu-dots">${st.map((x,j)=>`<i class="${j<wu.i?'d':j===wu.i?'c':''}"></i>`).join('')}</div>
    <span class="lbl">Adım ${wu.i+1} / ${st.length}</span><b class="wu-n">${esc(s.n)}</b><span class="wu-t">${m}:${String(sec).padStart(2,'0')}</span><p class="note" style="text-align:center">${esc(s.d)}</p>
    <div class="nbtns"><button type="button" class="ghost" data-wu="pause">${wu.paused?'Devam et':'Duraklat'}</button><button type="button" class="ghost" data-wu="next">Sonraki adım</button></div>`;
}
function openWarmup(p){
  closeWarmup();initAudio();
  wu={p,i:0,end:Date.now()+WARMUP[p][0].sec*1000,paused:0};
  document.body.insertAdjacentHTML('beforeend',`<div class="player wu" role="dialog" aria-modal="true" aria-label="Isınma"><div class="ptop"><button type="button" class="pclose" data-wuclose="1">✕ Kapat</button><b>Isınma · ${p==='salon'?'Salon':'Ev'}</b></div><div class="wu-body"></div></div>`);
  wu.iv=setInterval(wuTick,250);wuTick();
}
function wuTick(){
  const b=document.querySelector('.wu-body');if(!b||!wu){closeWarmup();return}
  const st=WARMUP[wu.p];
  if(!wu.paused&&st[wu.i]&&Date.now()>=wu.end){alertDone();wu.i++;if(st[wu.i])wu.end=Date.now()+st[wu.i].sec*1000}
  b.innerHTML=wuHTML();
}
function closeWarmup(){if(wu)clearInterval(wu.iv);wu=null;document.querySelectorAll('.player.wu').forEach(x=>x.remove())}

