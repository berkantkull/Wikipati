import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Image,
  Linking,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  AppState,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  categories,
  emptyStore,
  Entry,
  Pet,
  Store,
  parseDate,
  today,
  Preferences,
} from "./src/data";
import {
  syncNotifications,
  permissionState,
  requestPermission,
  testNotification,
  PermissionState,
} from "./src/notifications";
import * as Notifications from "expo-notifications";
import {
  normalizeStore,
  removePet,
  removeEntry,
  restoreItem,
} from "./src/care";
import { Adoption, AdoptionEntry, WeightChart, Settings, Action } from "./src/Features";
import { s, green } from "./src/styles";
import { FormCloseHeader } from "./src/FormCloseHeader";
import { WikiHome, WikiReader } from "./src/WikiScreens";
import { wikiArticles, WikiArticle } from "./src/wiki";
const articles = wikiArticles;
type Tab = "home" | "library" | "pets" | "calendar" | "settings";
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const KEY = "wikipati.v1";
const pretty = (d: string) =>
  parseDate(d)?.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }) || d;
function Icon({
  name,
  size = 22,
  color = green,
}: {
  name: any;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
function Button({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[s.button, secondary && s.secondary]}
    >
      <Text style={[s.buttonText, secondary && { color: green }]}>{title}</Text>
    </Pressable>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder = "",
  numeric = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={s.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#969D96"
        keyboardType={numeric ? "decimal-pad" : "default"}
      />
    </View>
  );
}
export default function App() {
  const [adoptionOpen, setAdoptionOpen] = useState(false);
  const [store, setStore] = useState<Store>(emptyStore),
    [ready, setReady] = useState(false),
    [failure, setFailure] = useState("");
  const storeRef = useRef<Store>(emptyStore),
    mutation = useRef(false);
  const loaded = useRef(false), permissionRequest = useRef(false);
  const mainScroll = useRef<ScrollView>(null), formScroll = useRef<ScrollView>(null);
  const [editingPet, setEditingPet] = useState<string | null>(null),
    [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [message, setMessage] = useState(""),
    [lastDeleted, setLastDeleted] = useState<string | null>(null),
    [deleteTarget, setDeleteTarget] = useState<{
      type: "pet" | "entry";
      id: string;
      name: string;
    } | null>(null);
  const [permission, setPermission] = useState<PermissionState>({
    allowed: false,
    canAskAgain: true,
    label: "Kontrol ediliyor",
  });
  function inform(title: string, detail?: string) {
    setMessage([title, detail].filter(Boolean).join(" · "));
    mainScroll.current?.scrollTo({y:0,animated:true});
    formScroll.current?.scrollTo({y:0,animated:true});
  }
  const [tab, setTab] = useState<Tab>("home"),
    [category, setCategory] = useState("Tümü"),
    [query, setQuery] = useState(""),
    [species, setSpecies] = useState("Tümü"),
    [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedPet, setSelectedPet] = useState(""),
    [article, setArticle] = useState<WikiArticle | null>(null),
    [form, setForm] = useState<"pet" | "entry" | null>(null),
    [busy, setBusy] = useState(false);
  const [articleHistory, setArticleHistory] = useState<WikiArticle[]>([]);
  const [plannedArticle, setPlannedArticle] = useState<string | null>(null);
  function openArticle(a: (typeof articles)[number]) {
    setArticleHistory([]);
    setArticle(wikiArticles.find((x) => x.id === a.id)!);
  }
  const [name, setName] = useState(""),
    [petSpecies, setPetSpecies] = useState("Kedi"),
    [breed, setBreed] = useState(""),
    [birthday, setBirthday] = useState(""),
    [allergies, setAllergies] = useState(""),
    [photo, setPhoto] = useState<string | undefined>();
  const [title, setTitle] = useState(""),
    [kind, setKind] = useState("Aşı"),
    [date, setDate] = useState(today()),
    [notes, setNotes] = useState(""),
    [weight, setWeight] = useState(""),
    [attachment, setAttachment] = useState<{
      uri: string;
      name: string;
    } | null>(null),
    [reminder, setReminder] = useState(true);
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(KEY)
      .then(async (raw) => {
        const data = raw ? normalizeStore(JSON.parse(raw)) : emptyStore;
        storeRef.current = data;
        loaded.current = true;
        if (live) {
          setStore(data);
          setSelectedPet(data.pets[0]?.id || "");
          setReady(true);
        }
        await refreshNotifications();
      })
      .catch(() =>
        setFailure(
          "Kayıtlar okunamadı. Verilerinin üzerine yazılmadı. Uygulamayı yeniden aç.",
        ),
      );
    const foreground = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshNotifications();
    });
    const response =
      Platform.OS === "web"
        ? null
        : Notifications.addNotificationResponseReceivedListener(() => {
            setTab("calendar");
            void Notifications.clearLastNotificationResponseAsync().catch(() => {});
          });
    if (Platform.OS !== "web")
      Notifications.getLastNotificationResponseAsync()
        .then((r) => {
          if (r && live) {
            setTab("calendar");
            void Notifications.clearLastNotificationResponseAsync().catch(() => {});
          }
        })
        .catch(() => {});
    return () => {
      live = false;
      foreground.remove();
      response?.remove();
    };
  }, []);
  async function commit(next: Store, notify = true) {
    if (mutation.current) {
      inform("Bir işlem sürüyor", "Lütfen tamamlanınca tekrar dene.");
      return false;
    }
    mutation.current = true;
    setBusy(true);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
      storeRef.current = next;
      setStore(next);
      if (notify) {
        try {
          const synced = await syncNotifications(next);
          await AsyncStorage.setItem(KEY, JSON.stringify(synced));
          storeRef.current = synced;
          setStore(synced);
        } catch {
          inform(
            "Kayıt saklandı",
            "Bildirim planı güncellenemedi. Ayarlardan yeniden dene.",
          );
        }
      }
      return true;
    } catch {
      inform("Kaydedilemedi", "Cihaz depolamasını kontrol et.");
      return false;
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }
  async function refreshNotifications() {
    if (!loaded.current || permissionRequest.current) return;
    try {
      setPermission(await permissionState());
      if (!mutation.current) await commit(storeRef.current);
    } catch {
      setPermission({
        allowed: false,
        canAskAgain: true,
        label: "Bildirim durumu okunamadı",
      });
    }
  }
  async function enableNotifications() {
    if (mutation.current || permissionRequest.current) return;
    permissionRequest.current = true;
    setBusy(true);
    try {
      setPermission(await requestPermission());
      await commit({
        ...storeRef.current,
        preferences: { ...storeRef.current.preferences, reminders: true },
      });
    } catch {
      inform(
        "İzin alınamadı",
        "Telefon ayarlarından bildirim iznini kontrol et.",
      );
    } finally {
      permissionRequest.current = false;
      setBusy(false);
    }
  }
  async function restore(id: string) {
    try {
      if (await commit(restoreItem(storeRef.current, id))) {
        setLastDeleted(null);
        inform("Geri yüklendi");
      }
    } catch (e) {
      inform(e instanceof Error ? e.message : "Geri yüklenemedi");
    }
  }
  async function deleteConfirmed() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const updated =
      target.type === "pet"
        ? removePet(storeRef.current, target.id)
        : removeEntry(storeRef.current, target.id);
    if (await commit(updated)) {
      setDeleteTarget(null);
      setLastDeleted(target.type + "-" + target.id);
      inform("Çöp kutusuna taşındı", "Ayarlar bölümünden de geri alabilirsin.");
    }
  }
  function editPet(p: Pet) {
    setEditingPet(p.id);
    setName(p.name);
    setBreed(p.breed);
    setBirthday(p.birthday);
    setAllergies(p.allergies);
    setPhoto(p.photo);
    setPetSpecies(p.species);
    setMessage("");
    setForm("pet");
  }
  function editEntry(e: Entry) {
    setEditingEntry(e);
    setSelectedPet(e.petId);
    setTitle(e.title);
    setKind(e.kind);
    setDate(e.date);
    setNotes(e.notes);
    setWeight(e.weight ? String(e.weight) : "");
    setAttachment(null);
    setReminder(!e.done);
    setMessage("");
    setForm("entry");
  }
  const pet = store.pets.find((p) => p.id === selectedPet) || store.pets[0];
  const upcoming = store.entries
    .filter((e) => !e.done)
    .sort((a, b) => a.date.localeCompare(b.date));
  const filtered = articles.filter(
    (a) =>
      (category === "Tümü" || a.category === category) &&
      (species === "Tümü" || a.species === species || a.species === "Tümü") &&
      (!onlyFavorites || store.favorites.includes(a.id)) &&
      (a.title + " " + a.summary + " " + a.body)
        .toLocaleLowerCase("tr")
        .includes(query.toLocaleLowerCase("tr")),
  );
  function openPet() {
    setEditingPet(null);
    setMessage("");
    setName("");
    setBreed("");
    setBirthday("");
    setAllergies("");
    setPhoto(undefined);
    setPetSpecies("Kedi");
    setForm("pet");
  }
  function openEntry() {
    setEditingEntry(null);
    setMessage("");
    if (!pet) {
      openPet();
      return;
    }
    setTitle("");
    setKind("Aşı");
    setDate(today());
    setNotes("");
    setWeight("");
    setAttachment(null);
    setReminder(true);
    setForm("entry");
  }
  async function durable(uri: string, name: string) {
    if (Platform.OS === "web") {
      if (uri.startsWith('data:')) return uri;
      const blob = await (await fetch(uri)).blob();
      return await new Promise<string>((resolve,reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(Error('Dosya okunamadı'));
        reader.readAsDataURL(blob);
      });
    }
    const target = new File(
      Paths.document,
      uid() + "-" + name.replace(/[^a-zA-Z0-9.]/g, "_"),
    );
    new File(uri).copy(target);
    return target.uri;
  }
  async function pickPhoto() {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!r.canceled) setPhoto(await durable(r.assets[0].uri, "pet.jpg"));
    } catch {
      inform("Fotoğraf açılamadı", "Galeri erişimini kontrol edin.");
    }
  }
  async function save() {
    if (busy || mutation.current) return;
    if (
      form === "pet" &&
      (!name.trim() ||
        (birthday && (!parseDate(birthday) || birthday > today())))
    ) {
      inform(
        "Bilgileri kontrol et",
        "İsim gerekli; doğum tarihi YYYY-AA-GG biçiminde ve geçmişte olmalı.",
      );
      return;
    }
    if (
      form === "entry" &&
      (!title.trim() ||
        !parseDate(date) ||
        (kind === "Kilo" &&
          (!Number.isFinite(Number(weight.replace(",", "."))) ||
            Number(weight.replace(",", ".")) <= 0 ||
            date > today())))
    ) {
      inform(
        "Bilgileri kontrol et",
        "Başlık ve geçerli tarih gerekli. Kilo pozitif olmalı ve ileri tarihli olamaz.",
      );
      return;
    }
    setBusy(true);
    try {
      if (form === "pet") {
        const p: Pet = {
          id: editingPet || uid(),
          name: name.trim(),
          species: petSpecies,
          breed,
          birthday,
          allergies,
          photo,
        };
        const next = {
          ...storeRef.current,
          pets: editingPet
            ? storeRef.current.pets.map((x) => (x.id === editingPet ? p : x))
            : [...storeRef.current.pets, p],
        };
        if (await commit(next)) {
          setSelectedPet(p.id);
          setForm(null);
          setTab("pets");
        }
      } else if (pet) {
        const pending = reminder && kind !== "Kilo" && kind !== "Not";
        const file = attachment
          ? await durable(attachment.uri, attachment.name)
          : editingEntry?.file;
        const entry: Entry = {
          id: editingEntry?.id || uid(),
          petId: pet.id,
          title: title.trim(),
          kind,
          date,
          notes,
          weight:
            kind === "Kilo" ? Number(weight.replace(",", ".")) : undefined,
          file,
          fileName: attachment?.name || editingEntry?.fileName,
          done: !pending,
          notification: editingEntry?.notification,
        };
        const next = {
          ...storeRef.current,
          entries: editingEntry
            ? storeRef.current.entries.map((e) =>
                e.id === editingEntry.id ? entry : e,
              )
            : [...storeRef.current.entries, entry],
        };
        if (await commit(next)) {
          setForm(null);
          setTab(pending ? "calendar" : "pets");
        }
      }
    } catch {
      inform(
        "İşlem tamamlanamadı",
        "Dosya erişimini kontrol edip tekrar dene.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function complete(e: Entry) {
    await commit({
      ...storeRef.current,
      entries: storeRef.current.entries.map((x) =>
        x.id === e.id ? { ...x, done: true } : x,
      ),
    });
  }
  async function postpone(e: Entry) {
    const d = parseDate(e.date)!;
    const base = parseDate(today())!;
    if (d < base) d.setTime(base.getTime());
    d.setDate(d.getDate() + 1);
    const nextDate =
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0");
    await commit({
      ...storeRef.current,
      entries: storeRef.current.entries.map((x) =>
        x.id === e.id ? { ...x, date: nextDate } : x,
      ),
    });
  }
  async function exportData() {
    try {
      if (Platform.OS === "web") {
        const url = URL.createObjectURL(
          new Blob([JSON.stringify(store, null, 2)], {
            type: "application/json",
          }),
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = "wikipati-kayitlar.json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }
      const f = new File(Paths.cache, "wikipati-yedek.json");
      f.write(JSON.stringify(store, null, 2));
      await Sharing.shareAsync(f.uri, { mimeType: "application/json" });
    } catch {
      inform("Paylaşılamadı", "Bu cihazda paylaşım kullanılamıyor.");
    }
  }
  async function showFile(e: Entry) {
    try {
      if (!e.file) return;
      if (Platform.OS === "web") {
        const a = document.createElement('a');
        a.href = e.file;
        a.download = e.fileName || 'wikipati-belge';
        a.click();
      }
      else await Sharing.shareAsync(e.file);
    } catch {
      inform("Belge açılamadı", "Dosyaya erişilemiyor.");
    }
  }
  function chips(items: string[], value: string, change: (x: string) => void) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chips}
      >
        {items.map((x) => (
          <Pressable
            key={x}
            onPress={() => change(x)}
            style={[s.chip, value === x && s.chipActive]}
          >
            <Text style={[s.chipText, value === x && { color: "#fff" }]}>
              {x}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }
  function petPicker() {
    return chips(
      store.pets.map((p) => p.name + " · " + p.id.slice(-3)),
      pet?.name + " · " + pet?.id.slice(-3),
      (v) =>
        setSelectedPet(
          store.pets.find((p) => p.name + " · " + p.id.slice(-3) === v)!.id,
        ),
    );
  }
  function articleCard(a: (typeof articles)[number]) {
    return (
      <Pressable
        key={a.id}
        style={s.articleCard}
        onPress={() => openArticle(a)}
      >
        <View style={[s.articleArt, { backgroundColor: a.color }]}>
          <Icon name={a.icon} size={38} />
        </View>
        <View style={{ flex: 1, gap: 7 }}>
          <Text style={s.eyebrow}>
            {a.category.toLocaleUpperCase("tr")} · {a.minutes} DK OKUMA
          </Text>
          <Text style={s.cardTitle}>{a.title}</Text>
          <Text style={s.muted}>{a.summary}</Text>
        </View>
        <Icon name="chevron-forward" size={16} />
      </Pressable>
    );
  }
  function entryCard(e: Entry) {
    const p = store.pets.find((p) => p.id === e.petId);
    return (
      <View key={e.id} style={s.record}>
        <View style={s.recordIcon}>
          <Icon
            name={
              e.kind === "Kilo"
                ? "scale-outline"
                : e.kind === "Aşı"
                  ? "medical-outline"
                  : "calendar-outline"
            }
          />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={s.cardTitle}>
            {e.title}
            {e.weight ? ` · ${e.weight} kg` : ""}
          </Text>
          <Text style={s.muted}>
            {p?.name} · {pretty(e.date)}
          </Text>
          {!!e.notes && <Text style={s.muted}>{e.notes}</Text>}
          {!!e.notificationState && !e.done && (
            <Text style={s.small}>{e.notificationState}</Text>
          )}
          {e.file && (
            <Pressable onPress={() => showFile(e)}>
              <Text style={s.link}>Belgeyi aç · {e.fileName}</Text>
            </Pressable>
          )}
          {!e.done && (
            <View style={{ flexDirection: "row", gap: 18, marginTop: 8 }}>
              <Pressable onPress={() => complete(e)}>
                <Text style={s.link}>✓ Tamamlandı</Text>
              </Pressable>
              <Pressable onPress={() => postpone(e)}>
                <Text style={s.muted}>1 gün ertele</Text>
              </Pressable>
            </View>
          )}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Action
              label="Düzenle"
              disabled={busy}
              onPress={() => editEntry(e)}
            />
            <Action
              label="Sil"
              danger
              disabled={busy}
              onPress={() =>
                setDeleteTarget({ type: "entry", id: e.id, name: e.title })
              }
            />
          </View>
        </View>
        {e.done && <Icon name="checkmark-circle" size={20} />}
      </View>
    );
  }
  function empty(
    icon: string,
    heading: string,
    body: string,
    action?: () => void,
    label?: string,
  ) {
    return (
      <View style={s.empty}>
        <Icon name={icon} size={36} />
        <Text style={s.cardTitle}>{heading}</Text>
        <Text style={[s.muted, { textAlign: "center" }]}>{body}</Text>
        {action && <Button title={label || "Ekle"} onPress={action} />}
      </View>
    );
  }
  if (!ready)
    return (
      <SafeAreaProvider>
        <SafeAreaView style={s.loading}>
          {failure ? (
            <Text>{failure}</Text>
          ) : (
            <ActivityIndicator color={green} />
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root}>
        <StatusBar style="dark" />
        <View style={s.shell}>
          <View style={s.header}>
            <Pressable onPress={() => setTab("home")} style={s.brand}>
              <View style={s.logo}>
                <Icon name="paw" color="#fff" size={21} />
              </View>
              <Text style={s.brandText}>
                wikipati<Text style={{ color: "#B28A5F" }}>.</Text>
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ayarlar"
              onPress={() => setTab("settings")}
              style={s.avatar}
            >
              <Icon name="settings-outline" size={22} />
            </Pressable>
          </View>
          <ScrollView
            key={tab}
            ref={mainScroll}
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
          >
            {!!message && (
              <View accessibilityRole="alert" style={s.note}>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={s.muted}>{message}</Text>
                  {lastDeleted && (
                    <Action
                      label="Silmeyi geri al"
                      onPress={() => restore(lastDeleted)}
                    />
                  )}
                </View>
                <Action label="Kapat" onPress={() => setMessage("")} />
              </View>
            )}
            {tab === "home" && (
              <>
                <AdoptionEntry expanded={adoptionOpen} onPress={() => setAdoptionOpen(!adoptionOpen)} />
                {adoptionOpen && <Adoption
                  key={pet?.id || "guest"}
                  pet={pet}
                  checked={store.checklist[pet?.id || "__adoption_guest__"] || []}
                  onToggle={(id) => {
                    const key = pet?.id || "__adoption_guest__";
                    const current = storeRef.current;
                    const checked = current.checklist[key] || [];
                    void commit({ ...current, checklist: { ...current.checklist, [key]: checked.includes(id) ? checked.filter(x => x !== id) : [...checked, id] } }, false);
                  }}
                  onPlan={pet ? () => { openEntry(); setKind("Kontrol"); setTitle("İlk veteriner görüşmesi"); } : undefined}
                />}
                <WikiHome
                  onOpen={openArticle}
                  onPets={() => {
                    if (store.pets.length) setTab("pets");
                    else openPet();
                  }}
                  onCalendar={() => setTab("calendar")}
                  petCount={store.pets.length}
                  careCount={upcoming.length}
                />
              </>
            )}
            {tab === "library" && (
              <>
                <Text style={s.eyebrow}>WİKİPATİ KÜTÜPHANESİ</Text>
                <Text style={s.heading}>Bilgi kütüphanesi</Text>
                <Text style={s.subtitle}>Dostunun dünyasını keşfet.</Text>
                <View style={s.search}>
                  <Icon name="search-outline" />
                  <TextInput
                    accessibilityLabel="Bilgi ara"
                    style={{ flex: 1, color: green, padding: 0 }}
                    placeholder="Bakım, aşı, beslenme..."
                    value={query}
                    onChangeText={setQuery}
                  />
                </View>
                {chips(categories, category, setCategory)}
                {chips(["Tümü", "Kedi", "Köpek"], species, setSpecies)}
                <Pressable
                  onPress={() => setOnlyFavorites(!onlyFavorites)}
                  style={s.inline}
                >
                  <Icon
                    name={onlyFavorites ? "bookmark" : "bookmark-outline"}
                    size={18}
                  />
                  <Text style={s.link}>
                    {onlyFavorites
                      ? "Favoriler gösteriliyor"
                      : "Yalnızca favorilerim"}
                  </Text>
                </Pressable>
                <Text style={s.small}>
                  {filtered.length} rehber · Kaynak bağlantıları içerir
                </Text>
                {filtered.length
                  ? filtered.map(articleCard)
                  : empty(
                      "search-outline",
                      "Henüz bir sonuç yok",
                      "Farklı bir kelime veya kategori deneyebilirsin.",
                    )}
                <Text style={s.footnote}>
                  İçerikler güvenilir kaynaklardan derlenir; kaynak bağlantıları her maddede yer alır.
                  Bilgilendirme amaçlıdır; tanı ve tedavi yerine geçmez.
                </Text>
              </>
            )}
            {tab === "pets" && (
              <>
                <View style={s.section}>
                  <View>
                    <Text style={s.eyebrow}>BİRLİKTE DAHA İYİ</Text>
                    <Text style={s.heading}>Patilerim</Text>
                  </View>
                  <Pressable
                    accessibilityLabel="Pati ekle"
                    onPress={openPet}
                    style={s.avatar}
                  >
                    <Icon name="add" />
                  </Pressable>
                </View>
                {store.pets.length > 0 && petPicker()}
                {pet ? (
                  <>
                    <View style={s.profile}>
                      {pet.photo ? (
                        <Image
                          source={{ uri: pet.photo }}
                          style={s.profilePhoto}
                        />
                      ) : (
                        <View style={s.profilePhoto}>
                          <Icon name="paw" size={48} />
                        </View>
                      )}
                      <Text style={s.heading}>{pet.name}</Text>
                      <Text style={s.muted}>
                        {pet.species}
                        {pet.breed ? " · " + pet.breed : ""}
                      </Text>
                      {!!pet.birthday && (
                        <Text style={s.muted}>
                          Doğum tarihi · {pretty(pet.birthday)}
                        </Text>
                      )}
                      {!!pet.allergies && (
                        <Text style={s.alertText}>
                          Alerjiler / özel notlar: {pet.allergies}
                        </Text>
                      )}
                    </View>
                    <Button
                      title="+ Sağlık veya bakım kaydı ekle"
                      onPress={openEntry}
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Action
                        label="Profili düzenle"
                        onPress={() => editPet(pet)}
                      />
                      <Action
                        label="Profili sil"
                        danger
                        onPress={() =>
                          setDeleteTarget({
                            type: "pet",
                            id: pet.id,
                            name: pet.name,
                          })
                        }
                      />
                    </View>
                    <Adoption
                      pet={pet}
                      checked={store.checklist[pet.id] || []}
                      onToggle={(id) => {
                        const checked =
                          storeRef.current.checklist[pet.id] || [];
                        void commit(
                          {
                            ...storeRef.current,
                            checklist: {
                              ...storeRef.current.checklist,
                              [pet.id]: checked.includes(id)
                                ? checked.filter((x) => x !== id)
                                : [...checked, id],
                            },
                          },
                          false,
                        );
                      }}
                      onPlan={() => {
                        openEntry();
                        setKind("Kontrol");
                        setTitle("İlk veteriner görüşmesi");
                      }}
                    />
                    <WeightChart
                      pet={pet}
                      entries={store.entries}
                      onAdd={() => {
                        openEntry();
                        setKind("Kilo");
                        setTitle("Kilo ölçümü");
                        setReminder(false);
                      }}
                      onMessage={inform}
                    />
                    <Text style={s.sectionTitle}>Sağlık ve bakım geçmişi</Text>
                    {store.entries
                      .filter((e) => e.petId === pet.id)
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map(entryCard)}
                    {!store.entries.some((e) => e.petId === pet.id) &&
                      empty(
                        "folder-open-outline",
                        "İlk kaydına hazır",
                        "Aşılar, raporlar ve bakım notları burada bir arada.",
                      )}
                    <Text style={s.sectionTitle}>{pet.name} için keşfet</Text>
                    {articles
                      .filter((a) => a.species === pet.species)
                      .slice(0, 2)
                      .map(articleCard)}
                  </>
                ) : (
                  empty(
                    "paw-outline",
                    "Bir patiyle başlayalım",
                    "Dostunun bilgilerini ekleyip ona özel kayıt tut.",
                    openPet,
                    "Pati ekle",
                  )
                )}
              </>
            )}
            {tab === "calendar" && (
              <>
                <Text style={s.eyebrow}>KÜÇÜK HATIRLATMALAR, BÜYÜK ÖZEN</Text>
                <Text style={s.heading}>Bakım takvimim</Text>
                <Text style={s.subtitle}>
                  Bir sonraki güzel güne hazırlıklı ol.
                </Text>
                <Button title="+ Hatırlatma ekle" onPress={openEntry} />
                <View style={s.calendarSummary}>
                  <Icon name="calendar-outline" size={32} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.sectionTitle}>
                      {upcoming.length} planlı bakım
                    </Text>
                    <Text style={s.muted}>
                      Tarihler veterinerinle birlikte belirlenir.
                    </Text>
                  </View>
                </View>
                {upcoming.length
                  ? upcoming.map(entryCard)
                  : empty(
                      "checkmark-circle-outline",
                      "Her şey yolunda",
                      "Eklediğin bakım hatırlatmaları burada görünecek.",
                    )}
                <Text style={s.sectionTitle}>Tamamlananlar</Text>
                {store.entries
                  .filter(
                    (e) => e.done && e.kind !== "Not" && e.kind !== "Kilo",
                  )
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map(entryCard)}
              </>
            )}
            {tab === "settings" && (
              <Settings
                store={store}
                permission={permission}
                working={busy}
                onPermission={enableNotifications}
                onTest={async () => {
                  try {
                    await testNotification();
                    inform(
                      "Test bildirimi planlandı",
                      "5 saniye sonra telefonuna gelecek.",
                    );
                  } catch (e) {
                    inform(
                      e instanceof Error ? e.message : "Bildirim gönderilemedi",
                    );
                  }
                }}
                onSync={refreshNotifications}
                onPreferences={(preferences) => {
                  void commit({ ...storeRef.current, preferences });
                }}
                onExport={exportData}
                onRestore={restore}
                onMessage={inform}
              />
            )}
            <Text style={s.footer}>Birlikte, her pati için daha iyi. ♡</Text>
          </ScrollView>
          <View style={s.nav}>
            {(
              [
                { id: "home", icon: "home-outline", label: "Ana sayfa" },
                { id: "library", icon: "book-outline", label: "Kütüphane" },
                { id: "pets", icon: "paw-outline", label: "Patilerim" },
                { id: "calendar", icon: "calendar-outline", label: "Takvim" },
                { id: "settings", icon: "settings-outline", label: "Ayarlar" },
              ] as const
            ).map((t) => (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === t.id }}
                key={t.id}
                onPress={() => setTab(t.id)}
                style={s.navItem}
              >
                <View
                  style={[
                    s.navIcon,
                    tab === t.id && { backgroundColor: "#E6ECDF" },
                  ]}
                >
                  <Icon
                    name={t.icon}
                    color={tab === t.id ? green : "#92988F"}
                  />
                </View>
                <Text
                  style={[
                    s.navLabel,
                    tab === t.id && { color: green, fontWeight: "700" },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Modal
          visible={!!article}
          animationType="slide"
          onRequestClose={() => {
            setArticle(null);
            setArticleHistory([]);
          }}
          onDismiss={() => {
            if (plannedArticle) {
              openEntry();
              if (pet) setTitle(plannedArticle);
              setPlannedArticle(null);
            }
          }}
        >
          <SafeAreaProvider>
            <SafeAreaView style={s.root}>
              {article && (
                <WikiReader
                  key={article.id}
                  article={article}
                  favorite={store.favorites.includes(article.id)}
                  onFavorite={() =>
                    commit({
                      ...store,
                      favorites: store.favorites.includes(article.id)
                        ? store.favorites.filter((x) => x !== article.id)
                        : [...store.favorites, article.id],
                    })
                  }
                  onOpen={(a) => {
                    setArticleHistory([...articleHistory, article]);
                    setArticle(a);
                  }}
                  onBack={
                    articleHistory.length
                      ? () => {
                          setArticle(articleHistory[articleHistory.length - 1]);
                          setArticleHistory(articleHistory.slice(0, -1));
                        }
                      : undefined
                  }
                  onClose={() => {
                    setArticle(null);
                    setArticleHistory([]);
                  }}
                  hasPet={!!pet}
                  onPlan={() => {
                    const topic = article.title;
                    setArticle(null);
                    setArticleHistory([]);
                    if (Platform.OS === "ios") setPlannedArticle(topic);
                    else {
                      openEntry();
                      if (pet) setTitle(topic);
                    }
                  }}
                />
              )}
            </SafeAreaView>
          </SafeAreaProvider>
        </Modal>
        <Modal
          visible={!!form}
          animationType="slide"
          onRequestClose={() => {
            if (!busy) setForm(null);
          }}
        >
          <SafeAreaProvider>
            <SafeAreaView style={s.root}>
              <FormCloseHeader busy={busy} onClose={() => setForm(null)} />
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                <ScrollView
                  ref={formScroll}
                  contentContainerStyle={s.content}
                  keyboardShouldPersistTaps="handled"
                >
                  {!!message && (
                    <View accessibilityRole="alert" style={s.note}>
                      <Text style={s.muted}>{message}</Text>
                    </View>
                  )}
                  <Text style={s.heading}>
                    {form === "pet"
                      ? editingPet
                        ? "Profili düzenle"
                        : "Yeni bir pati"
                      : editingEntry
                        ? "Kaydı düzenle"
                        : "Yeni bakım kaydı"}
                  </Text>
                  <Text style={s.subtitle}>
                    {form === "pet"
                      ? "Onu biraz daha yakından tanıyalım."
                      : `${pet?.name} için küçük bir özen.`}
                  </Text>
                  {form === "pet" ? (
                    <>
                      <Button
                        title={
                          photo
                            ? "Fotoğraf seçildi · Değiştir"
                            : "Profil fotoğrafı ekle"
                        }
                        secondary
                        onPress={pickPhoto}
                      />
                      <Field
                        label="İsim *"
                        value={name}
                        onChange={setName}
                        placeholder="Dostunun adı"
                      />
                      {chips(
                        ["Kedi", "Köpek", "Kuş", "Tavşan", "Diğer"],
                        petSpecies,
                        setPetSpecies,
                      )}
                      <Field
                        label="Irk"
                        value={breed}
                        onChange={setBreed}
                        placeholder="Örn. Tekir"
                      />
                      <Field
                        label="Doğum tarihi (isteğe bağlı)"
                        value={birthday}
                        onChange={setBirthday}
                        placeholder="YYYY-AA-GG"
                      />
                      <Field
                        label="Alerjiler ve özel notlar"
                        value={allergies}
                        onChange={setAllergies}
                      />
                    </>
                  ) : (
                    <>
                      {petPicker()}
                      {chips(
                        [
                          "Aşı",
                          "Parazit",
                          "Kontrol",
                          "İlaç",
                          "Bakım",
                          "Operasyon",
                          "Kilo",
                          "Not",
                        ],
                        kind,
                        setKind,
                      )}
                      <Field
                        label="Başlık *"
                        value={title}
                        onChange={setTitle}
                        placeholder="Örn. Yıllık veteriner kontrolü"
                      />
                      <Field
                        label="Tarih *"
                        value={date}
                        onChange={setDate}
                        placeholder="YYYY-AA-GG"
                      />
                      {kind === "Kilo" && (
                        <Field
                          label="Kilo (kg) *"
                          value={weight}
                          onChange={setWeight}
                          numeric
                        />
                      )}
                      <Field
                        label="Notlar"
                        value={notes}
                        onChange={setNotes}
                        placeholder="Veteriner, uygulama ve gözlem notları"
                      />
                      {kind !== "Kilo" && kind !== "Not" && (
                        <Pressable
                          style={s.note}
                          onPress={() => setReminder(!reminder)}
                        >
                          <Icon
                            name={reminder ? "checkbox" : "square-outline"}
                          />
                          <Text style={s.muted}>
                            Planlı bakım · Bildirimle hatırlat
                          </Text>
                        </Pressable>
                      )}
                      <Button
                        secondary
                        title={
                          attachment
                            ? attachment.name
                            : editingEntry?.fileName
                              ? editingEntry.fileName + " · Değiştir"
                              : "Belge / karne fotoğrafı ekle"
                        }
                        onPress={async () => {
                          try {
                            const r = await DocumentPicker.getDocumentAsync({
                              type: ["application/pdf", "image/*"],
                              copyToCacheDirectory: true,
                            });
                            if (!r.canceled)
                              setAttachment({
                                uri: r.assets[0].uri,
                                name: r.assets[0].name,
                              });
                          } catch {
                            inform("Belge seçilemedi", "Tekrar deneyin.");
                          }
                        }}
                      />
                    </>
                  )}
                  <Button
                    title={busy ? "Kaydediliyor…" : "Kaydet"}
                    onPress={save}
                  />
                </ScrollView>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </SafeAreaProvider>
        </Modal>
        <Modal
          visible={!!deleteTarget}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteTarget(null)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#0008",
              justifyContent: "center",
              padding: 28,
            }}
          >
            <View
              style={{
                backgroundColor: "#FAFAF6",
                padding: 24,
                borderRadius: 22,
                gap: 16,
              }}
            >
              <Text style={s.sectionTitle}>
                {deleteTarget?.name} silinsin mi?
              </Text>
              <Text style={s.muted}>
                {deleteTarget?.type === "pet"
                  ? "Profil ve ona bağlı kayıtlar"
                  : "Bu kayıt"}{" "}
                çöp kutusuna taşınır. Ayarlardan geri alabilirsin.
              </Text>
              <Action
                label="Vazgeç"
                disabled={busy}
                onPress={() => setDeleteTarget(null)}
              />
              <Action
                label="Çöp kutusuna taşı"
                danger
                disabled={busy}
                onPress={deleteConfirmed}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
