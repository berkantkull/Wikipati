import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Linking,
  Pressable,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { s, green } from "./styles";
export function VetMapResults({
  url,
  onSearch,
}: {
  url: string;
  onSearch: () => void;
}) {
  const view = useRef<WebView>(null);
  const [failed, setFailed] = useState(false),
    [back, setBack] = useState(false);
  const open = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      setFailed(true);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      {failed && (
        <Text accessibilityRole="alert" style={[s.error, { padding: 16 }]}>
          Harita yüklenemedi. Bağlantını kontrol edip Yenile’ye dokunabilir veya
          Maps’te açabilirsin.
        </Text>
      )}
      <WebView
        ref={view}
        source={{ uri: url }}
        style={{ flex: 1 }}
        startInLoadingState
        renderLoading={() => (
          <View style={{ padding: 24 }}>
            <ActivityIndicator color={green} />
            <Text style={s.muted}>Google Maps sonuçları yükleniyor…</Text>
          </View>
        )}
        onError={() => setFailed(true)}
        onHttpError={({ nativeEvent }) => {
          if (nativeEvent.statusCode >= 400) setFailed(true);
        }}
        onNavigationStateChange={(state) => setBack(state.canGoBack)}
        geolocationEnabled={false}
        javaScriptCanOpenWindowsAutomatically={false}
        onShouldStartLoadWithRequest={({ url: next }) => {
          if (next === "about:blank" || next.startsWith("https://"))
            return true;
          if (/^(tel:|mailto:|comgooglemaps:|maps:)/i.test(next))
            void open(next);
          return false;
        }}
        onOpenWindow={({ nativeEvent }) => {
          if (nativeEvent.targetUrl.startsWith("https://"))
            void open(nativeEvent.targetUrl);
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          borderTopWidth: 1,
          borderColor: "#E2E7E0",
          backgroundColor: "#F7F9F5",
          paddingVertical: 4,
        }}
      >
        {[
          {
            icon: "arrow-back",
            label: "Geri",
            disabled: !back,
            action: () => view.current?.goBack(),
          },
          { icon: "search-outline", label: "Yeni arama", action: onSearch },
          {
            icon: "refresh-outline",
            label: "Yenile",
            action: () => {
              setFailed(false);
              view.current?.reload();
            },
          },
          {
            icon: "open-outline",
            label: "Maps’te aç",
            action: () => open(url),
          },
        ].map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            disabled={item.disabled}
            onPress={item.action}
            style={({ pressed }) => ({
              minWidth: 64,
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              opacity: item.disabled ? 0.3 : pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name={item.icon as any} size={21} color={green} />
            <Text style={{ fontSize: 11, color: green }}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
