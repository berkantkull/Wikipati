import { Link } from "expo-router";
import { Text, View } from "react-native";
import { s } from "../src/styles";

export default function NotFoundRoute() {
  return (
    <View style={[s.loading, { gap: 18, padding: 24 }]}>
      <Text accessibilityRole="header" style={s.heading}>Sayfa bulunamadı</Text>
      <Text style={[s.muted, { textAlign: "center" }]}>Aradığın sayfa taşınmış veya bağlantı hatalı olabilir.</Text>
      <Link href="/" accessibilityRole="button" accessibilityLabel="Keşfet'e dön" style={s.button}>
        <Text style={s.buttonText}>Keşfet'e dön</Text>
      </Link>
    </View>
  );
}
