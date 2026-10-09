# Set Defteri

Telefonda ana ekrana eklenen kişisel antrenman uygulaması (web uygulaması / PWA).

## Dosyalar
- `index.html` — uygulamanın tamamı. Program ve hareketler en üstteki `LIB` ve `PROGRAMS` bölümünde.
- `sw.js` — internetsiz açılma. **Her güncellemede `VERSION` değerini artır** (v1 → v2), yoksa telefon eski sürümü göstermeye devam edebilir.
- `manifest.webmanifest`, `icons/` — ana ekran adı ve simgesi.

## Kayıtlar
Antrenmanlar ve kilo telefonun tarayıcı hafızasında (localStorage) durur. Geçmiş sekmesinden JSON yedeği indirilip geri yüklenebilir.

## Yayın
GitHub Pages: Settings → Pages → Branch: `main`, klasör: `/ (root)`.
