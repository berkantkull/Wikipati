import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { Pet } from "./data";
import { emergencyItems } from "./content/emergency";
import { searchToxicity, type ToxicityStatus } from "./content/toxicity";
import { calculateLifeStage, type DogSize, type Species } from "./tools/ageCalculator";
import { green, s } from "./styles";

function ToolShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Önceki sayfaya dön" onPress={() => router.back()} style={s.avatar}>
          <Ionicons name="arrow-back" size={22} color={green} />
        </Pressable>
        <Text accessibilityRole="header" style={[s.sectionTitle, { flex: 1 }]}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>{children}</ScrollView>
    </View>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label} seç`} accessibilityState={{ selected }} onPress={onPress} style={[s.chip, selected && s.chipActive]}>
      <Text style={[s.chipText, selected && { color: "white" }]}>{label}</Text>
    </Pressable>
  );
}

export function AgeCalculatorScreen() {
  const [species, setSpecies] = useState<Species>("Kedi");
  const [dogSize, setDogSize] = useState<DogSize>("Orta");
  const [years, setYears] = useState("0");
  const [months, setMonths] = useState("0");
  const [pets, setPets] = useState<Pet[]>([]);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    void AsyncStorage.getItem("wikipati.v1").then((raw) => {
      const list = raw ? JSON.parse(raw)?.pets : [];
      if (Array.isArray(list)) setPets(list);
    }).catch(() => {});
  }, []);
  const result = useMemo(() => {
    if (!submitted) return null;
    try {
      return calculateLifeStage(species, Number(years), Number(months), dogSize);
    } catch {
      return "error" as const;
    }
  }, [submitted, species, dogSize, years, months]);
  function selectPet(pet: Pet) {
    setSpecies(pet.species === "Köpek" ? "Köpek" : "Kedi");
    if (pet.birthday) {
      const birth = new Date(`${pet.birthday}T12:00:00`), now = new Date();
      let total = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
      if (now.getDate() < birth.getDate()) total--;
      total = Math.max(0, total);
      setYears(String(Math.floor(total / 12)));
      setMonths(String(total % 12));
    }
    setSubmitted(false);
  }
  return (
    <ToolShell title="Yaş ve yaşam dönemi">
      <Text style={s.subtitle}>Patinin yaşını gir; kaynaklı yaşam dönemi aralığını birlikte bulalım.</Text>
      {!!pets.length && <View style={s.note}>
        <Text style={s.cardTitle}>Patilerimden seç</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{pets.map((pet) => <Choice key={pet.id} label={pet.name} selected={false} onPress={() => selectPet(pet)} />)}</View>
      </View>}
      <Text style={s.label}>Tür</Text>
      <View style={{ flexDirection: "row", gap: 8 }}><Choice label="Kedi" selected={species === "Kedi"} onPress={() => { setSpecies("Kedi"); setSubmitted(false); }} /><Choice label="Köpek" selected={species === "Köpek"} onPress={() => { setSpecies("Köpek"); setSubmitted(false); }} /></View>
      {species === "Köpek" && <><Text style={s.label}>Boyut</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{(["Küçük", "Orta", "Büyük"] as DogSize[]).map((size) => <Choice key={size} label={size} selected={dogSize === size} onPress={() => { setDogSize(size); setSubmitted(false); }} />)}</View></>}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, gap: 8 }}><Text style={s.label}>Yıl</Text><TextInput accessibilityLabel="Yaş, yıl" value={years} onChangeText={(value) => { setYears(value); setSubmitted(false); }} keyboardType="number-pad" style={s.input} /></View>
        <View style={{ flex: 1, gap: 8 }}><Text style={s.label}>Ay</Text><TextInput accessibilityLabel="Yaş, ay" value={months} onChangeText={(value) => { setMonths(value); setSubmitted(false); }} keyboardType="number-pad" style={s.input} /></View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Yaşam dönemini hesapla" onPress={() => setSubmitted(true)} style={s.button}><Text style={s.buttonText}>Hesapla</Text></Pressable>
      {result === "error" && <Text accessibilityRole="alert" style={s.error}>Yaşı yıl ve ay olarak geçerli gir.</Text>}
      {result && result !== "error" && <View style={s.note}>
        <Text accessibilityRole="header" style={s.sectionTitle}>{result.stage || "Bireysel değerlendirme gerekli"}</Text>
        <Text style={s.muted}>{result.needsIndividualAssessment ? "Köpeklerde bu yaşam dönemi ırk, boyut ve beklenen yaşam süresine göre değişir. Kesin bir sonuç göstermiyoruz; veterinerine danış." : "Bu sonuç genel yaşam dönemi aralığıdır; kişisel sağlık değerlendirmesi değildir."}</Text>
        <Link href={{ pathname: "/kutuphane", params: { tur: species, donem: result.stage || "Tümü" } }} accessibilityRole="button" accessibilityLabel="İlgili rehberleri aç" style={s.link}>İlgili rehberleri gör →</Link>
      </View>}
      <Text style={s.footnote}>Kaynak: 2021 AAHA/AAFP Feline Life Stage Guidelines ve 2019 AAHA Canine Life Stage Guidelines.</Text>
    </ToolShell>
  );
}

export function EmergencyScreen() {
  const items = emergencyItems.filter((item) => item.visible);
  return (
    <ToolShell title="Acil belirtiler">
      <Link href="/veterinerler" accessibilityRole="button" accessibilityLabel="Yakınımdaki veterinerleri bul" style={s.button}><Text style={s.buttonText}>Yakınımdaki veterinerler</Text></Link>
      {!items.length && <View style={s.note}><Text style={s.muted}>Emin değilsen veterinerine danış.</Text></View>}
      <Link href="/veterinerler" accessibilityRole="button" accessibilityLabel="Şehir veya ilçeyle veteriner ara" style={s.link}>Şehir veya ilçeyle veteriner ara</Link>
    </ToolShell>
  );
}

const statusMeta: Record<ToxicityStatus, { label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; color: string }> = {
  guvenli: { label: "Güvenli", icon: "checkmark-circle", color: "#2F6B50" },
  dikkat: { label: "Dikkat", icon: "alert-circle", color: "#8C623A" },
  tehlikeli: { label: "Tehlikeli", icon: "warning", color: "#A34838" },
  bilinmiyor: { label: "Bilinmiyor", icon: "help-circle", color: "#596758" },
};
export function ToxicityScreen() {
  const [query, setQuery] = useState("");
  const results = searchToxicity(query);
  return (
    <ToolShell title="Zehirli mi?">
      <TextInput accessibilityLabel="Yiyecek, bitki, ilaç veya kimyasal ara" placeholder="Bir madde ara" value={query} onChangeText={setQuery} style={s.input} />
      {!!query && !results.length && <View style={s.note}><Text style={s.cardTitle}>Bu konuda bilgimiz yok</Text><Text style={s.muted}>Emin değilsen veterinerine danış.</Text><Link href="/veterinerler" accessibilityRole="button" accessibilityLabel="Veteriner bul" style={s.link}>Veteriner bul →</Link></View>}
      {results.map((item) => <View key={item.id} style={s.record}>
        <View style={{ flex: 1, gap: 8 }}><Text style={s.cardTitle}>{item.names[0]}</Text><Text style={s.muted}>{item.summary}</Text>{(["cat", "dog"] as const).map((kind) => { const meta = statusMeta[item.species[kind]]; return <View key={kind} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><Ionicons name={meta.icon} color={meta.color} size={20} /><Text style={{ color: meta.color }}>{kind === "cat" ? "Kedi" : "Köpek"}: {meta.label}</Text></View>; })}</View>
      </View>)}
    </ToolShell>
  );
}
