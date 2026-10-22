# Wikipati

Evcil hayvanların bakımı hakkında bilgi bulabileceğin, sağlık kayıtlarını ve günlük bakımını takip edebileceğin bir uygulama. Expo ve React Native ile geliştiriliyor.

[Tarayıcıda aç](https://berkantkull.github.io/Wikipati/)

## Neler var?

- Kaynaklarıyla birlikte bakım, beslenme ve sağlık rehberleri
- Her pati için ayrı profil, sağlık karnesi ve kilo takibi
- Aşı ve bakım takvimi, telefonda hatırlatma bildirimleri
- PDF sağlık karnesi, veteriner görüşme notları ve bakım paylaşım kartları
- Yakındaki veterinerleri haritada arama
- Kayıtları dosyaya yedekleme ve geri yükleme

Kayıtlar kullanılan cihazda veya tarayıcıda saklanır. Bulut yedekleme varsayılan olarak kapalıdır. Sürümlü dosya yedekleri fotoğraf ve belgeleri de içerir. Hatırlatma bildirimleri mobil uygulamada çalışır; web sürümünde desteklenmez.

## Çalıştırma

Node.js 24 ile:

```sh
npm ci
npm start
```

QR kodunu Expo SDK 57 ile uyumlu Expo Go'da aç. Tarayıcı için `npm run web` komutunu kullan.

## Geliştirme

```sh
npm run typecheck
npm test
```

`master` dalına gönderilen değişiklikler GitHub Actions üzerinden Pages'e yayınlanır.

## Yeni rehber nasıl eklenir?

1. [`src/content/guides/_SABLON.ts`](src/content/guides/_SABLON.ts) dosyasındaki alanları örnek al.
2. Türkçe karaktersiz ve değişmeyecek bir `slug` belirle.
3. En az bir HTTPS kaynağı ekle; mevcut rehber metnini değiştirme ve doğrulanmamış sağlık bilgisi yazma.
4. Veteriner incelemesi yoksa `reviewedBy` alanını boş bırak.
5. İlişkili içerikleri `relatedSlugs` ile bağla.
6. `npm run typecheck` ve `npm test` çalıştır. Kaynak doğrulama testi tüm rehberleri denetler.

## Test sürümü paylaşma

Android APK iç test sürümü:

```sh
eas build -p android --profile preview
```

TestFlight / iOS üretim derlemesi:

```sh
eas build -p ios --profile production
eas submit -p ios
```

Preview kanalına JavaScript güncellemesi:

```sh
eas update --channel preview --message "Değişiklik özeti"
```

[Bulut kurulumu](supabase/README.md) · [Yayın öncesi kontrol listesi](RELEASE-CHECKLIST.md)
