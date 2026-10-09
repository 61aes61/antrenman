'use strict';
/* Set Defteri — yardımcı fonksiyonlar */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toLocaleDateString('sv-SE');
const fmtD=d=>{try{return new Date(d+'T12:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'short',weekday:'short'})}catch(e){return d}};
const num=v=>{if(v==null||v==='')return null;const x=parseFloat(String(v).replace(',','.'));return isFinite(x)?x:null};
const fmtN=x=>String(x).replace('.',',');
const yt=q=>'https://www.youtube.com/results?search_query='+encodeURIComponent(q);
function lsGet(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2400)}
function volTxt(v){v=Math.round(v);return v>=10000?fmtN((v/1000).toFixed(1))+'<small> ton</small>':v.toLocaleString('tr-TR')+'<small> '+settings.unit+'</small>'}
