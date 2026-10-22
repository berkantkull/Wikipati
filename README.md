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

Kayıtlar kullanılan cihazda veya tarayıcıda saklanır. Bulut yedekleme henüz açık değil. Fotoğraflar ve belgeler dosya yedeğine dahil değildir. Hatırlatma bildirimleri mobil uygulamada çalışır; web sürümünde desteklenmez.

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

[Bulut kurulumu](supabase/README.md) · [Yayın öncesi kontrol listesi](RELEASE-CHECKLIST.md)
