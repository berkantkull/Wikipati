import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { legalDocuments } from "./content/legal";
import { green, s } from "./styles";

export function LegalScreen({ slug }: { slug: string }) {
  const document = legalDocuments.find((item) => item.slug === slug);
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Önceki sayfaya dön" onPress={() => router.back()} style={s.avatar}><Ionicons name="arrow-back" size={22} color={green} /></Pressable>
        <Text accessibilityRole="header" style={[s.sectionTitle, { flex: 1 }]}>{document?.title || "Sayfa bulunamadı"}</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {document?.sections.map(([title, body]) => <View key={title} style={{ gap: 8 }}><Text accessibilityRole="header" style={s.sectionTitle}>{title}</Text><Text style={s.muted}>{body}</Text></View>)}
        <Text style={s.footnote}>TASLAK – hukuki inceleme gerekli</Text>
      </ScrollView>
    </View>
  );
}
