# Set Defteri

Telefonda ana ekrana eklenen kişisel antrenman uygulaması (web uygulaması / PWA). Yayın: GitHub Pages.

## Dosyalar
- `index.html` — sayfa iskeleti ve alt menü.
- `css/app.css` — tüm stiller; renkler en üstteki `:root` değişkenlerinde.
- `js/util.js` — küçük yardımcılar (biçimlendirme, tarayıcı hafızası).
- `js/data.js` — hareket kütüphanesi (`LIB`), varsayılan programlar, videolar, alternatifler, ısınma adımları.
- `js/state.js` — kullanıcının programı, ayarlar, taslak antrenman, kayıtlar ve yedekleme.
- `js/views.js` — tüm ekranlar (ana sayfa, antrenman, hareket, karne, geçmiş, ayarlar, özet).
- `js/timer.js` — dinlenme sayacı ve ısınma.
- `js/actions.js` — antrenmanı kaydetme ve dokunma olayları.
- `js/boot.js` — açılış.
- `anim.js` — hareket çizim animasyonları.
- `sw.js` — internetsiz açılma.
- `release.sh` — her güncellemeden önce çalıştır: sürüm numarasını ve dosya adreslerindeki `?v=` değerlerini artırır, telefonlar yeni sürümü hemen alır.

## Kayıtlar
Telefonun tarayıcı hafızasında (localStorage) durur. Geçmiş sekmesinden JSON yedeği alınıp geri yüklenebilir.
