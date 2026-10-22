import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import type { Pet, Store } from "./data";
import { Action } from "./Features";
import { s, green } from "./styles";
export function Onboarding({
  store,
  onSave,
  onAdd,
  onPermission,
}: {
  store: Store;
  onSave: (s: Store) => Promise<boolean>;
  onAdd: () => void;
  onPermission: () => void;
}) {
  const [needs, setNeeds] = useState<string[]>(store.pets[0]?.needs || []),
    [stage, setStage] = useState(store.pets[0]?.lifeStage || "Yetişkin"),
    [busy, setBusy] = useState(false);
  const pet = store.pets[0];
  async function finish() {
    setBusy(true);
    try {
      await onSave({
        ...store,
        onboardingDone: true,
        pets: store.pets.map((p, i) =>
          i === 0 ? { ...p, needs, lifeStage: stage } : p,
        ),
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <View
      style={{
        backgroundColor: "#E8EFE7",
        padding: 20,
        borderRadius: 22,
        gap: 16,
      }}
    >
      <Text style={s.eyebrow}>
        WİKİPATİ’YE HOŞ GELDİN · {pet ? "2 / 2" : "1 / 2"}
      </Text>
      <Text style={s.sectionTitle}>
        {pet ? `${pet.name} için kişiselleştirelim` : "İlk dostunla başlayalım"}
      </Text>
      <Text style={s.muted}>
        {pet
          ? "Yaşam dönemini ve ilgilendiğin konuları seç. Sana uygun içerikleri gösterelim."
          : "Adını ve türünü gir. Doğum tarihini biliyorsan ekle; diğer bilgileri sonra tamamlayabilirsin."}
      </Text>
      {!pet ? (
        <Action label="İlk patimi ekle" onPress={onAdd} />
      ) : (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {["Yavru", "Yetişkin", "İleri yaş"].map((x) => (
              <Pressable
                key={x}
                onPress={() => setStage(x)}
                accessibilityRole="button"
                accessibilityState={{ selected: stage === x }}
                style={[s.chip, stage === x && s.chipActive]}
              >
                <Text style={[s.chipText, stage === x && { color: "#fff" }]}>
                  {x}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {["Bakım", "Beslenme", "Sağlık", "Davranış"].map((x) => (
              <Pressable
                key={x}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: needs.includes(x) }}
                onPress={() =>
                  setNeeds(
                    needs.includes(x)
                      ? needs.filter((n) => n !== x)
                      : [...needs, x],
                  )
                }
                style={[s.chip, needs.includes(x) && s.chipActive]}
              >
                <Text
                  style={[s.chipText, needs.includes(x) && { color: "#fff" }]}
                >
                  {x}
                </Text>
              </Pressable>
            ))}
          </View>
          <Action label="Bildirimlere izin ver" onPress={onPermission} />
          <Action
            label="Hazırım, başlayalım"
            disabled={busy}
            onPress={finish}
          />
        </>
      )}
      <Action
        label="Şimdilik atla"
        disabled={busy}
        onPress={() => {
          void onSave({ ...store, onboardingDone: true });
        }}
      />
    </View>
  );
}
