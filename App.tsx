import { PetDocuments } from "./src/PetDocuments";
import { LivingArticle } from "./src/LivingArticle";
import { calendarEntries } from "./src/calendar";
import { AppErrorBoundary } from "./src/AppErrorBoundary";
import { CloudAccount } from "./src/CloudAccount";
import { Onboarding } from "./src/Onboarding";
import { HealthPassport } from "./src/HealthPassport";
import { finishCare, dailyCare } from "./src/routines";
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
  Keyboard,
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
import {
  Adoption,
  AdoptionEntry,
  WeightChart,
  Settings,
  SettingsSection,
  Action,
} from "./src/Features";
import { DateField } from "./src/DateField";
import {
  backupJSON,
  parseBackup,
  mergeBackup,
  type Backup,
} from "./src/backup";
import { s, green } from "./src/styles";
import { FormCloseHeader } from "./src/FormCloseHeader";
import { NearbyVets } from "./src/NearbyVets";
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
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        (pressed || disabled) && { opacity: 0.6 },
      ]}
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
  error,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  error?: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={[
          s.input,
          multiline && { minHeight: 100, textAlignVertical: "top" },
          error ? { borderColor: "#AF493D" } : {},
        ]}
        multiline={multiline}
        returnKeyType={multiline ? "default" : "done"}
        onSubmitEditing={multiline ? undefined : Keyboard.dismiss}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#969D96"
        keyboardType={numeric ? "decimal-pad" : "default"}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
