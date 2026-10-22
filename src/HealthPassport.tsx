import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { Pet, Entry } from "./data";
import { today } from "./data";
import { healthReport } from "./healthReport";
import { Action } from "./Features";
import { s, green } from "./styles";
export function HealthPassport({
  pet,
  entries,
  onFile,
}: {
  pet: Pet;
  entries: Entry[];
  onFile: (e: Entry) => void;
}) {
  const [filter, setFilter] = useState("Tümü"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const rows = entries
    .filter(
      (e) =>
        e.petId === pet.id &&
        (filter === "Tümü" ||
          (filter === "Belgeler" ? !!e.file : e.kind === filter)),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  async function share() {
    setBusy(true);
    setError("");
    try {
      const html = healthReport(pet, entries, today());
      if (Platform.OS === "web") {
        const win = window.open("", "_blank");
        if (!win) throw Error("Özeti açmak için açılır pencereye izin ver.");
        win.document.write(html);
        win.document.close();
        win.focus();
        win.print();
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync())
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            UTI: ".pdf",
            dialogTitle: "Sağlık karnesini paylaş",
          });
        else await Print.printAsync({ uri });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: 16 }}>
      <View style={s.note}>
        <Text style={[s.muted, { flex: 1 }]}>
          Aşılar, ilaçlar, ölçümler ve belgeler tek zaman çizelgesinde.
        </Text>
      </View>
      <Action
        label={busy ? "PDF hazırlanıyor…" : "Sağlık karnesini PDF olarak paylaş"}
        disabled={busy}
        onPress={share}
      />
      {!!error && <Text style={s.error}>{error}</Text>}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {["Tümü", "Aşı", "İlaç", "Kontrol", "Kilo", "Belgeler"].map((x) => (
          <Pressable
            key={x}
            accessibilityRole="button"
            accessibilityLabel={`${x} sağlık kayıtlarını göster`}
            accessibilityState={{ selected: filter === x }}
            onPress={() => setFilter(x)}
            style={[s.chip, filter === x && s.chipActive]}
          >
            <Text style={[s.chipText, filter === x && { color: "#fff" }]}>
              {x}
            </Text>
          </Pressable>
        ))}
      </View>
      {!rows.length && (
        <Text style={s.muted}>
          Bu bölümde kayıt yok. Yeni kayıt ekleyerek dostunun sağlık karnesini oluşturmaya başla.
        </Text>
      )}
      {rows.map((e) => (
        <View
          key={e.id}
          style={{
            borderLeftWidth: 3,
            borderLeftColor: green,
            paddingLeft: 16,
            gap: 6,
            paddingVertical: 8,
          }}
        >
          <Text style={s.small}>
            {e.date} · {e.kind} ·{" "}
            {e.done
              ? "Tamamlandı"
              : e.date < today()
                ? "Tarihi geçti"
                : "Planlı"}
          </Text>
          <Text style={s.cardTitle}>
            {e.title}
            {e.weight ? ` · ${e.weight} kg` : ""}
          </Text>
          {!!e.notes && <Text style={s.muted}>{e.notes}</Text>}
          {e.completedAt && (
            <Text style={s.small}>Tamamlandı: {e.completedAt}</Text>
          )}
          {e.file && (
            <Action
              label={e.fileName || "Belgeyi aç"}
              onPress={() => onFile(e)}
            />
          )}
        </View>
      ))}
    </View>
  );
}
