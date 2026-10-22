import React, { useRef, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { categories } from "./data";
import { findArticles, WikiArticle, wikiArticles, glossary } from "./wiki";
import { green, s } from "./styles";

function Action({
  label,
  onPress,
  icon = "arrow-forward",
  primary = false,
}: {
  label: string;
  onPress: () => void;
  icon?: any;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        w.action,
        primary && w.primary,
        pressed && { opacity: 0.65 },
      ]}
    >
      <Ionicons name={icon} size={19} color={primary ? "#fff" : green} />
      <Text style={[w.actionText, primary && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}
function EntryLink({
  article,
  onOpen,
}: {
  article: WikiArticle;
  onOpen: (a: WikiArticle) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${article.title} maddesini oku`}
      onPress={() => onOpen(article)}
      style={w.entry}
    >
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={w.entryTitle}>{article.title}</Text>
        <Text style={w.description}>{article.summary}</Text>
        <Text style={w.meta}>
          {article.category} ·{" "}
          {article.species === "Tümü" ? "Kedi ve köpek" : article.species}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#8C988B" />
    </Pressable>
  );
}
export function WikiHome({
  children,
  onOpen,
  onPets,
  onCalendar,
  onLibrary,
  onVets,
  onAddCare,
  petCount,
  careCount,
  nextCare,
}: {
  children?: React.ReactNode;
  onOpen: (a: WikiArticle) => void;
  onPets: () => void;
  onCalendar: () => void;
  onLibrary: () => void;
  onVets: () => void;
  onAddCare: () => void;
  petCount: number;
  careCount: number;
  nextCare?: string;
}) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("Tümü"),
    [species, setSpecies] = useState("Tümü");
  const results = findArticles(query, category, species);
  const searching =
    query.trim() !== "" || category !== "Tümü" || species !== "Tümü";
  const topics = [
    {
      title: "Bakım",
      icon: "leaf-outline",
      color: "#EBF2E3",
      detail: "Günlük küçük özenler",
    },
    {
      title: "Sağlık",
      icon: "medical-outline",
      color: "#F7EDE1",
      detail: "Kayıtlar ve kontroller",
    },
    {
      title: "Beslenme",
      icon: "restaurant-outline",
      color: "#F1E8E1",
      detail: "Dengeli bir rutin",
    },
    {
      title: "Davranış",
      icon: "sparkles-outline",
      color: "#E9EBF5",
      detail: "Dostunu daha iyi tanı",
    },
  ];
  return (
    <>
      <View style={w.masthead}>
        <Text style={w.kicker}>PATİLİ DOSTUNUN BAŞUCU REHBERİ</Text>
        <Text style={w.title}>Bilgiyle keşfet.
          {"\n"}Özenle takip et.</Text>
        <Text style={w.description}>
          Güvenilir kaynaklardan bilgi, dostuna özel bakım.
        </Text>
      </View>
      <View style={w.search}>
        <Ionicons name="search-outline" size={23} color={green} />
        <TextInput
          accessibilityLabel="Wikipati’de ara"
          placeholder="Bakım, beslenme, aşı…"
          value={query}
          onChangeText={setQuery}
          style={w.searchInput}
          returnKeyType="search"
        />
        {!!query && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aramayı temizle"
            onPress={() => setQuery("")}
            style={w.clear}
          >
            <Ionicons name="close" size={20} color={green} />
          </Pressable>
        )}
      </View>
      <View style={w.stats}>
        <Ionicons name="book-outline" size={15} color={green} />
        <Text style={w.meta}>Kaynaklı bilgiler · Çevrimdışı okuma</Text>
      </View>
      {!searching && <>
      <View style={w.personal}>
        <Text style={w.kicker}>DOSTUN İÇİN BUGÜN</Text>
        <Text style={w.sectionTitle}>
          {petCount
            ? "Bakımın bir adım önünde ol"
            : "Birlikte güzel bir başlangıç"}
        </Text>
        <Text style={w.description}>
          {nextCare ||
            (petCount
              ? "Yaklaşan bir bakım yok. Kayıtlarını ve notlarını tek yerde tut."
              : "Dostunun profilini ekle; sağlık geçmişi ve hatırlatmaları yanında olsun.")}
        </Text>
        <View style={w.personalActions}>
          <Action
            primary
            icon="paw-outline"
            label={petCount ? "Bakım kaydı ekle" : "İlk patimi ekle"}
            onPress={petCount ? onAddCare : onPets}
          />
          {petCount > 0 && (
            <Action
              icon="calendar-outline"
              label={`Takvim · ${careCount}`}
              onPress={onCalendar}
            />
          )}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Yakınımdaki veterinerler, klinikleri bul"
        onPress={onVets}
        style={({ pressed }) => ({
          backgroundColor: green,
          borderRadius: 22,
          padding: 20,
          gap: 12,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              backgroundColor: "#FFFFFF20",
              padding: 12,
              borderRadius: 16,
            }}
          >
            <Ionicons name="medical" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
              Yakınımdaki veterinerler
            </Text>
            <Text style={{ color: "#E5F0E9", fontSize: 14, lineHeight: 20 }}>
              Dostun için yakınında bir klinik bul.
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
            Klinikleri bul · Ara · Yol tarifi al
          </Text>
          <Ionicons name="arrow-forward" size={22} color="#fff" />
        </View>
      </Pressable>
      </>}
      <Text style={w.actionText}>Türüne göre keşfet</Text>
      <Text style={w.meta}>
        Kedi ve köpekler için kaynaklı bakım rehberleri.
      </Text>
      <View style={w.portals}>
        {["Tümü", "Kedi", "Köpek"].map((item) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item === "Tümü" ? "Tüm türler" : item} rehberlerini göster`}
            accessibilityState={{ selected: species === item }}
            key={item}
            onPress={() => setSpecies(item)}
            style={[w.portal, species === item && w.portalSelected]}
          >
            <Text
              style={[w.portalTitle, species === item && { color: "#fff" }]}
            >
              {item === "Tümü"
                ? "Tüm türler"
                : item === "Kedi"
                  ? "Kediler"
                  : "Köpekler"}
            </Text>
          </Pressable>
        ))}
      </View>
      {!searching && (
        <>
          <View style={w.sectionHeader}>
            <Text style={w.sectionTitle}>Neyi keşfetmek istersin?</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {topics.map((topic) => (
              <Pressable
                key={topic.title}
                accessibilityRole="button"
                accessibilityLabel={`${topic.title} rehberlerini göster`}
                accessibilityState={{ selected: category === topic.title }}
                onPress={() =>
                  setCategory(category === topic.title ? "Tümü" : topic.title)
                }
                style={{
                  width: "48%",
                  flexGrow: 1,
                  padding: 16,
                  gap: 9,
                  minHeight: 126,
                  borderRadius: 20,
                  backgroundColor: topic.color,
                  borderWidth: 1,
                  borderColor: category === topic.title ? green : "transparent",
                }}
              >
                <Ionicons name={topic.icon as any} size={25} color={green} />
                <Text style={w.entryTitle}>{topic.title}</Text>
                <Text style={w.meta}>{topic.detail}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      {searching ? (
        <>
          <View style={w.sectionHeader}>
            <Text style={w.sectionTitle}>
              {species === "Tümü"
                ? "Bilgi sonuçları"
                : `${species === "Kedi" ? "Kediler" : "Köpekler"} için bilgiler`}
            </Text>
            <Text style={w.meta}>{results.length} madde</Text>
          </View>
          <Action
            label="Filtreleri temizle"
            icon="refresh-outline"
            onPress={() => {
              setQuery("");
              setCategory("Tümü");
              setSpecies("Tümü");
            }}
          />
          <View>
            {results.map((a) => (
              <EntryLink key={a.id} article={a} onOpen={onOpen} />
            ))}
          </View>
          {!results.length && (
            <Text style={w.description}>
              Aramana uygun bir içerik bulunamadı. Başka bir sözcük deneyebilirsin.
            </Text>
          )}
        </>
      ) : (
        <>
          <View style={w.sectionHeader}>
            <Text style={w.sectionTitle}>Okumaya buradan başla</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kedi bakımı maddesini oku"
            onPress={() => onOpen(wikiArticles[0])}
            style={w.editorial}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={[w.kicker, { color: "#CDDEC9" }]}>
                GÜNLÜK BAKIM REHBERİ
              </Text>
              <Ionicons name="leaf-outline" size={34} color="#D8EBC7" />
            </View>
            <Text style={w.editorialTitle}>
              Küçük alışkanlıklar,{"\n"}daha iyi bir yaşam.
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 23, color: "#E1EBDF" }}>
              Kedinin günlük bakımını adım adım tanı.
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Rehberi oku · 3 dk
              </Text>
              <Ionicons name="arrow-forward" size={22} color="white" />
            </View>
          </Pressable>
          <View>
            {wikiArticles.slice(1, 3).map((a) => (
              <EntryLink key={a.id} article={a} onOpen={onOpen} />
            ))}
          </View>
          <Action
            label="Tüm bilgi kütüphanesi"
            icon="library-outline"
            onPress={onLibrary}
          />
        </>
      )}

      {!searching && children}
    </>
  );
}

export function WikiReader({
  personalContext,
  planAvailable = true,
  article,
  favorite,
  onFavorite,
  onOpen,
  onClose,
  onPlan,
  hasPet,
  onBack,
}: {
  personalContext?: React.ReactNode;
  planAvailable?: boolean;
  article: WikiArticle;
  favorite: boolean;
  onFavorite: () => void;
  onOpen: (a: WikiArticle) => void;
  onClose: () => void;
  onPlan: () => void;
  hasPet: boolean;
  onBack?: () => void;
}) {
  const [sourceError, setSourceError] = useState("");
  const [details, setDetails] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({});
  const jump = (id: string) =>
    scroll.current?.scrollTo({ y: positions.current[id] || 0, animated: true });
  const related = article.related
    .map((id) => wikiArticles.find((a) => a.id === id)!)
    .filter(Boolean);
  async function shareArticle() {
    const url = Platform.OS === "web"
      ? `https://berkantkull.github.io/Wikipati/rehber/${article.slug}`
      : `wikipati://rehber/${article.slug}`;
    if (Platform.OS === "web" && globalThis.navigator?.clipboard) {
      await globalThis.navigator.clipboard.writeText(url);
      Alert.alert("Bağlantı kopyalandı", "Rehber bağlantısını arkadaşlarınla paylaşabilirsin.");
      return;
    }
    await Share.share({ message: `${article.title}\n${url}` });
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={w.readerHeader}>
        <Action
          label={onBack ? "Önceki madde" : "Ansiklopedi"}
          icon="arrow-back"
          onPress={onBack || onClose}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Maddeyi kapat"
          hitSlop={8}
          onPress={onClose}
          style={w.close}
        >
          <Ionicons name="close" size={24} color={green} />
        </Pressable>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={w.readContent}>
        <Text style={w.kicker}>
          ANSİKLOPEDİ / {article.category.toLocaleUpperCase("tr")}
        </Text>
        <Text accessibilityRole="header" style={w.articleTitle}>
          {article.title}
        </Text>
        <Text style={w.lead}>{article.summary}</Text>
        <Text style={w.meta}>Son güncelleme: {new Date(`${article.updatedAt}T12:00:00`).toLocaleDateString("tr-TR")}</Text>
        {article.reviewedBy && <Text style={w.meta}>Veteriner hekim tarafından incelendi: {article.reviewedBy.name}, {article.reviewedBy.title}</Text>}
        <View style={w.tools}>
          <Action
            icon={favorite ? "bookmark" : "bookmark-outline"}
            label={favorite ? "Kaydedildi" : "Kaydet"}
            onPress={onFavorite}
          />
          <Action
            icon="list-outline"
            label="İçindekiler"
            onPress={() => jump("contents")}
          />
          <Action
            icon="link-outline"
            label="Kaynakça"
            onPress={() => jump("sources")}
          />
          <Action icon="share-outline" label="Paylaş" onPress={() => void shareArticle()} />
        </View>
        {personalContext}
        <View style={w.feature}>
          <Text style={w.boxTitle}>Günlük bakımına taşı</Text>
          <Text style={w.description}>
            {hasPet
              ? "Bu konuyla ilgili bir kontrol veya bakım hatırlatması oluştur. Tarihi veterinerinle birlikte belirle."
              : "Bir pati profili ekleyerek bakım ve sağlık kayıtlarını tutmaya başla."}
          </Text>
          {planAvailable ? <Action
            primary
            icon={hasPet ? "calendar-outline" : "paw-outline"}
            label={hasPet ? "Bakım takvimime ekle" : "Pati profili oluştur"}
            onPress={onPlan}
          /> : <Text style={s.muted}>Plan oluşturmak için yukarıdaki pati profillerinden birini seç.</Text>}
        </View>
        <View style={w.infobox}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Rehber ayrıntılarını aç veya kapat"
            accessibilityState={{ expanded: details }}
            onPress={() => setDetails(!details)}
            style={{
              minHeight: 48,
              padding: 14,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={w.actionText}>
              {article.species === "Tümü" ? "Kedi ve köpek" : article.species} ·{" "}
              {article.minutes} dk okuma
            </Text>
            <Ionicons
              name={details ? "chevron-up" : "chevron-down"}
              size={20}
              color={green}
            />
          </Pressable>
          {details && (
            <>
              {[
                [
                  "Kapsam",
                  article.species === "Tümü"
                    ? "Kedi ve köpek"
                    : article.species,
                ],
                ["Konu", article.category],
                ["Madde türü", "Başlangıç rehberi"],
                ["Güncelleme", article.updated],
                ["İçerik", "Kaynaklara dayalı özet"],
              ].map(([label, value]) => (
                <View key={label} style={w.fact}>
                  <Text style={w.factLabel}>{label}</Text>
                  <Text style={w.factValue}>{value}</Text>
                </View>
              ))}
            </>
          )}
        </View>
        <View
          onLayout={(e) => {
            positions.current.contents = e.nativeEvent.layout.y;
          }}
          style={w.contents}
        >
          <Text style={w.boxTitle}>İçindekiler</Text>
          {[
            ...article.sections.map((s) => ({ id: s.id, title: s.title })),
            { id: "related", title: "İlgili maddeler" },
            { id: "sources", title: "Kaynakça" },
          ].map((section, index) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${section.title} bölümüne git`}
              key={section.id}
              onPress={() => jump(section.id)}
              style={w.contentsLink}
            >
              <Text style={w.number}>{index + 1}</Text>
              <Text style={w.link}>{section.title}</Text>
              <Ionicons name="arrow-down" size={14} color={green} />
            </Pressable>
          ))}
        </View>
        {article.sections.map((section, index) => (
          <View
            key={section.id}
            onLayout={(e) => {
              positions.current[section.id] = e.nativeEvent.layout.y;
            }}
            style={w.readSection}
          >
            <Text accessibilityRole="header" style={w.sectionTitle}>
              {section.title}
            </Text>
            <Text style={w.body}>
              {section.text}
              <Text
                accessibilityRole="link"
                onPress={() => jump("sources")}
                style={w.link}
              >
                {" "}
                [1]
              </Text>
            </Text>
            {index === 0 && related[0] && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${related[0].title} maddesini oku`}
                onPress={() => onOpen(related[0])}
                style={w.seeAlso}
              >
                <Text style={w.meta}>
                  Ayrıca bakınız:{" "}
                  <Text style={w.link}>{related[0].title} →</Text>
                </Text>
              </Pressable>
            )}
          </View>
        ))}
        <View style={{ gap: 12 }}>
          <Text style={w.sectionTitle}>Terimler sözlüğü</Text>
          {glossary.map((g) => (
            <View key={g.term} style={{ gap: 4 }}>
              <Text style={w.boxTitle}>{g.term}</Text>
              <Text style={w.description}>{g.definition}</Text>
            </View>
          ))}
        </View>
        <View
          onLayout={(e) => {
            positions.current.related = e.nativeEvent.layout.y;
          }}
        >
          <Text accessibilityRole="header" style={w.sectionTitle}>
            İlgili maddeler
          </Text>
          {related.map((a) => (
            <EntryLink key={a.id} article={a} onOpen={onOpen} />
          ))}
        </View>
        <View
          onLayout={(e) => {
            positions.current.sources = e.nativeEvent.layout.y;
          }}
          style={w.readSection}
        >
          <Text accessibilityRole="header" style={w.sectionTitle}>
            Kaynakça
          </Text>
          {article.sources.map((source, index) => (
            <View key={source.url} style={{ gap: 8 }}>
              <Text style={w.description}>[{index + 1}] {source.publisher} · {source.title}</Text>
              <Action
                icon="open-outline"
                label={`${index + 1}. kaynağı aç`}
                onPress={() => {
                  setSourceError("");
                  Linking.openURL(source.url).catch(() => setSourceError("Kaynak açılamadı. İnternet bağlantını kontrol edip tekrar dene."));
                }}
              />
            </View>
          ))}
          {!!sourceError && (
            <Text accessibilityRole="alert" style={{ color: "#AF493D" }}>
              {sourceError}
            </Text>
          )}
          <Text style={w.disclosure}>
            Bu madde, kaynakçada belirtilen güvenilir yayından derlenen kısa bir
            Türkçe özettir. Bilgilendirme amaçlıdır; tanı ve tedavi yerine geçmez. {" "}
            <Text accessibilityRole="link" onPress={() => router.push("/yasal/tibbi-uyari" as never)} style={w.link}>Tıbbi Uyarı</Text>
          </Text>
        </View>
        <Action
          label="Sayfanın başına dön"
          icon="arrow-up"
          onPress={() => scroll.current?.scrollTo({ y: 0, animated: true })}
        />
      </ScrollView>
    </View>
  );
}

