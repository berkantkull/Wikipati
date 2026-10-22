import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { VetMapResults } from "./VetMapResults";
import { vetMapsUrl } from "./vetMaps";
import { Action } from "./Features";
import { s, green } from "./styles";
export function NearbyVets({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [blocked, setBlocked] = useState(false),
    [area, setArea] = useState("");
  const operation = useRef(0),
    running = useRef(false);
  useEffect(
    () => () => {
      operation.current++;
    },
    [],
  );
  async function locate() {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError("");
    setBlocked(false);
    const id = ++operation.current;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (id !== operation.current) return;
      if (!permission.granted) {
        setBlocked(!permission.canAskAgain);
        throw Error(
          "Konum izni verilmedi. İlçe veya semt yazarak da arayabilirsin.",
        );
      }
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () =>
              reject(
                Error(
                  "Konum alınamadı. Konum servislerini kontrol et veya semt yazarak ara.",
                ),
              ),
            20000,
          );
        }),
      ]);
      if (id === operation.current) setUrl(vetMapsUrl(location.coords));
    } catch (e) {
      if (id === operation.current)
        setError(
          e instanceof Error
            ? e.message
            : "Konum alınamadı. Semt yazarak arayabilirsin.",
        );
    } finally {
      if (timer) clearTimeout(timer);
      if (id === operation.current) {
        running.current = false;
        setBusy(false);
      }
    }
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={[s.header, { gap: 12 }]}>
        <Text style={[s.sectionTitle, { flex: 1 }]}>
          {url ? "Veterinerler" : "Yakınımdaki veterinerler"}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Veteriner aramasını kapat"
          style={s.avatar}
          onPress={onClose}
        >
          <Ionicons name="close" size={24} color={green} />
        </Pressable>
      </View>
      {url ? (
        <>
          <VetMapResults key={url} url={url} onSearch={() => setUrl("")} />
        </>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            s.content,
            { maxWidth: 760, width: "100%", alignSelf: "center" },
          ]}
        >
          <View style={{ gap: 16, paddingVertical: 12 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 22,
                backgroundColor: "#E3EDE5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="medical-outline" size={30} color={green} />
            </View>
            <Text
              style={{
                fontSize: 29,
                fontWeight: "700",
                lineHeight: 35,
                color: green,
              }}
            >
              İhtiyacı olan bakım, hemen yakınında.
            </Text>
            <Text style={s.muted}>
              Yakındaki klinikleri bul, iletişim bilgilerini gör ve yol tarifi al.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={locate}
            style={({ pressed }) => ({
              backgroundColor: green,
              borderRadius: 16,
              minHeight: 56,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: busy || pressed ? 0.65 : 1,
            })}
          >
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
              Konumumla veterinerleri bul
            </Text>
          </Pressable>
          <Text style={s.small}>
            Yaklaşık konumun veya yazdığın semt arama için Google Maps’e
            iletilir. Wikipati konumunu kaydetmez.
          </Text>
          {busy && (
            <View style={{ gap: 12 }}>
              <ActivityIndicator color={green} />
              <Text style={s.muted}>Konumun bulunuyor…</Text>
              <Action
                label="İptal"
                onPress={() => {
                  operation.current++;
                  running.current = false;
                  setBusy(false);
                }}
              />
            </View>
          )}
          {!!error && (
            <Text accessibilityRole="alert" style={s.error}>
              {error}
            </Text>
          )}
          {blocked && Platform.OS !== "web" && (
            <Action
              label="Konum ayarlarını aç"
              onPress={() => {
                void Linking.openSettings().catch(() =>
                  setError("Telefon ayarlarından konum iznini açabilirsin."),
                );
              }}
            />
          )}
          <Text style={s.sectionTitle}>Başka bir bölgede ara</Text>
          <TextInput
            accessibilityLabel="Veteriner aramak için semt veya ilçe"
            placeholder="Örn. Kadıköy, İstanbul"
            value={area}
            onChangeText={setArea}
            style={[s.input, { minHeight: 52 }]}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (area.trim()) setUrl(vetMapsUrl(null, area));
            }}
          />
          <Action
            label="Bu bölgede veteriner bul"
            disabled={!area.trim() || busy}
            onPress={() => setUrl(vetMapsUrl(null, area))}
          />
          <Text style={s.small}>
            Bilgileri Google Maps sağlar. Gitmeden önce kliniği arayarak çalışma
            saatlerini doğrula.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}
