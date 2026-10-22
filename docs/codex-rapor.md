# Codex uygulama raporu

Tarih: 22 Ekim 2026

## Aşama sonuçları

### Aşama 1 — Plan ve proje kuralları: yapıldı

- İstenen kaynak, yapılandırma, test, workflow ve Supabase dosyaları incelendi.
- `docs/codex-plan.md` ve kalıcı `AGENTS.md` proje kuralları eklendi.
- Başlangıçta 26 test ve TypeScript kontrolü başarılıydı.

### Aşama 2 — Expo Router ve splash: yapıldı

- Expo Router, font, splash, screens, linking, constants ve updates paketleri Expo SDK 57 uyumlu sürümlerle kuruldu.
- Beş sekme, rehber/pati/takvim detay route'ları, Türkçe 404, `wikipati` scheme'i ve GitHub Pages 404 fallback'i eklendi.
- Ionicons ve ilk AsyncStorage okuması hazır olmadan splash kapanmıyor; dört saniyelik güvenli zaman aşımı sonsuz splash'i önlüyor.
- Mevcut ekran bileşenleri korunarak route kabuklarından kullanıldı. Sekme ve rehber geçişleri gerçek URL/navigasyon geçmişi oluşturuyor.

### Aşama 3 — İzinler, bildirim ve erişilebilirlik: yapıldı

- Bildirim, konum ve galeri izinlerinden önce Türkçe açıklama gösteriliyor; reddedilen izinlerde ayarlara geçiş var.
- İzinler açılışta istenmiyor. Konum reddedilirse semt/ilçe araması kullanılabiliyor.
- Bildirim içeriği pati adını ve işi içeriyor; hedef route veri alanına yazılıyor. Kök layout açık, arka plan ve kapalı uygulama yanıtlarını işliyor; geçersiz pati kimliğinde Patilerim'e dönüyor.
- Takvim kayıtlarında tek dokunuşla “Yapıldı” eylemi var.
- Ortak butonlar, sekmeler, filtreler ve ana dokunma alanlarına Türkçe erişilebilirlik etiketleri ve durumları eklendi; yardımcı metin kontrastı koyulaştırıldı.

### Aşama 4 — Yedekleme: yapıldı

- `wikipati` yedeği v2 oldu; fotoğraf ve belgeler taşınabilir veri olarak yedeğe dahil ediliyor.
- Eski v1 ve biçimsiz eski yerel yedekler açılmaya devam ediyor.
- Geri yükleme öncesi pati, kayıt, fotoğraf ve belge sayısı gösteriliyor; kullanıcı cihazdaki/yedekteki sürümü seçiyor.
- Son yedek zamanı Ayarlar'da gösteriliyor. Kayıt varsa 30 gün sonra Keşfet hatırlatması çıkıyor; “Daha sonra” 14 gün erteliyor.
- v1/v2 ve dosyalı geri yükleme testleri eklendi.

### Aşama 5 — Rehberler, araçlar, ana ekran ve yasal: yapıldı

- Rehberlere sabit slug, ISO güncelleme tarihi, opsiyonel inceleyen, zorunlu kaynak listesi, tür, yaşam dönemi, okuma süresi ve ilişkili slug alanları eklendi.
- Mevcut rehber metinleri değiştirilmedi; tüm rehber kaynaklarını doğrulayan test eklendi.
- Yaş/yaşam dönemi, acil belirtiler ve “Zehirli mi?” route'ları eklendi.
- Acil ve zehirlilik verileri doğrulanmadığı için kullanıcıya gösterilmeyen TODO kayıtları olarak bırakıldı.
- Ana ekrana Bugün/yarın, yedi günlük özet, çoklu pati seçici ve Araçlar bölümü eklendi.
- Gerçek veri davranışını anlatan taslak gizlilik, KVKK, koşullar, tıbbi uyarı ve hakkında metinleri eklendi.

### Aşama 6 — Web, EAS ve dokümantasyon: yapıldı

- 768 px üzeri web görünümünde 430 px telefon çerçevesi, logo ve mobil demo notu eklendi; native görünüm koşullu kodla değişmedi.
- Türkçe HTML dili, başlık, açıklama ve Open Graph etiketleri eklendi.
- Preview APK/iOS internal ve production AAB/iOS store profilleri ile preview/production update kanalları tanımlandı.
- `runtimeVersion` uygulama sürümü politikasına bağlandı; version/build numaraları 1.0.0 / 1 / 1 olarak tutarlı hale getirildi.
- README'ye rehber ekleme ve test sürümü paylaşma adımları; ayrıca yalnızca plan olan bulut senkron belgesi eklendi.

