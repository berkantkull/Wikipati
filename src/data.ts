export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthday: string;
  allergies: string;
  lifeStage?: string;
  needs?: string[];
  photo?: string;
};
export type Entry = {
  id: string;
  petId: string;
  title: string;
  kind: string;
  date: string;
  notes: string;
  weight?: number;
  file?: string;
  fileName?: string;
  done: boolean;
  notification?: string;
  repeatDays?: number;
  completedAt?: string;
  postponedFrom?: string;
  notificationState?: string;
};
export type Preferences = {
  reminders: boolean;
  daysBefore: number | number[];
  hour: number;
  minute?: number;
};
export type TrashItem = {
  id: string;
  pet?: Pet;
  entries: Entry[];
  deletedAt: string;
};
export type Store = {
  pets: Pet[];
  entries: Entry[];
  favorites: string[];
  preferences: Preferences;
  checklist: Record<string, string[]>;
  trash: TrashItem[];
  onboardingDone?: boolean;
  lastBackupAt?: string;
  backupReminderSnoozedUntil?: string;
};
export const defaultPreferences: Preferences = {
  reminders: true,
  daysBefore: [1],
  hour: 9,
  minute: 0,
};
export const emptyStore: Store = {
  pets: [],
  entries: [],
  favorites: [],
  preferences: defaultPreferences,
  checklist: {},
  trash: [],
};
export const categories = ["Tümü", "Bakım", "Beslenme", "Sağlık", "Davranış"];
const cat =
  "https://www.merckvetmanual.com/cat-owners/caring-for-cats/routine-health-care-of-cats";
const dog =
  "https://www.merckvetmanual.com/dog-owners/routine-care-of-dogs/routine-health-care-of-dogs";
