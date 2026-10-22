import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { s, green } from "./styles";

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <View style={[s.root, s.loading, { gap: 18 }]}>
      <Ionicons name="refresh-circle-outline" size={48} color={green} />
      <Text accessibilityRole="header" style={s.sectionTitle}>Bir sorun oluştu</Text>
      <Text style={[s.muted, { textAlign: "center", maxWidth: 340 }]}>Ekran yüklenemedi. Yeniden deneyebilirsin; bu işlem cihazındaki kayıtları silmez.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Uygulamayı yeniden dene" onPress={() => this.setState({ failed: false })} style={s.button}>
        <Text style={s.buttonText}>Yeniden dene</Text>
      </Pressable>
    </View>;
  }
}
