# Set Defteri — proje notları (yeni oturum için)

Kişisel antrenman takip uygulaması. Sahibi: 61aes61 (Eren). Türkçe arayüz, Türkçe iletişim.

- Canlı adres: https://61aes61.github.io/antrenman/ (GitHub Pages, `main` dalı, kök klasör)
- Tür: derleme adımı olmayan web uygulaması (PWA). Düz HTML/CSS/JS, klasik `<script>` dosyaları global kapsamı paylaşır; sıra `index.html`'de.
- Yayın: değişiklikten sonra `./release.sh` çalıştır (sw.js VERSION ve `?v=` numaraları artar), sonra commit + push. Telefon yeni sürümü bir sonraki açılışta alır.

## Dosyalar
- `js/data.js` hareket kütüphanesi `LIB`, varsayılan programlar, Pexels video adresleri `VIDEOS`, alternatifler `ALT`, ısınma `WARMUP`
- `js/state.js` kayıtlar (localStorage), kullanıcı programı `plans` (`plans[salon|ev] = {order:[...], titles:{}, A:[{k,s,reps}], ...}`), ayarlar
- `js/cloud.js` Firebase giriş (kullanıcı adı + şifre; içeride `<ad>@uye.setdefteri.app`) ve Firestore senkronu `users/{uid}/sessions|weights|meta/state`
- `js/coach.js` profil sihirbazı, yağ oranı (Navy), kalori/makro, program üretici (2-6 gün)
- `js/views.js` ekranlar · `js/actions.js` olaylar · `js/timer.js` dinlenme sayacı ve ısınma · `anim.js` çizim animasyonları · `css/app.css`

## Firebase
Proje `set-defteri` (Spark, ücretsiz), Firestore konumu eur3. Kural: her kullanıcı yalnızca `users/{kendi uid}/**`. Giriş yöntemi: e-posta/şifre (kullanıcı adı olarak). Google girişi iPhone ana ekran uygulamasında çalışmadı, arayüzden kaldırıldı.

## Yapılmadı / sıradaki fikirler
- Kardiyo ve Beslenme sekmeleri boş ("yakında")
- Herkese açmadan önce gizlilik metni (KVKK) eklenecek
- 6 harekette gerçek video yok (çizim animasyonu var): csrow, rdl, crossover, pike, ytw, deadbug
- Şifre sıfırlama yok (e-posta alınmıyor)
