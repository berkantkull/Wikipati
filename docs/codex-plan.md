# Wikipati geliştirme planı

Bu çalışma Expo SDK 57 ve React Native 0.86 hedefleri korunarak, iOS ve Android birincil olacak şekilde yürütülür. Web çıktısı GitHub Pages üzerinde mobil uygulama demosu olarak kalır.

## Aşama 1 — Plan ve proje kuralları

- Mevcut kaynak, test, Supabase ve dağıtım yapılandırmasını doğrula.
- Sağlık içeriği, dil, platform ayrımı, erişilebilirlik ve izin isteme kurallarını `AGENTS.md` içine kalıcı olarak ekle.
- Başlangıç typecheck ve test durumunu doğrula.

## Aşama 2 — Expo Router, splash ve derin bağlantılar

- Expo Router ve SDK 57 uyumlu bağımlılıkları kur.
- Beş sekmeli dosya tabanlı navigasyonu ve rehber/pati detay route'larını oluştur.
- Mevcut ekran bileşenlerini route kabuklarından kullan; iç geçişleri URL ve navigasyon yığınına taşı.
- Türkçe 404 ekranı, `wikipati` scheme'i, GitHub Pages base URL ve 404 fallback'i ekle.
- Ionicons fontu ve ilk AsyncStorage okuması hazır olana kadar splash'i kontrollü tut.

## Aşama 3 — İzinler, bildirim yönlendirmesi ve erişilebilirlik

- Bildirim, konum ve galeri izinlerini yalnızca özellik ilk kullanıldığında, Türkçe açıklama kartından sonra iste.
- Reddedilen izinler için ayarları açma ve konumda elle arama akışını koru.
- Bildirimlere hedef route ekle; soğuk/arka plan/açık uygulama dokunuşlarını doğru ekrana yönlendir.
- Hatırlatma detayında tek dokunuşla “Yapıldı” akışını sağla.
- Dokunma alanları, roller, etiketler, seçili durumlar ve kontrastı gözden geçir.

## Aşama 4 — Sürümlü ve dosyalı yedek

- Fotoğraf ve belgeleri taşınabilir yedeğe dahil eden yeni formatı ekle.
- Eski yedek formatını desteklemeye devam et.
- Geri yükleme öncesi profil/kayıt/fotoğraf özetini ve açık onayı göster.
- Son yedek zamanını sakla; Ayarlar ve 30 günlük hatırlatma kartını bağla.
- Eski/yeni format için birim testleri ekle.

## Aşama 5 — Rehber şeması, araçlar, ana ekran ve yasal metinler

- Rehber verisine slug, tarih, kaynak, tür, yaşam dönemi, okuma süresi ve ilişkili slug alanlarını ekle.
- Kaynak doğrulama testi, rehber şablonu ve katkı dokümantasyonu ekle.
- Araç route'larını kur; sağlık verisi gerektiren listeleri gizli TODO kayıtlarıyla boş durumda bırak.
- Kaynaklı yaş hesaplama saf fonksiyonunu ve toleranslı arama normalizasyonunu test et.
- Pati varsa Bugün/7 gün seçkisini ve kişiselleştirilmiş önerileri göster; yoksa mevcut karşılama akışını koru.
- Uygulamanın gerçek veri davranışına uygun taslak yasal metinleri ve doğrudan web route'larını ekle.

## Aşama 6 — Web sunumu, EAS/Updates ve teslim raporu

- Geniş web ekranlarında telefon çerçevesi ve demo açıklamasını ekle; mobil görünümü değiştirme.
- Türkçe HTML metadata ve OG etiketlerini tanımla.
- Preview/production build profilleri, runtime version ve update kanallarını düzenle.
- README'ye rehber ekleme ve test sürümü paylaşma adımlarını ekle.
- Yalnızca plan olarak Supabase çevrimdışı-öncelikli senkron belgesini yaz.
- Son typecheck, test ve web export doğrulamasından sonra ayrıntılı raporu oluştur.

Her aşamanın çıkış koşulu `npm run typecheck` ve `npm test` komutlarının başarılı olmasıdır.
