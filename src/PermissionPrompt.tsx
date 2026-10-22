import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { s } from "./styles";

export function PermissionPrompt({
  visible,
  title,
  body,
  blocked = false,
  onAllow,
  onLater,
}: {
  visible: boolean;
  title: string;
  body: string;
  blocked?: boolean;
  onAllow: () => void;
  onLater: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#102C27AA" }}>
        <View style={{ width: "100%", maxWidth: 430, alignSelf: "center", gap: 16, padding: 24, borderRadius: 24, backgroundColor: "#FAFAF6" }}>
          <Text accessibilityRole="header" style={s.sectionTitle}>{title}</Text>
          <Text style={s.muted}>{body}</Text>
          {blocked && <Text accessibilityRole="alert" style={s.error}>Bu izin telefon ayarlarından yönetilmeli.</Text>}
          <Pressable accessibilityRole="button" accessibilityLabel={blocked ? "Telefon ayarlarını aç" : "İzin ver"} onPress={onAllow} style={s.button}>
            <Text style={s.buttonText}>{blocked ? "Ayarları aç" : "İzin ver"}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Şimdi değil" onPress={onLater} style={[s.button, s.secondary]}>
            <Text style={[s.buttonText, { color: "#244E43" }]}>Şimdi değil</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
