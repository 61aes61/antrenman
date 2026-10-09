'use strict';
/* Set Defteri — kullanıcı adı/şifre ile giriş ve bulut senkronu (Firebase).
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
/* Kullanıcı adı + şifre. Firebase e-posta istediği için kullanıcı adı içeride
   "<ad>@uye.setdefteri.app" adresine çevrilir; bu adres hiçbir yere mail göndermez.
   Aynı adres ikinci kez açılamadığı için her kullanıcı adı tek kişiye aittir. */
const UDOMAIN='@uye.setdefteri.app';
let loginMode='login';
function normUser(u){return String(u||'').trim().toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c')}
function authMsg(e){
  const c=e&&e.code||'';
  if(c==='auth/email-already-in-use')return 'Bu kullanıcı adı alınmış. Başka bir ad dene.';
  if(c==='auth/invalid-credential'||c==='auth/wrong-password'||c==='auth/user-not-found'||c==='auth/invalid-login-credentials')return 'Kullanıcı adı ya da şifre yanlış.';
  if(c==='auth/weak-password')return 'Şifre en az 6 karakter olmalı.';
  if(c==='auth/too-many-requests')return 'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.';
  if(c==='auth/network-request-failed')return 'İnternet bağlantısı yok. Bağlanınca tekrar dene.';
  return 'Bir sorun oldu ('+(c||'bilinmeyen hata')+'). Tekrar dene.';
}
async function loginSubmit(){
  if(!cloudOK()){authErr='Giriş için internet bağlantısı gerekiyor.';render();return}
  const u=normUser($('#lu').value),p=$('#lp').value,p2=$('#lp2')?$('#lp2').value:p;
  if(!/^[a-z0-9_.]{3,20}$/.test(u)){authErr='Kullanıcı adı 3-20 karakter olmalı; harf, rakam, nokta ve alt çizgi kullanabilirsin.';render();keepLogin(u);return}
  if(p.length<6){authErr='Şifre en az 6 karakter olmalı.';render();keepLogin(u);return}
  if(loginMode==='signup'&&p!==p2){authErr='Şifreler aynı değil.';render();keepLogin(u);return}
  const rem=!$('#lrem')||$('#lrem').checked;lsSet('ad-remember',rem);lsSet('ad-lastuser',rem?u:'');
  authErr='';signingIn=true;render();keepLogin(u);
  try{
    await firebase.auth().setPersistence(rem?firebase.auth.Auth.Persistence.LOCAL:firebase.auth.Auth.Persistence.SESSION);
    if(loginMode==='signup'){const r=await firebase.auth().createUserWithEmailAndPassword(u+UDOMAIN,p);await r.user.updateProfile({displayName:u});fbUser=r.user;render()}
    else await firebase.auth().signInWithEmailAndPassword(u+UDOMAIN,p);
  }catch(e){authErr=authMsg(e);signingIn=false;render();keepLogin(u)}
}
function keepLogin(u){const el=$('#lu');if(el&&u)el.value=u}
function rememberOn(){return lsGet('ad-remember',true)}
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
function userName(){if(!fbUser)return '';return fbUser.displayName||(fbUser.email||'').split('@')[0]}
function firstName(){return userName()}
function needLogin(){return authReady&&cloudOK()&&!fbUser&&!lsGet('ad-guest',false)}
function loginView(){
  const su=loginMode==='signup';
  return `<div class="login">
    <img src="icons/icon-192.png" alt="" width="80" height="80">
    <h2 class="sh">${su?'Hesap oluştur':'Set Defteri\'ne hoş geldin'}</h2>
    <div class="mseg" role="group" aria-label="Giriş türü"><button type="button" data-lmode="login" aria-pressed="${!su}">Giriş yap</button><button type="button" data-lmode="signup" aria-pressed="${su}">Kayıt ol</button></div>
    <form id="lform" class="lform" autocomplete="on">
      <label for="lu"><span class="lbl">Kullanıcı adı</span><input id="lu" name="username" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="ornek: eren61" value="${esc(lsGet('ad-lastuser',''))}" required></label>
      <label for="lp"><span class="lbl">Şifre</span><input id="lp" type="password" name="password" autocomplete="${su?'new-password':'current-password'}" placeholder="en az 6 karakter" required></label>
      ${su?'<label for="lp2"><span class="lbl">Şifre (tekrar)</span><input id="lp2" type="password" autocomplete="new-password" required></label>':''}
      <label class="toggle" for="lrem"><input type="checkbox" id="lrem" ${rememberOn()?'checked':''}> Beni hatırla</label>
      ${authErr?`<p class="msg err">${esc(authErr)}</p>`:''}
      <button type="submit" class="primary" ${signingIn?'disabled':''}>${signingIn?'Bekle…':su?'Kayıt ol':'Giriş yap'}</button>
    </form>
    ${su?'<p class="note small">Kullanıcı adın sana özel olur, başkası aynı adı alamaz. Şifreni unutursan sıfırlamak için e-posta yok, o yüzden şifreni bir yere not et.</p>':''}
    <button type="button" class="ghost" data-guest="1">Giriş yapmadan devam et</button>
    <p class="note small">Giriş yapmazsan kayıtların sadece bu telefonda kalır. Giriş yaparsan kayıtların Google'ın Firebase hizmetinde, sadece senin hesabının erişebileceği şekilde saklanır.</p>
  </div>`;
}
function accountHTML(){
  if(!cloudOK())return `<section class="panel"><span class="lbl">Hesap</span><p class="note">Hesap işlemleri için internet bağlantısı gerekiyor.</p></section>`;
  if(fbUser)return `<section class="panel"><span class="lbl">Hesap</span><div class="srow"><span><span class="sub">Kullanıcı adı</span><br><b>${esc(userName())}</b></span><button type="button" class="ghost danger" id="signout">Çıkış yap</button></div><p class="note">Kayıtların hesabında saklanıyor; başka bir telefondan girince de görünür.</p></section>`;
  return `<section class="panel"><span class="lbl">Hesap</span><p class="note">Şu an giriş yapmadın; kayıtların sadece bu telefonda. Giriş yaparsan ya da kayıt olursan bu telefondaki kayıtlar hesabına aktarılır.</p><button type="button" class="primary sm" data-tologin="1">Giriş yap / Kayıt ol</button></section>`;
}
