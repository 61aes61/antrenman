'use strict';
/* Set Defteri — Google ile giriş ve bulut senkronu (Firebase).
   Bu ayarlar herkese açıktır; veriye erişimi Firestore güvenlik kuralları sınırlar:
   her kullanıcı sadece users/{kendi uid}/ altını okuyup yazabilir. */
const FB_CONFIG={apiKey:'AIzaSyA_UBGAWMzONRcDS2pFv6nQsq7R199E6wA',authDomain:'set-defteri.firebaseapp.com',projectId:'set-defteri',storageBucket:'set-defteri.firebasestorage.app',messagingSenderId:'424889622849',appId:'1:424889622849:web:92db933597fe013d5b41c0'};
let fbUser=null,fdb=null,authReady=false,authErr='',signingIn=false,cloudUnsub=[];
const cloudOK=()=>!!(window.firebase&&firebase.initializeApp&&firebase.auth&&firebase.firestore);
const userRef=()=>fdb.collection('users').doc(fbUser.uid);
function authMsg(e){
  const c=e&&e.code||'';
  if(c==='auth/network-request-failed')return 'İnternet bağlantısı yok. Bağlanınca tekrar dene.';
  if(c==='auth/popup-blocked')return 'Giriş penceresi engellendi. Tekrar dokun.';
  if(c==='auth/unauthorized-domain')return 'Bu adres girişe izinli değil.';
  return 'Giriş yapılamadı ('+(c||'bilinmeyen hata')+'). Tekrar dene.';
}
function cloudInit(){
  if(!cloudOK()){authReady=true;return}
  try{if(!firebase.apps.length)firebase.initializeApp(FB_CONFIG)}catch(e){authReady=true;return}
  fdb=firebase.firestore();
  try{fdb.enablePersistence({synchronizeTabs:true}).catch(()=>{})}catch(e){}
  firebase.auth().getRedirectResult().catch(e=>{authErr=authMsg(e);render()});
  firebase.auth().onAuthStateChanged(async u=>{
    cloudUnsub.forEach(f=>{try{f()}catch(e){}});cloudUnsub=[];
    fbUser=u;authReady=true;signingIn=false;
    if(u){lsSet('ad-guest',false);try{await cloudMigrate()}catch(e){}cloudSubscribe()}
    render();
  });
}
async function signIn(){
  if(!cloudOK()){authErr='Giriş için internet bağlantısı gerekiyor.';render();return}
  authErr='';signingIn=true;render();
  const p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
  try{await firebase.auth().signInWithPopup(p)}
  catch(e){
    if(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment'){try{await firebase.auth().signInWithRedirect(p);return}catch(e2){authErr=authMsg(e2)}}
    else if(e.code!=='auth/popup-closed-by-user'&&e.code!=='auth/cancelled-popup-request')authErr=authMsg(e);
    signingIn=false;render();
  }
}
async function signOutAll(){
  try{await firebase.auth().signOut()}catch(e){}
  ['ad-sessions','ad-weights','ad-plans','ad-settings','ad-drafts','ad-tab','ad-prog'].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});
  lsSet('ad-guest',false);location.reload();
}
function clean(o){return JSON.parse(JSON.stringify(o))}
/* İlk girişte bu cihazdaki kayıtları hesaba taşır. */
async function cloudMigrate(){
  const key='ad-migrated-'+fbUser.uid;if(lsGet(key,false))return;
  const meta=await userRef().collection('meta').doc('state').get();
  const ops=[];
  sessions.forEach(s=>{const {id,...d}=s;ops.push([userRef().collection('sessions').doc(String(id)),clean(d)])});
  weights.forEach(w=>ops.push([userRef().collection('weights').doc(w.date),{date:w.date,kg:w.kg}]));
  if(!meta.exists)ops.push([userRef().collection('meta').doc('state'),clean({plans,settings,prog})]);
  for(let i=0;i<ops.length;i+=400){const b=fdb.batch();ops.slice(i,i+400).forEach(([r,d])=>b.set(r,d,{merge:true}));await b.commit()}
  lsSet(key,true);
}
function cloudSubscribe(){
  const err=()=>{};
  cloudUnsub.push(userRef().collection('sessions').onSnapshot(s=>{sessions=s.docs.map(d=>({id:d.id,...d.data()}));lsSet('ad-sessions',sessions);softRender()},err));
  cloudUnsub.push(userRef().collection('weights').onSnapshot(s=>{weights=s.docs.map(d=>d.data());lsSet('ad-weights',weights);softRender()},err));
  cloudUnsub.push(userRef().collection('meta').doc('state').onSnapshot(d=>{if(!d.exists||d.metadata.hasPendingWrites)return;const x=d.data();
    if(x.plans){plans=x.plans;fixPlans();lsSet('ad-plans',plans)}
    if(x.settings){Object.assign(settings,x.settings);lsSet('ad-settings',settings);applyTheme()}
    softRender()},err));
}
/* kind: 'sessions' | 'weights' | 'meta'; data null = sil */
function cloudSave(kind,id,data){
  if(!fbUser||!fdb)return;
  const r=kind==='meta'?userRef().collection('meta').doc('state'):userRef().collection(kind).doc(String(id));
  (data===null?r.delete():r.set(clean(data),{merge:kind==='meta'})).catch(()=>toast('Buluta kaydedilemedi'));
}
function firstName(){return fbUser&&fbUser.displayName?fbUser.displayName.split(' ')[0]:''}
function needLogin(){return authReady&&cloudOK()&&!fbUser&&!lsGet('ad-guest',false)}
function loginView(){
  return `<div class="login">
    <img src="icons/icon-192.png" alt="" width="88" height="88">
    <h2 class="sh">Set Defteri'ne hoş geldin</h2>
    <p class="note">Antrenmanlarını, kilonu ve programını kaydet. Giriş yaparsan kayıtların hesabında saklanır; telefon değiştirsen de kaybolmaz.</p>
    <button type="button" class="gbtn" data-signin="1" ${signingIn?'disabled':''}><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>${signingIn?'Giriş yapılıyor…':'Google ile giriş yap'}</button>
    ${authErr?`<p class="msg err">${esc(authErr)}</p>`:''}
    <button type="button" class="ghost" data-guest="1">Giriş yapmadan devam et</button>
    <p class="note small">Giriş yapmazsan kayıtların sadece bu telefonda kalır. Kayıtların Google'ın Firebase hizmetinde, sadece senin hesabının erişebileceği şekilde saklanır.</p>
  </div>`;
}
function accountHTML(){
  if(!cloudOK())return `<section class="panel"><span class="lbl">Hesap</span><p class="note">Hesap işlemleri için internet bağlantısı gerekiyor.</p></section>`;
  if(fbUser)return `<section class="panel"><span class="lbl">Hesap</span><div class="srow"><span><b>${esc(fbUser.displayName||'Google hesabı')}</b><br><span class="sub">${esc(fbUser.email||'')}</span></span><button type="button" class="ghost danger" id="signout">Çıkış yap</button></div><p class="note">Kayıtların hesabında saklanıyor; başka bir telefondan girince de görünür.</p></section>`;
  return `<section class="panel"><span class="lbl">Hesap</span><p class="note">Şu an giriş yapmadın; kayıtların sadece bu telefonda. Giriş yaparsan bu telefondaki kayıtlar hesabına aktarılır.</p><button type="button" class="gbtn" data-signin="1">Google ile giriş yap</button>${authErr?`<p class="msg err">${esc(authErr)}</p>`:''}</section>`;
}
