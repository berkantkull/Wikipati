# Wikipati yayın kontrolü

## Bu hazırlıkta tamamlananlar
- Keşfet ekranında arama, bakım özeti ve günlük rutinlere öncelik verildi.
- Geciken bakım etiketi, açık filtre başlıkları ve sonuç yokken filtre sıfırlama eklendi.
- Ayarlar, açıklamalı ve erişilebilir açılır bölümlere ayrıldı.
- İlk kullanım kartı yalnızca ana sayfada gösteriliyor.
- Tamamlanmamış bulut girişi varsayılan olarak kapalı; dosyayla yedekleme kullanılabilir.
- Ekran hataları ve depolama okuma sorunlarında verileri silmeyen yeniden deneme sunuluyor.

## Yayını engelleyen kalan işler
- SMTP ve iki OTP şablonu; gerçek giriş, yedekleme ve iki kullanıcı arasında veri izolasyonu testi. Sonrasında EXPO_PUBLIC_CLOUD_ENABLED=true.
- Bulut hesapları açılacaksa uygulama içi hesap silme ve verilerin saklama/silme süreci.
- Gerçek işletmeci ve destek iletişimiyle gizlilik metni, mağaza gizlilik beyanları ve izin açıklamalarının son kontrolü.
- iOS ve Android dağıtım imzalarıyla gerçek üretim derlemesi; TestFlight ve Android iç test dağıtımı.
- Fiziksel cihazlarda soğuk açılış, büyük yazı, klavye, bildirimden açılma, uygulama yeniden açıldıktan sonra kayıt ve PDF/yedek paylaşımı kontrolü.
- Mağaza simgesi, ekran görüntüleri, açıklamalar, destek ve gizlilik URL'leri.

JavaScript export işleminin başarılı olması mağazaya gönderilebilir imzalı native derleme üretildiği anlamına gelmez. SMTP işi kullanıcı kararıyla yayın öncesine ertelenmiştir.