## Verilen kararlar ve gerekçeleri

- Mevcut büyük ekran bileşeni tamamen yeniden yazılmadı; Expo Router route kabuklarından kullanıldı. Bu karar, mevcut mobil tasarımı ve davranışları korurken Android/web geri navigasyonunu düzeltmek için alındı.
- Splash'te font hatası veya depolama gecikmesi olsa bile uygulamayı açmak için dört saniyelik güvenli zaman aşımı kullanıldı.
- Kedi yaşam dönemleri 2021 AAHA/AAFP Feline Life Stage Guidelines (`https://catvets.com/resource/aaha-aafp-feline-life-stage-guidelines/`) eşiklerine göre hesaplanıyor. Köpeklerde 2019 AAHA Canine Life Stage Guidelines (`https://www.aaha.org/resources/life-stage-canine/`) kesin ileri yaş eşiğini ırk, boyut ve beklenen ömre bağladığı için dört yaş sonrasında uydurma sonuç yerine “Bireysel değerlendirme gerekli” gösteriliyor.
- Bulut senkronu istek gereği uygulanmadı; veri modeli, RLS, çevrimdışı kuyruk ve silme akışı yalnızca `docs/bulut-senkron-plani.md` içinde tasarlandı.
- Yasal metinler uygulamanın mevcut davranışına göre yazıldı ancak hukuki onay olmadığı için her dosya açıkça taslak olarak işaretlendi.

## TODO: kaynak gerekli

- `src/content/emergency.ts`: iki gizli acil belirti örneğinin güvenilir kaynağı ve veteriner onayı.
- `src/content/toxicity.ts`: üç gizli toksisite örneğinin kedi/köpek durumları, açıklamaları, güvenilir kaynakları ve veteriner onayı.
- `src/content/guides/_SABLON.ts`: yeni rehber oluşturulurken gerçek kaynak, tarih ve içerik.
- `src/content/legal/kvkk.ts` ve `about.ts`: veri sorumlusu, hukuki dayanak ve gerçek destek iletişim bilgisi.
- Köpeklerde boyut/ırka göre ileri yaşam dönemi hesaplaması için güvenilir, açık ve uygulanabilir veri tablosu; bulunana kadar sonuç gizli kalır.

## Kullanıcının cihazında elle test etmesi gerekenler

1. Android: Kütüphane → rehber → sistem geri tuşu → Kütüphane.
2. iOS/Android: uygulama açık, arka planda ve kapalıyken bildirime dokunma; doğru pati takvimine açılma ve “Yapıldı”.
3. Bildirim, konum ve galeri izinlerini ilk istemede reddetme; ikinci deneme, “Ayarları aç” ve konumda elle arama.
4. Fotoğraf ve PDF içeren v2 yedek alma, başka kurulumda önizleme ve geri yükleme; ayrıca eski v1 yedeği geri yükleme.
5. TalkBack/VoiceOver: sekmeler, filtreler, rehber araçları, formlar, izin açıklamaları ve takvim eylemleri.
6. 1.3× yazı boyutunda ana ekran, rehber, Ayarlar, formlar ve telefon çerçevesinde taşma kontrolü.
7. Release build'de splash görseli; Expo belgeleri Expo Go/dev build görünümünün mağaza build'iyle aynı olmayabileceğini belirtiyor.

## Bilinen sorunlar ve sınırlamalar

- Native simülatör/gerçek cihaz bu oturumda bağlı olmadığı için Android geri tuşu, bildirim dokunuşu, sistem izin pencereleri, paylaşım ve TalkBack uçtan uca otomatik doğrulanamadı.
- Yasal metinler taslaktır ve yayımdan önce hukuk incelemesi gerekir.
- Acil ve toksisite katalogları kaynak/veteriner onayı beklediği için bilinçli olarak boştur.
- Köpek yaş aracında dört yaş sonrası kesin yaşam dönemi gösterilmez; AAHA sınıflandırması bireysel beklenen yaşam süresini gerektirir.
- EAS Update yayınından önce proje bir EAS projectId ile bağlanmalı ve `eas update:configure` çalıştırılmalıdır; kanal ve runtime politikası hazırdır.
- Supabase otomatik senkronu uygulanmadı; mevcut opsiyonel bulut yedeği özelliği ayrı kalır.
