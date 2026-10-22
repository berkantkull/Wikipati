import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  Keyboard,
  Platform,
  Share,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Entry, Pet, Preferences, Store } from "./data";
import type { PermissionState } from "./notifications";
import { weightPoints, selectedDays } from "./care";
import { green } from "./styles";

export function Action({
  label,
  onPress,
  danger = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      accessibilityState={{disabled}}
      onPress={onPress}
      style={({ pressed }) => [
        f.action,
        (pressed || disabled) && { opacity: 0.5 },
      ]}
    >
      <Text style={[f.actionText, danger && { color: "#A34838" }]}>
        {label}
      </Text>
    </Pressable>
  );
}
const stages = [
  {
    title: "İlk gün",
    items: [
      ["space", "Dinlenme alanını hazırla"],
      ["water", "Su ve mama kaplarını yerleştir"],
      ["secure", "Pencere, balkon ve kabloları kontrol et"],
    ],
  },
  {
    title: "İlk hafta",
    items: [
      ["routine", "Günlük bakım rutinini not et"],
      ["records", "Önceki sağlık belgelerini bir araya getir"],
      ["contact", "Veteriner iletişim bilgisini kaydet"],
    ],
  },
  {
    title: "İlk veteriner görüşmesi",
    items: [
      ["questions", "Sorularını ve gözlemlerini yaz"],
      ["documents", "Varsa karne ve raporları hazırla"],
      ["appointment", "Kontrol randevusunu takvime ekle"],
    ],
  },
];
export function AdoptionEntry({
  onPress,
  expanded,
}: {
  onPress: () => void;
  expanded: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={expanded ? "Yeni pati hazırlık listesini kapat" : "Yeni pati hazırlık listesini aç"}
      accessibilityState={{ expanded }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 18,
        borderRadius: 20,
        backgroundColor: pressed ? "#E2E9DA" : "#EEF2E8",
        borderWidth: 1,
        borderColor: "#DCE5D4",
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="home-outline" size={23} color={green} />
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={{ color: green, fontSize: 17, fontWeight: "700" }}>
          Birlikte ilk adımlar
        </Text>
        <Text style={{ color: "#677260", fontSize: 13, lineHeight: 19 }}>
          Yeni mi sahiplendin? İlk gün ve ilk hafta için hazırlık listesine
          göz at.
        </Text>
      </View>
      <Ionicons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={20}
        color={green}
      />
    </Pressable>
  );
}
export function Adoption({
  pet,
  checked,
  onToggle,
  onPlan,
}: {
  pet?: Pet;
  checked: string[];
  onToggle: (id: string) => void;
  onPlan?: () => void;
}) {
  const [stage, setStage] = useState(0);
  return (
    <View style={f.card}>
      <Text style={f.eyebrow}>YENİ SAHİPLENDİM</Text>
      <Text style={f.title}>
        {pet ? `${pet.name} ile ilk adımlar` : "Yeni dostuna hazırlan"}
      </Text>
      <Text style={f.muted}>
        Adım adım ilerle. {checked.length}/9 adım tamamlandı.
      </Text>
      {!pet && (
        <Text style={f.muted}>
          Profil oluşturmadan başlayabilirsin. İşaretlediğin adımlar bu cihazda
          saklanır.
        </Text>
      )}
      <View style={f.track}>
        <View
          style={[
            f.fill,
            { width: `${Math.min(100, (checked.length / 9) * 100)}%` },
          ]}
        />
      </View>
      <View style={f.wrap}>
        {stages.map((x, i) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${x.title} hazırlık aşamasını seç`}
            key={x.title}
            onPress={() => setStage(i)}
            style={[f.chip, stage === i && f.selected]}
          >
            <Text
              style={{ color: stage === i ? "white" : green, fontSize: 12 }}
            >
              {x.title}
            </Text>
          </Pressable>
        ))}
      </View>
      {stages[stage].items.map(([id, text]) => (
        <Pressable
          key={id}
          accessibilityRole="checkbox"
          accessibilityLabel={text}
          accessibilityState={{ checked: checked.includes(id) }}
          onPress={() => onToggle(id)}
          style={f.check}
        >
          <Ionicons
            name={checked.includes(id) ? "checkbox" : "square-outline"}
            size={24}
            color={green}
          />
          <Text
            style={[
              f.checkText,
              checked.includes(id) && {
                textDecorationLine: "line-through",
                color: "#7C8679",
              },
            ]}
          >
            {text}
          </Text>
        </Pressable>
      ))}
      {onPlan && stage === 2 && (
        <Action label="Kontrol hatırlatması oluştur →" onPress={onPlan} />
      )}
    </View>
  );
}
export function WeightChart({
  pet,
  entries,
  onAdd,
  onMessage,
}: {
  pet: Pet;
  entries: Entry[];
  onAdd: () => void;
  onMessage: (text: string) => void;
}) {
  const [period, setPeriod] = useState("Tümü"),
    [width, setWidth] = useState(280);
  const all = weightPoints(entries, pet.id);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (period === "30 gün" ? 30 : 90));
  const points =
    period === "Tümü"
      ? all
      : all.filter((e) => new Date(e.date + "T12:00:00") >= cutoff);
  const values = points.map((p) => p.weight!);
  const max = Math.max(...values, 1),
    min = Math.min(...values, max);
  const range = max - min || 1;
  const firstTime = points.length ? new Date(points[0].date).getTime() : 0,
    lastTime = points.length
      ? new Date(points[points.length - 1].date).getTime()
      : 0;
  const coords = points.map((p) => ({
    x:
      points.length === 1
        ? width / 2
        : 24 +
          ((new Date(p.date).getTime() - firstTime) /
            (lastTime - firstTime || 1)) *
            (width - 48),
    y: 130 - ((p.weight! - min) / range) * 100,
  }));
  async function summary() {
    const text = `${pet.name} • Kilo özeti\n${all.map((e) => `${e.date}: ${e.weight} kg`).join("\n")}\nBu kayıtlar tanı veya ideal kilo değerlendirmesi içermez.`;
    try {
      if (Platform.OS === "web") {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "wikipati-kilo-ozeti.txt";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else
        await Share.share({ message: text, title: pet.name + " kilo özeti" });
    } catch {
      onMessage("Özet paylaşılamadı. Tekrar deneyin.");
    }
  }
  return (
    <View style={f.card}>
      <Text style={f.title}>Kilo takibi</Text>
      <View style={f.wrap}>
        {["Tümü", "30 gün", "90 gün"].map((p) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${p} kilo kayıtlarını göster`}
            key={p}
            onPress={() => setPeriod(p)}
            style={[f.chip, period === p && f.selected]}
          >
            <Text style={{ color: period === p ? "white" : green }}>{p}</Text>
          </Pressable>
        ))}
      </View>
      {points.length ? (
        <>
          <Text style={f.big}>
            {points[points.length - 1].weight}{" "}
            <Text style={f.muted}>kg · son kayıt</Text>
          </Text>
          <View
            accessibilityLabel={`Kilo grafiği. ${points.map((p) => p.date + ": " + p.weight + " kilogram").join(", ")}`}
            style={{ height: 160 }}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          >
            {[30, 80, 130].map((y) => (
              <View
                key={y}
                style={{
                  position: "absolute",
                  top: y,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: "#E0E6DB",
                }}
              />
            ))}
            {coords.slice(1).map((p, i) => {
              const a = coords[i],
                dx = p.x - a.x,
                dy = p.y - a.y,
                length = Math.sqrt(dx * dx + dy * dy);
              return (
                <View
                  key={"line" + i}
                  style={{
                    position: "absolute",
                    left: (a.x + p.x) / 2 - length / 2,
                    top: (a.y + p.y) / 2 - 1,
                    height: 2,
                    width: length,
                    backgroundColor: green,
                    transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
                  }}
                />
              );
            })}
            {coords.map((p, i) => (
              <View
                key={points[i].id}
                style={{
                  position: "absolute",
                  left: p.x - 5,
                  top: p.y - 5,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: green,
                }}
              />
            ))}
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={f.small}>{points[0].date}</Text>
            <Text style={f.small}>{points[points.length - 1].date}</Text>
          </View>
          {points.map((p) => (
            <Text key={p.id} style={f.muted}>
              {p.date} · {p.weight} kg
            </Text>
          ))}
          <Text style={f.small}>
            Grafik aralığı: {min}–{max} kg. İdeal kilo göstergesi değildir.
          </Text>
        </>
      ) : (
        <Text style={f.muted}>
          Bu dönemde kilo kaydı yok. İlk ölçümü ekleyerek başlayabilirsin.
        </Text>
      )}
      <View style={f.wrap}>
        <Action label="+ Kilo ekle" onPress={onAdd} />
        <Action label="Özeti paylaş" disabled={!all.length} onPress={summary} />
      </View>
    </View>
  );
}
export function SettingsSection({title, subtitle, icon, children}: {title: string; subtitle: string; icon: React.ComponentProps<typeof Ionicons>["name"]; children: React.ReactNode}) {
  const [open, setOpen] = useState(false);
  return <View style={f.card}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${title} bölümünü ${open ? "kapat" : "aç"}`} accessibilityState={{expanded: open}} onPress={() => setOpen(!open)} style={({pressed}) => [{flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56}, pressed && {opacity: 0.65}]}>
      <View style={{backgroundColor: "#EDF3EF", padding: 12, borderRadius: 14}}><Ionicons name={icon} size={23} color={green} /></View>
      <View style={{flex: 1, gap: 4}}><Text style={f.title}>{title}</Text><Text style={f.small}>{subtitle}</Text></View>
      <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={green}/>
    </Pressable>
    {open && <View style={{gap: 14, paddingTop: 12, borderTopWidth: 1, borderColor: "#E3E8DC"}}>{children}</View>}
  </View>;
}

export function Settings({
  account,
  onOnboarding,
  store,
  permission,
  working,
  onPermission,
  onTest,
  onSync,
  onPreferences,
  onExport,
  onImport,
  onRestore,
  onMessage,
}: {
  account: React.ReactNode;
  onOnboarding: () => void;
  store: Store;
  permission: PermissionState;
  working: boolean;
  onPermission: () => void;
  onTest: () => void;
  onSync: () => void;
  onPreferences: (p: Preferences) => void;
  onExport: () => void;
  onImport: () => void;
  onRestore: (id: string) => void;
  onMessage: (s: string) => void;
}) {
  const prefs = store.preferences;
  const days = selectedDays(prefs);
  const [customHour, setCustomHour] = useState(
    String(prefs.hour).padStart(2, "0"),
  );
  const [customMinute, setCustomMinute] = useState(
    String(prefs.minute || 0).padStart(2, "0"),
  );
  const [timeError, setTimeError] = useState("");
  useEffect(() => {
    setCustomHour(String(prefs.hour).padStart(2, "0"));
    setCustomMinute(String(prefs.minute || 0).padStart(2, "0"));
  }, [prefs.hour, prefs.minute]);
  function saveTime() {
    if (
      !/^\d{1,2}$/.test(customHour) ||
      !/^\d{1,2}$/.test(customMinute) ||
      Number(customHour) > 23 ||
      Number(customMinute) > 59
    ) {
      setTimeError("Saat 00–23, dakika 00–59 arasında olmalı.");
      return;
    }
    Keyboard.dismiss();
    setTimeError("");
    onPreferences({
      ...prefs,
      hour: Number(customHour),
      minute: Number(customMinute),
    });
  }

  return (
    <>
      <Text style={f.eyebrow}>WİKİPATİ</Text>
      <Text style={f.heading}>Ayarlar</Text>
      <Text style={f.muted}>Bildirimlerini ve kişisel kayıtlarını yönet.</Text>
      <SettingsSection title="Bildirimler" subtitle={permission.allowed ? "İzin verildi · Saat ve gün tercihleri" : "İzin durumu, saat ve gün tercihleri"} icon="notifications-outline">
        <View style={f.row}>
          <Ionicons name="notifications-outline" size={26} color={green} />
          <View style={{ flex: 1 }}>
            <Text style={f.title}>Bildirim izni</Text>
            <Text style={f.muted}>{permission.label}</Text>
          </View>
        </View>
        <Text style={f.muted}>
          Aşı, kontrol ve bakım zamanlarında telefonuna hatırlatma gönderelim.
          İzin kararı her zaman sende.
        </Text>
        <Action
          label={
            permission.allowed
              ? "Telefon bildirim ayarları"
              : permission.canAskAgain
                ? "Bildirimlere izin ver"
                : "Telefon ayarlarını aç"
          }
          disabled={working || Platform.OS === "web"}
          onPress={
            permission.allowed
              ? () => {
                  Linking.openSettings().catch(() =>
                    onMessage("Telefon ayarları açılamadı."),
                  );
                }
              : onPermission
          }
        />
        {Platform.OS === "web" && (
          <Text style={f.small}>
            Gerçek telefon bildirimlerini Expo veya kurulu mobil uygulamada
            etkinleştirebilirsin.
          </Text>
        )}
        <View style={f.divider} />
        <View style={f.row}>
          <View style={{ flex: 1 }}>
            <Text style={f.label}>Bakım hatırlatmaları</Text>
            <Text style={f.small}>Açık kayıtlar için bildirim planla</Text>
          </View>
          <Switch
            accessibilityLabel="Bakım hatırlatmaları"
            value={prefs.reminders}
            disabled={working}
            onValueChange={(reminders) =>
              onPreferences({ ...prefs, reminders })
            }
            trackColor={{ true: green }}
          />
        </View>
        <Text style={f.label}>Hangi günlerde hatırlatalım?</Text>
        <Text style={f.small}>
          Birden fazla gün seçebilirsin. Seçtiğin her gün için ayrı bir bildirim
          gelir.
        </Text>
        <View style={f.wrap}>
          {[0, 1, 3].map((day) => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={day ? `${day} gün önce hatırlat` : "Aynı gün hatırlat"}
              accessibilityState={{
                checked: days.includes(day),
                disabled: working,
              }}
              disabled={working}
              key={day}
              onPress={() =>
                onPreferences({
                  ...prefs,
                  daysBefore: days.includes(day)
                    ? days.filter((d) => d !== day)
                    : [...days, day],
                })
              }
              style={[
                f.chip,
                { flexDirection: "row", alignItems: "center", gap: 6 },
                days.includes(day) && f.selected,
              ]}
            >
              <Ionicons
                name={
                  days.includes(day) ? "checkmark-circle" : "ellipse-outline"
                }
                size={18}
                color={days.includes(day) ? "white" : green}
              />
              <Text style={{ color: days.includes(day) ? "white" : green }}>
                {day ? `${day} gün önce` : "Aynı gün"}
              </Text>
            </Pressable>
          ))}
        </View>
        {!days.length && (
          <Text accessibilityRole="alert" style={{ color: "#AF493D" }}>
            Bildirim almak için en az bir gün seç.
          </Text>
        )}
        <Text style={f.label}>Hatırlatma saati</Text>
        <Text style={f.small}>
          Seçili tüm günlerde {String(prefs.hour).padStart(2, "0")}:
          {String(prefs.minute || 0).padStart(2, "0")} · telefonunun yerel saati
        </Text>
        <View style={f.wrap}>
          {[9, 12, 18].map((hour) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${String(hour).padStart(2, "0")}:00 hatırlatma saatini seç`}
              accessibilityState={{
                selected: prefs.hour === hour && !prefs.minute,
              }}
              disabled={working}
              key={hour}
              onPress={() => {
                setTimeError("");
                onPreferences({ ...prefs, hour, minute: 0 });
              }}
              style={[
                f.chip,
                prefs.hour === hour && !prefs.minute && f.selected,
              ]}
            >
              <Text
                style={{
                  color: prefs.hour === hour && !prefs.minute ? "white" : green,
                }}
              >
                {String(hour).padStart(2, "0")}:00
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={f.label}>Kendi saatini belirle</Text>
        <View style={f.row}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={f.small}>Saat (00–23)</Text>
            <TextInput
              accessibilityLabel="Hatırlatma saati"
              editable={!working}
              value={customHour}
              onChangeText={(v) => {
                setCustomHour(v);
                setTimeError("");
              }}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
              style={f.timeInput}
            />
          </View>
          <Text style={f.title}>:</Text>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={f.small}>Dakika (00–59)</Text>
            <TextInput
              accessibilityLabel="Hatırlatma dakikası"
              editable={!working}
              value={customMinute}
              onChangeText={(v) => {
                setCustomMinute(v);
                setTimeError("");
              }}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
              style={f.timeInput}
            />
          </View>
        </View>
        {!!timeError && (
          <Text accessibilityRole="alert" style={{ color: "#AF493D" }}>
            {timeError}
          </Text>
        )}
        <Action label="Bu saati uygula" disabled={working} onPress={saveTime} />
        <Text style={f.small}>
          Geçmiş zamanlar atlanır; yalnızca seçtiğin günlerde bildirim
          planlanır. Değişiklikler mevcut planlara da uygulanır.
        </Text>
        <Action
          label="5 saniye sonra test bildirimi gönder"
          disabled={working || !permission.allowed || !prefs.reminders}
          onPress={onTest}
        />
        <Action
          label="Bildirim durumunu yenile ve yeniden planla"
          disabled={working || Platform.OS === "web"}
          onPress={onSync}
        />
      </SettingsSection>
      <SettingsSection title="Kayıtlar ve yedekleme" subtitle="Kayıtlarını yedekle ve geri yükle" icon="folder-open-outline">
        {account}
        <Text style={f.label}>Bu cihazda saklanır</Text>
        <Text style={f.muted}>
          Profillerin, bakım kayıtların ve hazırlık listelerin bu cihazda saklanır. Uygulamayı
          kaldırmak verilerini silebilir.
        </Text>
        <Action
          label="Kayıtları dışa aktar ↓"
          disabled={working}
          onPress={onExport}
        />
        <Action
          label="Yedekten geri yükle ↑"
          disabled={working}
          onPress={onImport}
        />
        <Text style={f.small}>
          JSON dosyası kayıt bilgilerini içerir. Fotoğraf ve belge dosyaları ve
          çöp kutusu dahil değildir. Geri yüklemeden önce içeriği inceleyebilir ve aynı kayıtlar için hangi sürümün korunacağını seçebilirsin.
        </Text>
      </SettingsSection>
      <SettingsSection title="Çöp kutusu" subtitle={`${store.trash.length} silinen öğe · Geri alınabilir`} icon="trash-outline">
        {store.trash.length ? (
          store.trash.map((t) => (
            <View key={t.id} style={f.row}>
              <View style={{ flex: 1 }}>
                <Text style={f.label}>
                  {t.pet?.name || t.entries[0]?.title}
                </Text>
                <Text style={f.small}>
                  {t.pet
                    ? "Profil ve " + t.entries.length + " kayıt"
                    : "Bakım kaydı"}
                </Text>
              </View>
              <Action
                label="Geri al"
                disabled={working}
                onPress={() => onRestore(t.id)}
              />
            </View>
          ))
        ) : (
          <Text style={f.muted}>
            Silinen profiller ve kayıtlar burada geri alınabilir.
          </Text>
        )}
      </SettingsSection>
      <SettingsSection title="Kullanım ve gizlilik" subtitle="Verilerin, izinlerin ve Wikipati hakkında" icon="shield-checkmark-outline">
        <Text style={f.muted}>Konumun yalnızca veteriner araması başlattığında istenir. Yakındaki sonuçlar için harita hizmetine aktarılır. Fotoğraf ve belge erişimi, sen eklemek istediğinde kullanılır.</Text>
        <Text style={f.muted}>Bilgi kütüphanesi çevrimdışı okunabilir. Harita ve etkinleştirildiğinde bulut işlemleri internet gerektirir. İçerikler bilgilendirme amaçlıdır; tanı ve tedavi yerine geçmez.</Text>
        <Action label="Başlangıç tercihlerini düzenle" onPress={onOnboarding} />
        <Text style={f.label}>Wikipati · 1.0.0</Text>
        <Text style={f.muted}>
          Patili dostların ansiklopedisi ve kişisel bakım günlüğü.
        </Text>
        <Text style={f.small}>
          İçerikler güvenilir kaynaklardan derlenir. Kaynak bağlantıları her
          maddenin içinde gösterilir.
        </Text>
      </SettingsSection>
    </>
  );
}
const f = StyleSheet.create({
  timeInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#CCD9CD",
    borderRadius: 12,
    padding: 12,
    fontSize: 20,
    color: green,
    backgroundColor: "#FAFCF8",
  },
  card: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E3E8DC",
    gap: 12,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.7,
    fontWeight: "700",
    color: "#75856E",
  },
  title: { fontSize: 19, fontWeight: "600", color: green },
  heading: { fontSize: 34, fontWeight: "600", color: green },
  muted: { fontSize: 14, lineHeight: 22, color: "#596758" },
  small: { fontSize: 12, lineHeight: 19, color: "#596758" },
  big: { fontSize: 30, fontWeight: "600", color: green },
  action: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#EEF2E8",
  },
  actionText: { fontSize: 13, fontWeight: "600", color: green },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    padding: 12,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#EDF1E7",
    justifyContent: "center",
  },
  selected: { backgroundColor: green },
  check: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 12 },
  checkText: { flex: 1, fontSize: 14, lineHeight: 22, color: green },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E7ECDF",
    overflow: "hidden",
  },
  fill: { height: 6, backgroundColor: green },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  divider: { height: 1, backgroundColor: "#E6EBE0" },
  label: { fontSize: 15, fontWeight: "600", color: green },
  groupTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "600",
    color: "#6E8068",
    marginTop: 8,
  },
});
