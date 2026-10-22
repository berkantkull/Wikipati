# Bulut senkron planı

> Bu belge yalnızca tasarımdır. Kullanıcı onayı olmadan uygulanmayacaktır.

## Supabase tabloları ve RLS

- `profiles`: `user_id`, görünen ad, oluşturma/güncelleme zamanları.
- `pets`: kullanıcıya ait pati profilleri ve `updated_at`.
- `care_entries`: sağlık/bakım kayıtları, tamamlanma durumu ve `updated_at`.
- `favorites`, `checklists`, `preferences`: kullanıcı ayarları ve kişiselleştirme.
- `sync_changes`: cihaz değişiklik kuyruğunun sunucu karşılığı ve idempotency anahtarı.
- Tüm tablolarda `user_id = auth.uid()` koşullu SELECT/INSERT/UPDATE/DELETE RLS politikaları bulunur; anonim rolün veri erişimi kapalı kalır.

## Giriş

- E-posta sihirli bağlantısı birincil yöntemdir.
- iOS için Apple ile giriş eklenir; Apple kimliği Supabase Auth hesabına bağlanır.
- Hesap açmak opsiyonel kalır. Kullanıcı yalnızca cihazda kayıt tutmaya devam edebilir.

## Çevrimdışı öncelikli senkron

- Yerel AsyncStorage ve cihaz dosyaları kullanıcı arayüzünün ana veri kaynağıdır.
- Her yerel değişiklik benzersiz işlem kimliğiyle bir kuyruğa yazılır.
- Bağlantı geldiğinde kuyruk sıralı ve tekrar çalıştırılabilir biçimde Supabase'e gönderilir.
- Çakışmada `updated_at` karşılaştırılır; aynı kaydın iki cihazda değişmesi halinde veri kaybetmemek için kullanıcıya iki sürüm gösterilir. Otomatik son-yazan-kazan yalnızca açıkça güvenli alanlarda kullanılır.
- Sunucudan gelen silmeler mezar taşı (tombstone) kaydıyla tutulur; eski cihaz verisi silinmiş kaydı diriltmez.

## Fotoğraflar ve belgeler

- Dosyalar özel Supabase Storage kovasında `user_id/pet_id/...` yolu altında saklanır.
- Storage politikaları yalnızca dosya sahibine erişim verir.
- Veritabanında dosyanın yolu, MIME türü, boyutu, özeti ve güncelleme zamanı tutulur.
- Yükleme kuyruğu çevrimdışı çalışır; başarısız aktarım yerel dosyayı silmez.

## İlk girişte yerel verinin taşınması

1. Kullanıcıya taşınacak pati, kayıt, fotoğraf ve belge özeti gösterilir.
2. Açık onaydan sonra yerel kayıtlar kimlikleri korunarak hesaba yüklenir.
3. Sunucuda aynı kimlik varsa çakışma önizlemesi sunulur.
4. Taşıma tamamlanmadan yerel veriler silinmez ve hesap bağlantısı zorunlu hale gelmez.

## Hesap ve veri silme

- Ayarlar'da “Hesabımı ve bulut verilerimi sil” işlemi bulunur.
- Yeniden kimlik doğrulama ve açık onaydan sonra veritabanı satırları, Storage dosyaları ve Auth hesabı sunucu tarafı güvenli işlemle silinir.
- Kullanıcı yerel verileri ayrıca saklamayı veya cihazdan da silmeyi seçer.
- Silme sonucu ve tamamlanamayan dosyalar kullanıcıya raporlanır.
