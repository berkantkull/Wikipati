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

Bu sürüm yerel çalışan bir başlangıç uygulamasıdır. Üyelik/giriş, sunucu, bulut eşitleme, aile erişimi, veterinerle süreli paylaşım, yönetim paneli, AI arama ve karne OCR henüz uygulanmadı. Kapsamlı tür/ırk/hastalık ansiklopedisi yerine güvenilir kaynaklardan derlenen altı kısa başlangıç metni vardır. Yedek dosyasından geri yükleme henüz yoktur; çöp kutusundan geri alma vardır.

Veriler AsyncStorage içinde tutulur; uygulama düzeyinde şifreleme yoktur. Kullanıcı hesabı veya uzak servise aktarım yapılmaz. Uygulamanın kaldırılması verileri silebilir. Yeni web ekleri data URI olarak saklanır; eski geçici URI eklerini yeniden seçmek gerekebilir. Mobil JSON dışa aktarma belge dosyalarını içermez. Büyük dosyalar cihaz/tarayıcı depolama kotasını aşabilir; kayıt hatası ekranda gösterilir.

Bildirim, ayarlardan seçilen gün/saatte yerel işletim sistemi bildirimi olarak planlanır. Varsayılan bir gün önce 09.00; erken zaman geçmişse bakım günü seçilen saat kullanılır. İki zaman da geçmişse durum gösterilir. Tamamlama, silme ve hatırlatmaları kapatma ilgili bildirimleri iptal eder; düzenleme, geri alma ve tercih değişimi yeniden planlar. En yakın 60 kayıt planlanır; uygulama açıldığında/kayıt değiştiğinde sıra yenilenir. İzin otomatik kabul edilmez: Ayarlar'daki düğme işletim sistemi izin ekranını açar, kalıcı ret durumunda telefon ayarlarına yönlendirir. İzin durumuna uygulamaya dönüşte yeniden bakılır. Bildirime dokunmak takvimi açar.

Telefon doğrulaması: Ayarlar → Bildirimlere izin ver → Bakım hatırlatmaları açık → 5 saniye sonra test bildirimi gönder. Gerçek teslimat fiziksel cihazda henüz test edilmedi. Otomatik testlerde Expo bildirim API'si taklit edilir; bu testler fiziksel teslimat kanıtı değildir. Tarayıcı bildirimi desteklenmez ve kontroller açıklamayla devre dışıdır. Yerel bildirimler için uzak push sunucusu gerekmez. Cihaz izinleri, sessiz/odak modu ve güç yönetimi görünürlüğü/teslimatı etkileyebilir.

## Kontroller

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/*.test.mjs
npx expo export --platform all
```

Tarayıcı önizlemesinde profil ve bakım kaydı oluşturma akışları ayrıca kontrol edildi. Üretim sürümü için fiziksel Android/iOS cihaz testleri, erişilebilirlik, veri yaşam döngüsü, yetkilendirme ve kaynak doğrulaması gerekir.

24 Eylül doğrulaması: profil düzenleme, hazırlık listesi kalıcılığı, kilo ekleme/düzeltme, çizgi grafiği, kayıt silme/geri alma ve profilin bağlı kayıtlarla çöp kutusuna taşınması tarayıcıda denendi. Test için oluşturulan “Kontrol Patim Düzenlendi” profili ve iki ölçümü çöp kutusunda bırakıldı; geri alınabilir. Mevcut kullanıcı profillerine dokunulmadı. 11 otomatik test geçer. Windows Uygulama Denetimi `hermesc.exe` çalıştırılmasını engellediğinden standart bytecode export bu ortamda tamamlanamadı; JavaScript paket kontrolü `npx expo export --platform all --no-bytecode` ile yapılır. Bu komut üretim bytecode doğrulamasının yerine geçmez.

