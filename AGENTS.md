# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Proje kuralları

- Mevcut görsel tasarımı, renkleri ve Türkçe dili koru. Kullanıcıya görünen tüm yeni metinler sıcak ve samimi Türkçe olmalı; “dostun” ve “patin” dili sürdürülmeli.
- Sağlık, beslenme, zehirlilik veya acil durum bilgisi uydurma. Yalnızca veri yapısını kur. Örnek kayıtları `TODO: kaynak ve veteriner onayı gerekli` olarak işaretle ve kullanıcıya gösterme. Hesaplama formülü yalnızca güvenilir kaynakla kullanılmalı; kaynak kod yorumunda ve raporda belirtilmeli. Kaynak belirsizse sonucu gizle ve raporla.
- Mevcut rehber içeriklerinin metnini değiştirme. Uydurma veteriner adı, yazar adı veya kaynak ekleme.
- Platforma özel kodda `Platform.OS` kontrolü kullan; web'de bildirim gibi mobil API'ler hata vermemeli.
- Her dokunulabilir öğe `accessibilityRole` ve Türkçe `accessibilityLabel` taşır.
- İzinler açılışta değil, özellik ilk kullanıldığında istenir.
