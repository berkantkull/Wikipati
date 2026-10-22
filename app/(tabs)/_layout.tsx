import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Pressable, type PressableProps } from "react-native";

const green = "#244E43";
function TabButton({ accessibilityState, accessibilityLabel, ...props }: PressableProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel || "Sekme"}
      accessibilityState={{ selected: !!accessibilityState?.selected }}
      hitSlop={4}
      style={[{ minWidth: 44, minHeight: 44 }, props.style as object]}
    />
  );
}

export default function TabLayout() {
  const screens = [
    ["index", "Keşfet", "compass-outline"],
    ["kutuphane", "Kütüphane", "book-outline"],
    ["patilerim", "Patilerim", "paw-outline"],
    ["takvim", "Takvim", "calendar-outline"],
    ["ayarlar", "Ayarlar", "settings-outline"],
  ] as const;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: green,
        tabBarInactiveTintColor: "#69736D",
        tabBarStyle: { minHeight: 68, paddingTop: 7, paddingBottom: 8, backgroundColor: "#F7F9F5" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      {screens.map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarAccessibilityLabel: `${title} sekmesi`,
            tabBarButton: (props) => <TabButton {...props} />,
            tabBarIcon: ({ color, size }) => <Ionicons name={icon} color={color} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
