# Wikipati

Türkçe, topluluk içermeyen Expo / React Native mobil uygulaması. Android ve iOS kaynak kodu; web hedefi geliştirme önizlemesidir.

## Çalıştırma

```sh
npm install
npm start
```

Terminaldeki QR kodunu SDK 57 ile uyumlu Expo Go ile açın. Native bildirim ve belge akışlarını gerçek cihazda doğrulayın. Expo Go sürümü uyumsuzsa EAS geliştirme/önizleme derlemesi kullanın.

```sh
npx eas-cli build --platform android --profile preview
```

EAS hesabı ve proje bağlantısı gerekir. iOS dağıtımı için Apple geliştirici hesabı ve imzalama gerekir. Mağazaya gönderim yapılmadı; APK henüz üretilmedi.

## Çalışan kapsam

- Ansiklopedi ana sayfası: Türkçe arama, tür/konu filtreleri ve alfabetik madde dizini.
- Madde okuma: içindekilerden bölüme atlama, bilgi kutusu, ilgili maddeler, önceki maddeye dönüş ve kaynakça.
- Maddeden bakım formuna geçiş: seçilen konu kayıt başlığına taşınır; tarih kullanıcı tarafından belirlenir.

- Çoklu hayvan profili, fotoğraf, doğum tarihi, ırk ve alerji notları.
- Profil ve kayıt düzenleme; silme onayı, çöp kutusu ve geri alma.
- Her pati için ilk gün / ilk hafta / ilk veteriner görüşmesi hazırlık listesi.
- Tarih eksenli kilo grafiği, 30/90 günlük filtreler, paylaşılabilir metin özeti.
- Ayarlar: gerçek telefon bildirim izni, hatırlatmaları aç/kapat, gün/saat tercihi ve 5 saniyelik test bildirimi.
- Aşı, parazit, ilaç, kontrol, operasyon, bakım, kilo ve serbest not kayıtları.
- PDF / fotoğraf belgesi ekleme, mobil cihazda uygulama dizinine kopyalama ve paylaşma.
- Planlı bakımlar, tamamlandı ve bir gün ertele işlemleri.
- Yerel bildirim izni, tarihli hatırlatma, izin/planlama hata durumu.
- Kaynak bağlantılı altı başlangıç rehberi, Türkçe arama, kategori/tür filtreleri, favoriler.
- Cihazda kalıcı kayıt ve JSON dışa aktarma (belge dosyalarını içermez).

## Sınırlar ve henüz tamamlanmayan kapsam

Bu sürüm yerel çalışan bir başlangıç uygulamasıdır. Üyelik/giriş, sunucu, bulut eşitleme, aile erişimi, veterinerle süreli paylaşım, yönetim paneli, AI arama ve karne OCR henüz uygulanmadı. Kapsamlı tür/ırk/hastalık ansiklopedisi yerine güvenilir kaynaklardan derlenen altı kısa başlangıç metni vardır. JSON yedekten birleştirerek geri yükleme ve çöp kutusundan geri alma vardır.

Veriler AsyncStorage içinde tutulur; uygulama düzeyinde şifreleme yoktur. Kullanıcı hesabı veya uzak servise aktarım yapılmaz. Uygulamanın kaldırılması verileri silebilir. Yeni web ekleri data URI olarak saklanır; eski geçici URI eklerini yeniden seçmek gerekebilir. Mobil JSON dışa aktarma belge dosyalarını içermez. Büyük dosyalar cihaz/tarayıcı depolama kotasını aşabilir; kayıt hatası ekranda gösterilir.

Bildirim, ayarlardan seçilen gün/saatte yerel işletim sistemi bildirimi olarak planlanır. Varsayılan bir gün önce 09.00; erken zaman geçmişse bakım günü seçilen saat kullanılır. İki zaman da geçmişse durum gösterilir. Tamamlama, silme ve hatırlatmaları kapatma ilgili bildirimleri iptal eder; düzenleme, geri alma ve tercih değişimi yeniden planlar. En yakın 60 kayıt planlanır; uygulama açıldığında/kayıt değiştiğinde sıra yenilenir. İzin otomatik kabul edilmez: Ayarlar'daki düğme işletim sistemi izin ekranını açar, kalıcı ret durumunda telefon ayarlarına yönlendirir. İzin durumuna uygulamaya dönüşte yeniden bakılır. Bildirime dokunmak takvimi açar.

