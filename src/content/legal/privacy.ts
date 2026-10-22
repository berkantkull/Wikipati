// TASLAK – hukuki inceleme gerekli
export const privacy = {
  slug: "gizlilik",
  title: "Gizlilik Politikası",
  sections: [
    ["Cihazındaki veriler", "Pati profilleri, sağlık ve bakım kayıtları, tercihler, fotoğraflar ve belgeler varsayılan olarak cihazındaki yerel depolamada tutulur."],
    ["Paylaşım ve yedek", "PDF veya JSON yedeği oluşturduğunda dosyanın nereye gönderileceğini işletim sisteminin paylaşım ekranında sen seçersin. Fotoğraf ve belgeler yeni yedek biçimine dahil edilir."],
    ["Konum ve bildirim", "Konum yalnızca veteriner aramasını başlattığında istenir ve harita aramasına aktarılır; Wikipati konumu kalıcı olarak saklamaz. Bakım bildirimleri cihazında yerel olarak planlanır."],
    ["Bulut hesabı", "Bulut hesabı varsayılan olarak kapalıdır. Proje sahibi özelliği etkinleştirirse e-posta girişi ve kullanıcıya ait yedekler Supabase hizmetine gönderilebilir; uygulama arayüzü bu durumu ayrıca belirtir."],
    ["Analitik", "Uygulamada reklam veya davranış analitiği SDK'sı bulunmaz."],
  ],
};