export const articles = [
  {
    id: "1",
    title: "Küçük alışkanlıklar, sağlıklı patiler",
    category: "Bakım",
    species: "Kedi",
    icon: "paw",
    color: "#E9EDE1",
    minutes: 3,
    summary: "Kedinizin günlük bakımına sakin bir başlangıç.",
    body: "Düzenli bakım; beslenme, ağız sağlığı, tüy bakımı ve veteriner kontrollerini birlikte kapsar. Kedinizin iştahını ve günlük davranışlarını gözlemlemek, değişiklikleri fark etmenizi kolaylaştırır.\n\nBakımı kısa ve sakin seanslara bölün. Kontrol tarihlerini veterinerinizle belirleyip bakım takvimine ekleyin.",
    source: cat,
  },
  {
    id: "2",
    title: "Aşı takvimini birlikte planlayın",
    category: "Sağlık",
    species: "Tümü",
    icon: "medkit",
    color: "#F3E8DA",
    minutes: 2,
    summary: "Her dostun ihtiyacı ve takvimi kendine özeldir.",
    body: "Aşı planı hayvanın yaşı, sağlık durumu ve yaşam koşulları değerlendirilerek veteriner tarafından belirlenir. İnternetteki genel bir takvimi kişisel reçete olarak kullanmayın.\n\nUygulama tarihini, aşı adını ve veterinerinizin verdiği sonraki randevuyu sağlık kaydınıza ekleyebilirsiniz.",
    source: dog,
  },
  {
    id: "3",
    title: "Beslenme rutinini tanıyın",
    category: "Beslenme",
    species: "Kedi",
    icon: "restaurant",
    color: "#F6E7DE",
    minutes: 2,
    summary: "Öğünleri ve değişiklikleri takip etmekle başlayın.",
    body: "Beslenme ihtiyaçlarını kedinizin yaşam evresine ve sağlık durumuna göre veterinerinizle değerlendirin. Taze suya erişimini sağlayın.\n\nMama değişikliklerini ve iştahındaki farklılıkları not edin. Bu notlar bir sonraki kontrolde görüşmenize yardımcı olabilir.",
    source: cat,
  },
  {
    id: "4",
    title: "Köpeğinizin bakım rehberi",
    category: "Bakım",
    species: "Köpek",
    icon: "heart",
    color: "#E4EBF0",
    minutes: 3,
    summary: "Günlük gözlemden düzenli kontrollere.",
    body: "Düzenli veteriner kontrolleri, diş ve tüy bakımı köpeğinizin bakımının parçalarıdır. Günlük rutinde fark ettiğiniz değişiklikleri kaydedin.\n\nBakım ve koruyucu uygulamaların sıklığını veterinerinizle planlayın.",
    source: dog,
  },
  {
    id: "5",
    title: "Davranış değişikliklerini kaydedin",
    category: "Davranış",
    species: "Tümü",
    icon: "sparkles",
    color: "#ECE5F2",
    minutes: 2,
    summary: "Dostunuzun günlük ritmine daha yakından bakın.",
    body: "Günlük davranışlarını tanımak değişiklikleri fark etmenizi sağlar. İştah, hareketlilik ve sosyal davranıştaki değişikliklerin ne zaman başladığını not edin.\n\nYeni veya devam eden bir değişikliği veterinerinizle görüşün; yalnızca davranışa bakarak teşhis koymayın.",
    source: cat,
  },
  {
    id: "6",
    title: "Sağlık geçmişi neden değerli?",
    category: "Sağlık",
    species: "Tümü",
    icon: "document-text",
    color: "#E4EEE7",
    minutes: 2,
    summary: "Belgeler, uygulamalar ve notlar bir arada.",
    body: "Aşı ve parazit uygulamalarını, önceki operasyonları ve veteriner raporlarını bir arada tutun.\n\nBir sonraki ziyaretinizden önce kayıtları gözden geçirip sorularınızı hazırlayın. Uygulamadaki kayıtlar veteriner muayenesinin yerine geçmez.",
    source: dog,
  },
  {
    id: "7",
    title: "Yavru dostlar için güvenli ev",
    category: "Bakım",
    species: "Tümü",
    icon: "home",
    color: "#E9EDE1",
    minutes: 2,
    summary: "Yeni bir evde güvenli bir başlangıç.",
    body: "Temizlik ürünlerini ve kemirilebilecek elektrik kablolarını erişimden uzak tutun. Yavru dostunuzun dolaşacağı alanı gözden geçirin.\n\nEv hazırlıklarını ilk adımlar listenizde takip edebilir, kontrol planını veterinerinizle oluşturabilirsiniz.",
    source: dog,
  },
  {
    id: "8",
    title: "İleri yaşta bakım takibi",
    category: "Sağlık",
    species: "Tümü",
    icon: "heart",
    color: "#E4EEE7",
    minutes: 2,
    summary: "Değişen ihtiyaçları düzenli gözlemleyin.",
    body: "İleri yaşla birlikte kontrol gereksinimi değişebilir. Kontrol sıklığını veterinerinizle değerlendirin.\n\nİştah, hareketlilik ve kilo değişimlerini tarihle not etmek görüşmeye hazırlanmanıza yardımcı olur.",
    source: cat,
  },
  {
    id: "9",
    title: "Ağız ve diş bakımı",
    category: "Bakım",
    species: "Köpek",
    icon: "medical",
    color: "#F3E8DA",
    minutes: 2,
    summary: "Ağız bakımını rutinin bir parçası yapın.",
    body: "Köpeklere uygun diş fırçası ve macunuyla düzenli bakım yapılabilir. Tekniği veterinerinizden öğrenin.\n\nProfesyonel temizlik gereksinimini veterinerinizle değerlendirin. Bakım günlerini günlük listenizde takip edebilirsiniz.",
    source: dog,
  },
  {
    id: "10",
    title: "Günlük değişiklikleri fark etmek",
    category: "Sağlık",
    species: "Kedi",
    icon: "eye",
    color: "#E4EBF0",
    minutes: 2,
    summary: "Dostunuzun olağan halini tanıyın.",
    body: "İştah, su tüketimi, tuvalet alışkanlıkları ve hareketlilikte değişiklik olabilir. Ne zaman başladığını ve nasıl sürdüğünü not edin.\n\nEndişelendiren değişiklikler için veterinerinizle iletişime geçin. Notlar tanı koymak için değil, görüşmede bilgi paylaşmak içindir.",
    source: cat,
  },
];
export function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T09:00:00");
  return !isNaN(date.getTime()) &&
    date.getFullYear() === Number(value.slice(0, 4)) &&
    date.getMonth() + 1 === Number(value.slice(5, 7)) &&
    date.getDate() === Number(value.slice(8, 10))
    ? date
    : null;
}
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
