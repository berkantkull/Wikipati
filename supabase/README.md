# Bulut hesabını etkinleştirme

1. Supabase hesabında bir proje oluştur. SQL Editor’da `schema.sql` dosyasını çalıştır.
2. Authentication → Providers → Email açık olsun. Önce kendi SMTP hizmetini bağla. Ücretsiz planda varsayılan e-posta hizmetiyle şablon düzenleme kapalıdır; ayrıca bu hizmet yalnızca proje ekibinin adreslerine gönderir. Authentication → Emails altında hem Confirm sign up hem Magic link or OTP şablonlarına `email-otp.html` içeriğini koy, konu olarak “Wikipati giriş kodun” yaz. Uygulama link yerine e-posta kodunu doğrular; iki şablon da ilk kayıt ve sonraki giriş için gereklidir.
3. Proje URL’sini ve publishable/anon anahtarını kökteki `.env` dosyasına `.env.example` adlarıyla ekle. **service_role veya secret anahtarı kullanma.** Expo public anahtarları istemcide görünür; erişimi SQL satır güvenliği korur.
4. Expo geliştirme sunucusunu yeniden başlat. Ayarlar → Hesabım ve bulut yedekleri → Giriş kodu gönder akışını dene.
5. İki farklı hesapla kontrol et: bir hesabın yedekleri diğerine görünmemeli. Aynı hesapla ikinci telefonda yedekleri getir ve önizlemeyi onayla.

Yedekler tarihli, değiştirilemez kayıtlar olarak tutulur. Geri yükleme eksik kayıtları ekler. Aynı kimlikli kayıtlarda varsayılan olarak cihazdaki sürüm korunur; önizlemede kullanıcı yedekteki sürümü seçerse metin bilgileri güncellenir. Mevcut yerel ek dosyalar korunur. Silinen kayıtlar diriltilmez. Bu sürüm otomatik çift yönlü eşitleme yapmaz; kullanıcı açıkça yükleme/geri yükleme yapar. Fotoğraf ve belge dosyaları dahil değildir. Canlı servis kurulmadan oturum, e-posta teslimi ve cihazlar arası erişim test edilmiş sayılmaz.

Proje sahibi kullanıcı isteği halinde Dashboard üzerinden hesabını ve ona bağlı yedekleri kaldırabilir. Üretim yayınından önce uygulama içi hesap silme, gizlilik metni, kota ve yedek saklama süresi tamamlanmalıdır.

## Canlı kurulum durumu — 18 Ekim 2026

- Wikipati projesinde şema çalıştırıldı. RLS açık, iki sahiplik politikası mevcut, anonim okuma kapalı olduğu SQL ile doğrulandı.
- Proje bağlantısı yerel, Git tarafından dışlanan `.env` dosyasına eklendi; yalnızca istemci publishable anahtarı kullanılıyor.
- SMTP bağlantısı ve iki OTP e-posta şablonunun uygulanması bekliyor. Tamamlanmadan giriş ve bulut yedekleme kullanıma hazır sayılmaz.
- SMTP tamamlanınca Expo yeniden başlatılmalı; gerçek e-posta girişi, yedekleme/geri yükleme ve iki hesap arasındaki izolasyon uçtan uca test edilmeli.

Bulut girişinin görünmesi için SMTP kurulumu sonrasında `.env` içine `EXPO_PUBLIC_CLOUD_ENABLED=true` eklenmeli. Varsayılan kapalıdır; yalnızca URL ve anahtar eklemek kullanıcı girişini açmaz.