const w = StyleSheet.create({
  editorial: { backgroundColor: green, borderRadius: 24, padding: 24, gap: 18 },
  editorialTitle: {
    fontSize: 27,
    lineHeight: 35,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  masthead: { gap: 12, paddingTop: 12, paddingBottom: 2 },
  kicker: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#6F7F70",
    fontWeight: "700",
  },
  title: {
    fontSize: 32,
    lineHeight: 39,
    letterSpacing: -1.2,
    color: green,
    fontWeight: "700",
  },
  description: { fontSize: 14, lineHeight: 23, color: "#657365" },
  search: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#9DAF99",
    borderRadius: 18,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  searchInput: { flex: 1, fontSize: 17, color: green, paddingVertical: 14 },
  clear: { padding: 12, minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  meta: { fontSize: 11, color: "#62756C", lineHeight: 18 },
  portals: { flexDirection: "row", gap: 10 },
  portal: {
    flex: 1,
    minHeight: 48,
    backgroundColor: "#EDF0E5",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    padding: 8,
  },
  portalSelected: { backgroundColor: green },
  portalTitle: { fontSize: 13, fontWeight: "600", color: green },
  tag: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E5D9",
  },
  feature: {
    padding: 20,
    gap: 13,
    backgroundColor: "#EFF2E8",
    borderLeftWidth: 3,
    borderLeftColor: "#92A27D",
    borderRadius: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 21,
    lineHeight: 29,
    color: green,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  entry: {
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E7DC",
  },
  entryTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: "#315F52",
    fontWeight: "600",
  },
  action: {
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 10,
  },
  actionText: { fontSize: 13, fontWeight: "600", color: green },
  primary: { backgroundColor: green },
  personal: {
    borderWidth: 1,
    borderColor: "#DCE3D5",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 22,
    gap: 12,
  },
  personalActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  disclosure: { fontSize: 12, lineHeight: 20, color: "#62756C" },
  readerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDE4D6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  close: {
    width: 48,
    height: 48,
    backgroundColor: "#E9EDE2",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  readContent: {
    padding: 24,
    gap: 24,
    paddingBottom: 48,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  articleTitle: {
    fontSize: 36,
    lineHeight: 44,
    color: green,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  lead: { fontSize: 17, lineHeight: 27, color: "#5C6A5D" },
  tools: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E5DA",
    paddingVertical: 2,
  },
  infobox: {
    borderWidth: 1,
    borderColor: "#DCE3D5",
    borderRadius: 8,
    overflow: "hidden",
  },
  boxTitle: { fontSize: 17, fontWeight: "600", color: green, padding: 12 },
  fact: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#E1E6DC",
  },
  factLabel: { width: 92, fontSize: 13, color: "#6F7B6C" },
  factValue: { flex: 1, fontSize: 13, color: green, lineHeight: 20 },
  contents: { backgroundColor: "#F0F2EB", borderRadius: 8, padding: 8 },
  contentsLink: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  number: { color: "#8E9886", width: 18, fontSize: 13 },
  link: { color: "#326553", fontSize: 14, textDecorationLine: "underline" },
  readSection: { gap: 14 },
  body: { fontSize: 17, lineHeight: 30, color: "#3F4D41" },
  seeAlso: { borderLeftWidth: 2, borderColor: "#B6C4A8", padding: 12 },
});
