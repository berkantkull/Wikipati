import React from "react";
import { View, Text, Linking } from "react-native";
import { Action } from "./Features";
import { s } from "./styles";
export function VetMapResults({
  url,
  onSearch,
}: {
  url: string;
  onSearch: () => void;
}) {
  return (
    <View style={{ flex: 1, gap: 12, padding: 16 }}>
      <Action label="Yeni arama" onPress={onSearch} />
      <Text style={s.muted}>
        Telefonda sonuçlar uygulama içinde gösterilir. Web sürümünde Google
        Maps’i açarak klinikleri listeleyebilirsin.
      </Text>
      <Action
        label="Google Maps sonuçlarını aç"
        onPress={() => {
          void Linking.openURL(url);
        }}
      />
    </View>
  );
}