export default function App() {
  return <AppErrorBoundary><WikipatiApp /></AppErrorBoundary>;
}
function WikipatiApp() {
  const [loadAttempt, setLoadAttempt] = useState(0);
  const profileContentY = useRef(0);
  function openProfileSection(section: string) {
    setProfileSection(section);
    mainScroll.current?.scrollTo({y: profileContentY.current, animated: true});
  }
  const [useBackupVersions, setUseBackupVersions] = useState(false);
  const [lifeFilter, setLifeFilter] = useState("Tümü");
  const [repeatDays, setRepeatDays] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backupPreview, setBackupPreview] = useState<Backup | null>(null);
  const [profileSection, setProfileSection] = useState("Sağlık karnesi");
  const [calendarFilter, setCalendarFilter] = useState("Planlı");
  const [calendarPet, setCalendarPet] = useState("Tümü");
  const [calendarQuery, setCalendarQuery] = useState("");
  const [vetsOpen, setVetsOpen] = useState(false);
  const [adoptionOpen, setAdoptionOpen] = useState(false);
  const [store, setStore] = useState<Store>(emptyStore),
    [ready, setReady] = useState(false),
    [failure, setFailure] = useState("");
  const storeRef = useRef<Store>(emptyStore),
    mutation = useRef(false);
  const loaded = useRef(false),
    permissionRequest = useRef(false);
  const mainScroll = useRef<ScrollView>(null),
    formScroll = useRef<ScrollView>(null);
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
    mainScroll.current?.scrollTo({ y: 0, animated: true });
    formScroll.current?.scrollTo({ y: 0, animated: true });
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
            void Notifications.clearLastNotificationResponseAsync().catch(
              () => {},
            );
          });
    if (Platform.OS !== "web")
      Notifications.getLastNotificationResponseAsync()
        .then((r) => {
          if (r && live) {
            setTab("calendar");
            void Notifications.clearLastNotificationResponseAsync().catch(
              () => {},
            );
          }
        })
        .catch(() => {});
    return () => {
      live = false;
      foreground.remove();
      response?.remove();
    };
  }, [loadAttempt]);
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
      if (target.type === "pet" && calendarPet === target.id)
        setCalendarPet("Tümü");
      setLastDeleted(target.type + "-" + target.id);
      inform("Çöp kutusuna taşındı", "Ayarlar bölümünden de geri alabilirsin.");
    }
  }
  function editPet(p: Pet) {
    setErrors({});
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
    setErrors({});
    setEditingEntry(e);
    setSelectedPet(e.petId);
    setTitle(e.title);
    setKind(e.kind);
    setDate(e.date);
    setNotes(e.notes);
    setWeight(e.weight ? String(e.weight) : "");
    setAttachment(null);
    setReminder(!e.done);
    setRepeatDays(e.repeatDays || 0);
    setMessage("");
    setForm("entry");
  }
  const pet = store.pets.find((p) => p.id === selectedPet) || store.pets[0];
  const upcoming = store.entries
    .filter((e) => !e.done)
    .sort((a, b) => a.date.localeCompare(b.date));
  const filtered = articles
    .filter(
      (a) =>
        lifeFilter === "Tümü" ||
        wikiArticles
          .find((w) => w.id === a.id)
          ?.lifeStages.includes(lifeFilter),
    )
    .filter(
      (a) =>
        (category === "Tümü" || a.category === category) &&
        (species === "Tümü" || a.species === species || a.species === "Tümü") &&
        (!onlyFavorites || store.favorites.includes(a.id)) &&
        (a.title + " " + a.summary + " " + a.body)
          .toLocaleLowerCase("tr")
          .includes(query.trim().toLocaleLowerCase("tr")),
    )
    .sort((a, b) => a.title.localeCompare(b.title, "tr"));
  function openPet() {
    setErrors({});
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
    setErrors({});
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
    setRepeatDays(0);
    setForm("entry");
  }
  async function durable(uri: string, name: string) {
    if (Platform.OS === "web") {
      if (uri.startsWith("data:")) return uri;
      const blob = await (await fetch(uri)).blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(Error("Dosya okunamadı"));
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
    const nextErrors: Record<string, string> = {};
    if (form === "pet") {
      if (!name.trim()) nextErrors.name = "Dostunun adını yaz.";
      if (birthday && (!parseDate(birthday) || birthday > today()))
        nextErrors.birthday = "Bugün veya geçmiş bir tarih seç.";
    } else {
      if (!title.trim()) nextErrors.title = "Kayıt için kısa bir başlık yaz.";
      if (!parseDate(date)) nextErrors.date = "Geçerli bir tarih seç.";
      if (kind === "Kilo") {
        if (
          !Number.isFinite(Number(weight.replace(",", "."))) ||
          Number(weight.replace(",", ".")) <= 0
        )
          nextErrors.weight = "Sıfırdan büyük bir kilo gir. Örnek: 4,2";
        if (date > today()) nextErrors.date = "Ölçüm tarihi gelecekte olamaz.";
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formScroll.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    Keyboard.dismiss();
    setBusy(true);
    try {
      if (form === "pet") {
        const p: Pet = {
          ...storeRef.current.pets.find((p) => p.id === editingPet),
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
          repeatDays: pending && repeatDays ? repeatDays : undefined,
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
    await commit(finishCare(storeRef.current, e.id, today(), uid()));
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
        x.id === e.id
          ? { ...x, date: nextDate, postponedFrom: x.postponedFrom || x.date }
          : x,
      ),
    });
  }
  async function importData() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "text/plain"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset.size && asset.size > 10_000_000)
        throw Error("Yedek dosyası 10 MB sınırını aşıyor.");
      const raw =
        Platform.OS === "web"
          ? await (await fetch(asset.uri)).text()
          : await new File(asset.uri).text();
      setBackupPreview(parseBackup(raw));
    } catch (e) {
      inform(e instanceof Error ? e.message : "Yedek okunamadı.");
    }
  }
  useEffect(() => {
    setUseBackupVersions(false);
  }, [backupPreview]);
  async function confirmImport() {
    if (!backupPreview) return;
    const current = storeRef.current,
      next = mergeBackup(current, backupPreview, useBackupVersions);
    const petCount = next.pets.length - current.pets.length,
      entryCount = next.entries.length - current.entries.length;
    if (await commit(next)) {
      setBackupPreview(null);
      inform(
        "Yedek geri yüklendi",
        `${petCount} profil ve ${entryCount} kayıt eklendi. Mevcut kayıtların korundu.`,
      );
    }
  }
  async function exportData() {
    try {
      if (Platform.OS === "web") {
        const url = URL.createObjectURL(
          new Blob([backupJSON(store)], {
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
      f.write(backupJSON(store));
      await Sharing.shareAsync(f.uri, { mimeType: "application/json" });
    } catch {
      inform("Paylaşılamadı", "Bu cihazda paylaşım kullanılamıyor.");
    }
  }
  async function showFile(e: Entry) {
    try {
      if (!e.file) return;
      if (Platform.OS === "web") {
        const a = document.createElement("a");
        a.href = e.file;
        a.download = e.fileName || "wikipati-belge";
        a.click();
      } else await Sharing.shareAsync(e.file);
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
            accessibilityRole="button"
            accessibilityState={{ selected: value === x }}
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
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chips}
      >
        {store.pets.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={`${p.name} profilini seç`}
            accessibilityState={{ selected: pet?.id === p.id }}
            onPress={() => setSelectedPet(p.id)}
            style={[
              s.chip,
              { flexDirection: "row", alignItems: "center", gap: 8 },
              pet?.id === p.id && s.chipActive,
            ]}
          >
            <Icon
              name="paw-outline"
              size={17}
              color={pet?.id === p.id ? "white" : green}
            />
            <Text style={[s.chipText, pet?.id === p.id && { color: "white" }]}>
              {p.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }
  function articleCard(a: (typeof articles)[number]) {
    return (
      <Pressable
        key={a.id}
        accessibilityRole="button"
        accessibilityLabel={`${a.title} maddesini oku`}
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
          <Text
            style={[
              s.small,
              !e.done && e.date < today() && { color: "#AF493D" },
            ]}
          >
            {e.kind} ·{" "}
            {e.done
              ? "Kayıtlı"
              : e.date < today()
                ? "Tarihi geçti"
                : e.date === today()
                  ? "Bugün"
                  : "Planlandı"}
          </Text>
          {!!e.repeatDays && (
            <Text style={s.small}>
              Tekrar:{" "}
              {e.repeatDays === 1 ? "her gün" : e.repeatDays + " günde bir"}
            </Text>
          )}
          {!!e.completedAt && (
            <Text style={s.small}>Tamamlandı: {pretty(e.completedAt)}</Text>
          )}
          {!!e.postponedFrom && (
            <Text style={s.small}>
              İlk plan: {pretty(e.postponedFrom)} · ertelendi
            </Text>
          )}
          {!!e.notes && <Text style={s.muted}>{e.notes}</Text>}
          {!!e.notificationState && !e.done && (
            <Text style={s.small}>{e.notificationState}</Text>
          )}
          {e.file && (
            <Pressable
              accessibilityRole="button"
              style={s.inline}
              onPress={() => showFile(e)}
            >
              <Text style={s.link}>Belgeyi aç · {e.fileName}</Text>
            </Pressable>
          )}
          {!e.done && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 8,
              }}
            >
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                style={s.inline}
                onPress={() => complete(e)}
              >
                <Text style={s.link}>✓ Tamamlandı</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                style={s.inline}
                onPress={() => postpone(e)}
              >
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
            <View style={{gap: 18, alignItems: "center", maxWidth: 360}}>
              <Icon name="folder-open-outline" size={44} />
              <Text style={s.sectionTitle}>Kayıtlarına ulaşılamadı</Text>
              <Text accessibilityRole="alert" style={[s.muted, {textAlign: "center"}]}>{failure}</Text>
              <Button title="Yeniden dene" onPress={() => { setFailure(""); setLoadAttempt(n => n + 1); }} />
            </View>
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
            <Pressable accessibilityRole="button" accessibilityLabel="Wikipati ana sayfa" onPress={() => setTab("home")} style={s.brand}>
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
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
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
            {!store.onboardingDone && tab === "home" && (
              <Onboarding
                store={store}
                onSave={(next) => commit(next, false)}
                onAdd={openPet}
                onPermission={enableNotifications}
              />
            )}
            {tab === "home" && (
              <>
                <WikiHome
                  onOpen={openArticle}
                  onPets={() => {
                    if (store.pets.length) setTab("pets");
                    else openPet();
                  }}
                  onCalendar={() => setTab("calendar")}
                  petCount={store.pets.length}
                  careCount={upcoming.length}
                  nextCare={
                    upcoming[0]
                      ? `${upcoming[0].date < today() ? "Geciken bakım · " : ""}${store.pets.find((p) => p.id === upcoming[0].petId)?.name || "Dostun"} · ${upcoming[0].title} · ${pretty(upcoming[0].date)}`
                      : undefined
                  }
                  onLibrary={() => setTab("library")}
                  onAddCare={openEntry}
                  onVets={() => setVetsOpen(true)}
                >
                {pet && (
                  <View style={s.note}>
                    <View style={{ flex: 1, gap: 8 }}>
                      <Text style={s.cardTitle}>{pet.name} için keşfet</Text>
                      <Text style={s.muted}>
                        {pet.species} · {pet.lifeStage || "Her yaşam dönemi"}
                        {pet.birthday
                          ? ` · Doğum: ${pretty(pet.birthday)}`
                          : ""}
                      </Text>
                      <Action
                        label="Sana özel bilgiler"
                        onPress={() => {
                          setSpecies(pet.species);
                          setLifeFilter(pet.lifeStage || "Tümü");
                          setCategory(pet.needs?.[0] || "Tümü");
                          setTab("library");
                        }}
                      />
                    </View>
                  </View>
                )}
                <View style={{ gap: 12 }}>
                  <Text style={s.sectionTitle}>Günlük bakım listem</Text>
                  {dailyCare(store.entries, today()).length ? (
                    dailyCare(store.entries, today()).map(entryCard)
                  ) : (
                    <Text style={s.muted}>
                      Bugün yapılacak tekrar eden bakımın yok. İleri tarihli rutinlerini takvimde görebilirsin.
                    </Text>
                  )}
                  <Action
                    label="Tekrar eden bakım ekle"
                    onPress={() => {
                      openEntry();
                      if (pet) {
                        setKind("Bakım");
                        setRepeatDays(1);
                      }
                    }}
                  />
                </View>
                </WikiHome>
                <AdoptionEntry
                  expanded={adoptionOpen}
                  onPress={() => setAdoptionOpen(!adoptionOpen)}
                />
                {adoptionOpen && (
                  <Adoption
                    key={pet?.id || "guest"}
                    pet={pet}
                    checked={
                      store.checklist[pet?.id || "__adoption_guest__"] || []
                    }
                    onToggle={(id) => {
                      const key = pet?.id || "__adoption_guest__";
                      const current = storeRef.current;
                      const checked = current.checklist[key] || [];
                      void commit(
                        {
                          ...current,
                          checklist: {
                            ...current.checklist,
                            [key]: checked.includes(id)
                              ? checked.filter((x) => x !== id)
                              : [...checked, id],
                          },
                        },
                        false,
                      );
                    }}
                    onPlan={
                      pet
                        ? () => {
                            openEntry();
                            setKind("Kontrol");
                            setTitle("İlk veteriner görüşmesi");
                          }
                        : undefined
                    }
                  />
                )}
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
                <Text style={s.label}>Konu</Text>
                {chips(categories, category, setCategory)}
                <Text style={s.label}>Dostunun türü</Text>
                {chips(["Tümü", "Kedi", "Köpek"], species, setSpecies)}
                <Text style={s.label}>Yaşam dönemi</Text>
                {chips(
                  ["Tümü", "Yavru", "Yetişkin", "İleri yaş"],
                  lifeFilter,
                  setLifeFilter,
                )}
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: onlyFavorites }}
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
                      "Farklı bir kelime deneyebilir veya filtreleri sıfırlayabilirsin.",
                      () => { setQuery(""); setCategory("Tümü"); setSpecies("Tümü"); setLifeFilter("Tümü"); setOnlyFavorites(false); },
                      "Filtreleri temizle",
                    )}
                <Text style={s.footnote}>
                  İçerikler güvenilir kaynaklardan derlenir; kaynak bağlantıları
                  her maddede yer alır. Bilgilendirme amaçlıdır; tanı ve tedavi
                  yerine geçmez.
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
                    accessibilityRole="button"
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
                    <View style={[s.profile, { alignItems: "stretch" }]}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
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
                        <View style={{ flex: 1, gap: 6 }}>
                          <Text
                            style={[
                              s.heading,
                              { fontSize: 27, lineHeight: 34 },
                            ]}
                          >
                            {pet.name}
                          </Text>
                          <Text style={s.muted}>
                            {pet.species}
                            {pet.breed ? " · " + pet.breed : ""}
                          </Text>
                          {!!pet.birthday && (
                            <Text style={s.muted}>
                              Doğum tarihi · {pretty(pet.birthday)}
                            </Text>
                          )}
                        </View>
                      </View>
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
                    <View style={{flexDirection: "row", flexWrap: "wrap", gap: 10}}>
                      {([
                        {label: "Sağlık karnesi", detail: "Kayıtları gör ve PDF paylaş", icon: "document-text-outline", action: () => openProfileSection("Sağlık karnesi")},
                        {label: "Birlikte bakım", detail: "Görüşme notu ve bakım kartı", icon: "people-outline", action: () => openProfileSection("Birlikte bakım")},
                        {label: "Kilo takibi", detail: "Ölçümleri ve değişimi gör", icon: "analytics-outline", action: () => openProfileSection("Kilo")},
                      ] as const).map(item => <Pressable key={item.label} accessibilityRole="button" onPress={item.action} style={({pressed}) => [s.quickCard, pressed && {opacity: 0.7}]}>
                        <Icon name={item.icon} size={24}/><Text style={s.cardTitle}>{item.label}</Text><Text style={s.small}>{item.detail}</Text>
                      </Pressable>)}
                    </View>
                    <View style={s.statRow}>
                      <View style={s.stat}>
                        <Text style={s.sectionTitle}>
                          {
                            store.entries.filter((e) => e.petId === pet.id)
                              .length
                          }
                        </Text>
                        <Text style={s.muted}>Bakım kaydı</Text>
                      </View>
                      <View style={s.stat}>
                        <Text style={s.sectionTitle}>
                          {upcoming.filter((e) => e.petId === pet.id).length}
                        </Text>
                        <Text style={s.muted}>Planlı işlem</Text>
                      </View>
                    </View>
                    {!!upcoming.find((e) => e.petId === pet.id) && (
                      <View style={s.note}>
                        <Icon name="calendar-outline" />
                        <View style={{ flex: 1, gap: 4 }}>
                          <Text style={s.label}>
                            {upcoming.find((e) => e.petId === pet.id)!.date <
                            today()
                              ? "Tarihi geçen bakım"
                              : "Sıradaki bakım"}
                          </Text>
                          <Text style={s.muted}>
                            {upcoming.find((e) => e.petId === pet.id)!.title} ·{" "}
                            {pretty(
                              upcoming.find((e) => e.petId === pet.id)!.date,
                            )}
                          </Text>
                        </View>
                        <Action
                          label="Aç"
                          onPress={() => {
                            setCalendarPet(pet.id);
                            setCalendarFilter("Planlı");
                            setTab("calendar");
                          }}
                        />
                      </View>
                    )}
                    <View onLayout={e => { profileContentY.current = e.nativeEvent.layout.y; }} />
                    {chips(
                      ["Sağlık karnesi", "Birlikte bakım", "Geçmiş", "Kilo", "İlk adımlar"],
                      profileSection,
                      setProfileSection,
                    )}
                    {profileSection === "Birlikte bakım" && <PetDocuments key={pet.id} pet={pet} entries={store.entries} onSave={async (title,notes) => commit({...storeRef.current, entries:[...storeRef.current.entries,{id:uid(),petId:pet.id,title,notes,date:today(),kind:"Not",done:true}]},false)} onPlan={(notes)=>{openEntry();setKind("Kontrol");setTitle("Veteriner görüşmesi sonrası takip");setNotes(notes);}} />}
                    {profileSection === "İlk adımlar" && (
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
                    )}
                    {profileSection === "Sağlık karnesi" && (
                      <HealthPassport
                        pet={pet}
                        entries={store.entries}
                        onFile={showFile}
                      />
                    )}
                    {profileSection === "Kilo" && (
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
                    )}
                    {profileSection === "Geçmiş" && (
                      <>
                        <Text style={s.sectionTitle}>
                          Sağlık ve bakım geçmişi
                        </Text>
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
                      </>
                    )}
                    <SettingsSection title="Profil yönetimi" subtitle="Bilgileri düzenle veya profili kaldır" icon="options-outline">
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

                    </SettingsSection>
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
                  Yaklaşan aşıları, kontrolleri ve bakım planlarını takip et.
                </Text>
                <Button title="+ Hatırlatma ekle" onPress={openEntry} />
                <View style={s.search}>
                  <Icon name="search-outline" />
                  <TextInput accessibilityLabel="Bakım kayıtlarında ara" placeholder="Kayıt, pati adı veya not ara" value={calendarQuery} onChangeText={setCalendarQuery} style={{flex: 1, minWidth: 0, color: green, fontSize: 15}} returnKeyType="search" />
                  {!!calendarQuery && <Pressable accessibilityRole="button" accessibilityLabel="Kayıt aramasını temizle" onPress={() => setCalendarQuery("")} style={{minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center"}}><Icon name="close" /></Pressable>}
                </View>
                <View style={s.statRow}>
                  {[{label: "Bugün", filter: "Bugün"}, {label: "Geciken", filter: "Geciken"}, {label: "7 gün", filter: "7 gün"}].map(item => <Pressable key={item.filter} accessibilityRole="button" accessibilityLabel={item.label + " bakım kayıtlarını göster"} accessibilityState={{selected: calendarFilter === item.filter}} onPress={() => {setCalendarFilter(item.filter); setCalendarQuery("");}} style={[s.stat, calendarFilter === item.filter && {borderWidth: 1, borderColor: green}]}>
                    <Text style={s.sectionTitle}>{calendarEntries(store.entries, store.pets, today(), item.filter, calendarPet).length}</Text>
                    <Text style={s.muted}>{item.label}</Text>
                  </Pressable>)}
                </View>
                {chips(
                  ["Planlı", "Bugün", "Geciken", "7 gün", "Geçmiş"],
                  calendarFilter,
                  setCalendarFilter,
                )}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.chips}
                >
                  {[{ id: "Tümü", name: "Tüm patiler" }, ...store.pets].map(
                    (p) => (
                      <Pressable
                        key={p.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: calendarPet === p.id }}
                        style={[s.chip, calendarPet === p.id && s.chipActive]}
                        onPress={() => setCalendarPet(p.id)}
                      >
                        <Text
                          style={[
                            s.chipText,
                            calendarPet === p.id && { color: "white" },
                          ]}
                        >
                          {p.name}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </ScrollView>
                {(() => {
                  const list = calendarEntries(store.entries, store.pets, today(), calendarFilter, calendarPet, calendarQuery);
                  return list.length
                    ? list.map((e, i) => (
                        <React.Fragment key={e.id}>
                          {(!i || list[i - 1].date !== e.date) && (
                            <Text style={s.eyebrow}>
                              {pretty(e.date).toLocaleUpperCase("tr-TR")}
                            </Text>
                          )}
                          {entryCard(e)}
                        </React.Fragment>
                      ))
                    : empty(
                        "calendar-outline",
                        calendarFilter === "Bugün"
                          ? "Bugün için plan yok"
                          : "Burada henüz kayıt yok",
                        "Aramanı veya seçtiğin pati ve zaman aralığını değiştirebilirsin.",
                        () => {setCalendarQuery(""); setCalendarPet("Tümü"); setCalendarFilter("Planlı");},
                        "Tüm planları göster",
                      );
                })()}
              </>
            )}
            {tab === "settings" && (
              <Settings
                account={<CloudAccount store={store} onRestore={setBackupPreview} />}
                onOnboarding={() => {
                  void commit({ ...storeRef.current, onboardingDone: false }, false).then((ok) => { if (ok) setTab("home"); });
                }}
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
                onImport={importData}
                onRestore={restore}
                onMessage={inform}
              />
            )}
            <Text style={s.footer}>Birlikte, her pati için daha iyi. ♡</Text>
          </ScrollView>
          <View style={s.nav}>
            {(
              [
                { id: "home", icon: "compass-outline", label: "Keşfet" },
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
          visible={vetsOpen}
          animationType="slide"
          onRequestClose={() => setVetsOpen(false)}
        >
          <SafeAreaProvider>
            <SafeAreaView style={s.root}>
              {vetsOpen && <NearbyVets onClose={() => setVetsOpen(false)} />}
            </SafeAreaView>
          </SafeAreaProvider>
        </Modal>
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
              if (pet) {setTitle(plannedArticle);setKind(plannedArticle.includes("Aşı")?"Aşı":"Bakım");}
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
                  planAvailable={!pet || article.species === "Tümü" || pet.species === article.species}
                  personalContext={<LivingArticle article={article} pet={pet} pets={store.pets} entries={store.entries} onSelect={setSelectedPet} onRecords={() => {setArticle(null);setArticleHistory([]);setProfileSection(article.category === "Beslenme" ? "Kilo" : "Sağlık karnesi");setTab("pets");}} />}
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
                      if (pet) {setTitle(topic);setKind(topic.includes("Aşı")?"Aşı":"Bakım");}
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
                  keyboardDismissMode="on-drag"
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
                      {!!photo && (
                        <Image
                          source={{ uri: photo }}
                          style={[s.profilePhoto, { alignSelf: "center" }]}
                        />
                      )}
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
                        error={errors.name}
                        label="İsim *"
                        value={name}
                        onChange={(v) => {
                          setName(v);
                          setErrors((e) => ({ ...e, name: "" }));
                        }}
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
                      <DateField
                        pastOnly
                        optional
                        error={errors.birthday}
                        label="Doğum tarihi (isteğe bağlı)"
                        value={birthday}
                        onChange={setBirthday}
                      />
                      <Field
                        multiline
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
                        error={errors.title}
                        label="Başlık *"
                        value={title}
                        onChange={(v) => {
                          setTitle(v);
                          setErrors((e) => ({ ...e, title: "" }));
                        }}
                        placeholder="Örn. Yıllık veteriner kontrolü"
                      />
                      <DateField
                        pastOnly={kind === "Kilo"}
                        error={errors.date}
                        label="Tarih *"
                        value={date}
                        onChange={(v) => {
                          setDate(v);
                          setErrors((e) => ({ ...e, date: "" }));
                        }}
                      />
                      {reminder && kind !== "Kilo" && kind !== "Not" && (
                        <View style={{ gap: 8 }}>
                          <Text style={s.label}>Tekrar sıklığı</Text>
                          {chips(
                            [
                              "Tek sefer",
                              "Her gün",
                              "Her hafta",
                              "30 günde bir",
                            ],
                            repeatDays === 1
                              ? "Her gün"
                              : repeatDays === 7
                                ? "Her hafta"
                                : repeatDays === 30
                                  ? "30 günde bir"
                                  : "Tek sefer",
                            (x) =>
                              setRepeatDays(
                                x === "Her gün"
                                  ? 1
                                  : x === "Her hafta"
                                    ? 7
                                    : x === "30 günde bir"
                                      ? 30
                                      : 0,
                              ),
                          )}
                          <Text style={s.small}>
                            Tamamlandığında sonraki kayıt oluşur. İlaç sıklığını
                            veterinerinin planına göre seç.
                          </Text>
                        </View>
                      )}
                      {kind === "Kilo" && (
                        <Field
                          error={errors.weight}
                          label="Kilo (kg) *"
                          value={weight}
                          onChange={(v) => {
                            setWeight(v);
                            setErrors((e) => ({ ...e, weight: "" }));
                          }}
                          numeric
                        />
                      )}
                      <Field
                        multiline
                        label="Notlar"
                        value={notes}
                        onChange={setNotes}
                        placeholder="Veteriner, uygulama ve gözlem notları"
                      />
                      {kind !== "Kilo" && kind !== "Not" && (
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: reminder }}
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
                </ScrollView>
                <View
                  style={{
                    paddingHorizontal: 22,
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderColor: "#DEE7DF",
                    backgroundColor: "#F7F9F5",
                  }}
                >
                  <Button
                    disabled={busy}
                    title={busy ? "Kaydediliyor…" : "Kaydet"}
                    onPress={save}
                  />
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </SafeAreaProvider>
        </Modal>
        <Modal
          visible={!!backupPreview}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!busy) setBackupPreview(null);
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#102C27AA",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 24,
                padding: 24,
                gap: 18,
                maxWidth: 500,
                width: "100%",
                alignSelf: "center",
              }}
            >
              <Text style={s.sectionTitle}>Yedeği geri yükle</Text>
              <Text style={s.muted}>
                {backupPreview?.pets.length} profil ve{" "}
                {backupPreview?.entries.length} kayıt bulundu. Eksik kayıtlar
                eklenir. Aynı kaydın iki farklı sürümü varsa hangisi
                kullanılsın? Çöp kutusu ve bildirim ayarların korunur.
              </Text>
              {chips(
                ["Bu cihazdaki sürüm", "Yedekteki sürüm"],
                useBackupVersions ? "Yedekteki sürüm" : "Bu cihazdaki sürüm",
                (x) => setUseBackupVersions(x === "Yedekteki sürüm"),
              )}
              {useBackupVersions && (
                <Text style={s.error}>
                  Aynı kimlikli profil ve kayıtların metin bilgileri yedekteki
                  sürümle değiştirilecek.
                </Text>
              )}
              <Text style={s.muted}>
                Fotoğraflar ve belgeler bu yedeğe dahil değildir. Yeni planlı
                kayıtlar mevcut bildirim tercihlerine göre planlanır.
              </Text>
              <Button
                disabled={busy}
                title={busy ? "Ekleniyor…" : "Kayıtları birleştir"}
                onPress={confirmImport}
              />
              <Button
                disabled={busy}
                secondary
                title="Vazgeç"
                onPress={() => setBackupPreview(null)}
              />
            </View>
          </View>
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
