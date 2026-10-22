import React, { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { parseDate, today } from "./data";
import { s, green } from "./styles";

// An inline calendar keeps the keyboard and nested modal out of date selection.
export function DateField({
  label,
  value,
  onChange,
  error,
  pastOnly = false,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  pastOnly?: boolean;
  optional?: boolean;
}) {
  const initial = parseDate(value) || new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(initial.getMonth());
  const [year, setYear] = useState(String(initial.getFullYear()));
  const y = Number(year),
    validYear = /^\d{4}$/.test(year) && y >= 1900 && y <= 2100;
  const first = validYear ? (new Date(y, month, 1).getDay() + 6) % 7 : 0;
  const days = validYear ? new Date(y, month + 1, 0).getDate() : 0;
  const months = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  function move(delta: number) {
    const next = new Date(y, month + delta, 1);
    if (next.getFullYear() < 1900 || next.getFullYear() > 2100) return;
    setMonth(next.getMonth());
    setYear(String(next.getFullYear()));
  }
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        onPress={() => {
          setOpen(!open);
          if (!open) {
            const d = parseDate(value) || new Date();
            setYear(String(d.getFullYear()));
            setMonth(d.getMonth());
          }
        }}
        style={[
          s.input,
          { flexDirection: "row", alignItems: "center", gap: 12 },
          error ? { borderColor: "#AF493D" } : {},
        ]}
      >
        <Ionicons name="calendar-outline" size={22} color={green} />
        <Text style={{ flex: 1, color: green, fontSize: 15 }}>
          {parseDate(value)?.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }) || "Tarih seç"}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={green}
        />
      </Pressable>
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {open && (
        <View
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#DCE5DD",
            borderRadius: 18,
            padding: 10,
            gap: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Önceki ay"
              disabled={!validYear}
              onPress={() => move(-1)}
              style={s.avatar}
            >
              <Ionicons name="chevron-back" size={20} color={green} />
            </Pressable>
            <Text style={s.label}>{months[month]}</Text>
            <TextInput
              accessibilityLabel="Takvim yılı"
              value={year}
              onChangeText={setYear}
              maxLength={4}
              keyboardType="number-pad"
              selectTextOnFocus
              style={[s.input, { width: 78, padding: 10 }]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sonraki ay"
              disabled={!validYear}
              onPress={() => move(1)}
              style={s.avatar}
            >
              <Ionicons name="chevron-forward" size={20} color={green} />
            </Pressable>
          </View>
          {!validYear && (
            <Text style={s.error}>1900–2100 arasında bir yıl yaz.</Text>
          )}
          <View style={{ flexDirection: "row" }}>
            {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"].map((d) => (
              <Text
                key={d}
                style={[s.small, { width: "14.285%", textAlign: "center" }]}
              >
                {d}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {Array.from({ length: first + days }, (_, i) => {
              const day = i - first + 1,
                date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const disabled = day < 1 || (pastOnly && date > today());
              if (day < 1)
                return (
                  <View key={i} style={{ width: "14.285%", minHeight: 44 }} />
                );
              return (
                <View key={i} style={{ width: "14.285%", padding: 1 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${day} ${months[month]} ${year}`}
                    accessibilityState={{ selected: value === date, disabled }}
                    disabled={disabled}
                    onPress={() => {
                      onChange(date);
                      setOpen(false);
                    }}
                    style={{
                      minHeight: 44,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                      backgroundColor: value === date ? green : "transparent",
                      opacity: disabled ? 0.3 : 1,
                    }}
                  >
                    <Text style={{ color: value === date ? "white" : green }}>
                      {day > 0 ? day : ""}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bugünün tarihini seç"
              onPress={() => {
                onChange(today());
                setOpen(false);
              }}
              style={s.inline}
            >
              <Text style={s.link}>Bugün</Text>
            </Pressable>
            {optional && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Seçili tarihi kaldır"
                onPress={() => {
                  onChange("");
                  setOpen(false);
                }}
                style={s.inline}
              >
                <Text style={s.link}>Tarihi kaldır</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