Telefon doğrulaması: Ayarlar → Bildirimlere izin ver → Bakım hatırlatmaları açık → 5 saniye sonra test bildirimi gönder. 18 Ekim 2026 tarihinde kullanıcı, 5 saniyelik test bildiriminin telefonuna ulaştığını doğruladı. Uzun süreli planların arka planda teslimatı ve diğer cihazlar ayrıca test edilmelidir. Otomatik testlerde Expo bildirim API'si taklit edilir; bu testler fiziksel teslimat kanıtı değildir. Tarayıcı bildirimi desteklenmez ve kontroller açıklamayla devre dışıdır. Yerel bildirimler için uzak push sunucusu gerekmez. Cihaz izinleri, sessiz/odak modu ve güç yönetimi görünürlüğü/teslimatı etkileyebilir.

## Kontroller

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/*.test.mjs
npx expo export --platform all
```

Tarayıcı önizlemesinde profil ve bakım kaydı oluşturma akışları ayrıca kontrol edildi. Üretim sürümü için fiziksel Android/iOS cihaz testleri, erişilebilirlik, veri yaşam döngüsü, yetkilendirme ve kaynak doğrulaması gerekir.

24 Eylül doğrulaması: profil düzenleme, hazırlık listesi kalıcılığı, kilo ekleme/düzeltme, çizgi grafiği, kayıt silme/geri alma ve profilin bağlı kayıtlarla çöp kutusuna taşınması tarayıcıda denendi. Test için oluşturulan “Kontrol Patim Düzenlendi” profili ve iki ölçümü çöp kutusunda bırakıldı; geri alınabilir. Mevcut kullanıcı profillerine dokunulmadı. Bu doğrulamada 11 otomatik test geçti. Windows Uygulama Denetimi `hermesc.exe` çalıştırılmasını engellediğinden standart bytecode export bu ortamda tamamlanamadı; JavaScript paket kontrolü `npx expo export --platform all --no-bytecode` ile yapılır. Bu komut üretim bytecode doğrulamasının yerine geçmez.

## 18 Ekim 2026 arayüz güncellemesi

- Keşfet: arama, konu kartları, seçili rehber, kişisel bakım özeti ve yardımcı ilk adımlar kartı.
- Pati profili: kayıt/plan sayıları, sıradaki veya tarihi geçmiş bakım, Geçmiş / Kilo / İlk adımlar bölümleri.
- Takvim: Planlı / Bugün / Geçmiş, pati filtresi ve tarihe göre gruplandırma.
- İçerik okuma: kompakt madde bilgileri, doğrudan kaynakçaya erişim, mevcut içindekiler ve ilgili maddeler.
- Formlar: açılır takvim, yıl girişi, alan bazında hatalar, çok satırlı notlar ve sabit Kaydet düğmesi.
- Yedek: Ayarlar üzerinden dışa aktar / geri yükle. JSON şeması ve tarih/ilişki/kimlik doğrulaması yapılır. Önizleme sonrası yalnızca eksik kayıtlar eklenir; mevcut kayıtlar ve tercihler korunur. Çöp kutusundaki kayıtlar otomatik diriltilmez. Dosya boyutu sınırı 10 MB. Fotoğraflar, belgeler, çöp kutusu ve bildirim tercihleri taşınmaz; bildirimler hedef cihazın tercihleriyle yeniden planlanır.
- 15 otomatik test ve TypeScript kontrolü geçti; iOS/Android/web JavaScript export başarılı. Bu, imzalı cihaz derlemesi veya mağaza yayını değildir.
- Tarayıcıda tarih seçimi, boş başlık hatası ve test yedeğinin profil/kilo kaydıyla birleştirilmesi doğrulandı. Oluşturulan “Tasarım Testi” profili test sonunda geri alınabilir çöp kutusuna taşındı.

### Çoklu hatırlatma ve yakındaki klinikler
- Bakım hatırlatmaları aynı gün, 1 gün önce ve 3 gün önce birlikte seçilebilir. Saat/dakika serbest girilebilir; eski tek seçimli tercihler korunarak taşınır.
- Yakınımdaki veterinerler konum izninden sonra Google Maps arama sonuçlarını iOS/Android üzerinde uygulama içi WebView ile açar. Konum izni olmadan semt/ilçe ile arama da vardır. Overpass servisi bu akıştan kaldırıldı. Google Maps arayüzü değiştirilmez/kazınmaz; liste ve klinik detayları Google tarafından gösterilir. Web sürümünde Maps bağlantısı açılır (Google Maps arama sayfası iframe içinde desteklenmediğinden).
- Yaklaşık konum (4 ondalık) veya yazılan semt Google Maps’e gönderilir; uygulama bunları diske kaydetmez. Yerel klinik kartları için gelecekte sunucu üzerinden Places API gerekir; bu değişiklik API anahtarı gerektirmez. WebView Expo Go SDK57 içinde mevcuttur; bağımsız kurulum için yeniden native derleme gerekir.
- 18 Ekim doğrulaması: Maps semt araması gerçek klinik/adres/telefon sonuçlarıyla tarayıcıda kontrol edildi. iOS/Android JS paketleri oluşturuldu; kullanıcı fiziksel telefonda sonuç ekranının açıldığını doğruladı. Ardından üst açıklamalar kaldırıldı ve alt araç çubuğuyla sonuç alanı genişletildi.
- Kullanıcı fiziksel telefonda 5 saniyelik test bildiriminin ulaştığını doğruladı. Çoklu gün planlaması otomatik testlerle doğrulandı; gerçek günlerde teslim ve yeni konum akışı cihazda ayrıca denenmelidir.

## Yeni kullanım akışları
- İlk kullanımda profil oluşturma, yaşam dönemi ve ilgi alanı seçimi; Ayarlar’dan tekrar açılabilir.
- Kütüphanede 10 kaynaklı madde, yaşam dönemi/tür/konu filtreleri, terimler sözlüğü ve ilgili içerikler.
- Patilerim → Sağlık karnesi: kayıt türü ve belge filtresi, tarih sıralı geçmiş, PDF paylaşımı (webde yazdırma penceresi).
- Günlük/haftalık/30 günlük tekrar: tamamlanan kayıt korunur, sıradaki gelecek tarih oluşturulur. Gecikmiş aralıklar yeniden yığılmaz. Erteleme ilk tarihi korur. Otomatik ilaç dozu önerilmez.
- Ayarlar → Hesabım ve bulut yedekleri: e-posta koduyla oturum, tarihli yedekler, geri yükleme önizlemesi ve aynı kayıt için sürüm seçimi. Supabase kurulumu için `supabase/README.md`, SQL şeması ve `.env.example` hazırdır. Canlı bulut bu çalışma ortamında yapılandırılmadı. Dosya ve fotoğraflar yedeğe dahil değildir; otomatik çift yönlü eşitleme yoktur.

## GitHub Pages web yayını

- `.github/workflows/pages.yml`, `master` güncellendiğinde testleri çalıştırır ve web paketini GitHub Pages'e gönderir.
- GitHub Settings → Pages → Source: GitHub Actions seçilmelidir. Özel depolar için Pages destekleyen bir GitHub planı gerekir; mevcut hesapta etkinleştirme plan engeline takıldı.
- Hedef adres: https://berkantkull.github.io/Wikipati/ (Pages etkinleştirilmeden yayında değildir).
- `GITHUB_PAGES=true` yalnızca web yayınında `/Wikipati` taban yolunu etkinleştirir; yerel Expo çalışması değişmez.
- CI ortamında bulut bağlantısı kapalıdır. `.env`, cihaz verileri ve yerel derleme çıktıları repoya gönderilmez.
- Tarayıcı kayıtları o tarayıcıda tutulur; Expo Go verileri otomatik taşınmaz. Yerel mobil bildirimler web sürümünde desteklenmez.
