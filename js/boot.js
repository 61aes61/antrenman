'use strict';
/* Set Defteri — açılış */
loadLocal();applyTheme();render();
try{matchMedia('(prefers-color-scheme: light)').addEventListener('change',applyTheme)}catch(e){}
document.addEventListener('change',ev=>{if(ev.target.id==='imp'&&ev.target.files[0]){importData(ev.target.files[0]);ev.target.value=''}});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
