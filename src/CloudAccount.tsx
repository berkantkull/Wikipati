import React, { useEffect, useState } from "react";
import { View, Text, TextInput } from "react-native";
import {
  cloud,
  watchCloud,
  uploadCloudBackup,
  listCloudBackups,
  downloadCloudBackup,
} from "./cloud";
import type { Store } from "./data";
import type { Backup } from "./backup";
import { Action } from "./Features";
import { s } from "./styles";
export function CloudAccount({
  store,
  onRestore,
}: {
  store: Store;
  onRestore: (b: Backup) => void;
}) {
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [sent, setSent] = useState(false),
    [user, setUser] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [rows, setRows] = useState<
      { id: string; created_at: string; device_label: string }[]
    >([]);
  useEffect(() => {
    if (!cloud) return;
    let live = true;
    cloud.auth
      .getSession()
      .then(({ data }) => {
        if (live) setUser(data.session?.user.email || "");
      })
      .catch(() => {
        if (live) setMessage("Oturum okunamadı. Yeniden giriş yap.");
      });
    const { data } = cloud.auth.onAuthStateChange((_event, session) => {
      if (live) {
        setUser(session?.user.email || "");
        setRows([]);
      }
    });
    const stop = watchCloud();
    return () => {
      live = false;
      data.subscription.unsubscribe();
      stop();
    };
  }, []);
  async function run(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await work();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "İşlem tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <View
      style={{
        gap: 14,
        padding: 20,
        backgroundColor: "#E8EFE7",
        borderRadius: 22,
      }}
    >
      <Text style={s.sectionTitle}>Hesabım ve bulut yedekleri</Text>
      {!cloud ? (
        <>
          <Text style={s.muted}>
            Bulut yedekleme henüz etkin değil. Kayıtların bu cihazda tutuluyor;
            şimdilik dosya olarak dışa aktarabilirsin.
          </Text>

        </>
      ) : !user ? (
        <>
          <Text style={s.muted}>
            E-posta koduyla giriş yap veya hesap oluştur. Buluta yalnızca
            “Yedekle” dediğinde kayıt gönderilir.
          </Text>
          <TextInput
            accessibilityLabel="Hesap e-postası"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="E-posta adresin"
            style={s.input}
            editable={!sent}
          />
          {!sent ? (
            <Action
              label="Giriş kodu gönder"
              disabled={busy || !email.includes("@")}
              onPress={() =>
                run(async () => {
                  const { error } = await cloud!.auth.signInWithOtp({
                    email: email.trim(),
                  });
                  if (error)
                    throw Error(
                      "Kod gönderilemedi. E-postanı kontrol edip tekrar dene.",
                    );
                  setSent(true);
                  setMessage("E-postandaki giriş kodunu yaz.");
                })
              }
            />
          ) : (
            <>
              <TextInput
                accessibilityLabel="E-posta giriş kodu"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                style={s.input}
                placeholder="Giriş kodu"
              />
              <Action
                label="Kodu doğrula"
                disabled={busy || code.length < 6}
                onPress={() =>
                  run(async () => {
                    const { error } = await cloud!.auth.verifyOtp({
                      email: email.trim(),
                      token: code.trim(),
                      type: "email",
                    });
                    if (error)
                      throw Error(
                        "Kod geçersiz veya süresi dolmuş. Yeni kod iste.",
                      );
                    setCode("");
                    setSent(false);
                  })
                }
              />
              <Action
                label="E-postayı değiştir / yeni kod iste"
                disabled={busy}
                onPress={() => {
                  setSent(false);
                  setCode("");
                }}
              />
            </>
          )}
        </>
      ) : (
        <>
          <Text style={s.cardTitle}>{user}</Text>
          <Text style={s.muted}>
            Profil, sağlık kayıtları, tekrar eden bakımlar ve favoriler
            yedeklenir. Fotoğraf ve belge dosyaları dahil değildir; bunları
            ayrıca sakla.
          </Text>
          <Action
            label="Bu cihazdaki kayıtları buluta yedekle"
            disabled={busy}
            onPress={() =>
              run(async () => {
                const r = await uploadCloudBackup(store);
                setMessage(
                  "Bulut yedeği oluşturuldu: " +
                    new Date(r.created_at).toLocaleString("tr-TR"),
                );
                setRows(await listCloudBackups());
              })
            }
          />
          <Action
            label="Buluttaki yedekleri getir"
            disabled={busy}
            onPress={() =>
              run(async () => {
                const list = await listCloudBackups();
                setRows(list);
                if (!list.length) setMessage("Henüz bulut yedeğin yok.");
              })
            }
          />
          {rows.map((r) => (
            <View
              key={r.id}
              style={{
                paddingVertical: 10,
                gap: 8,
                borderTopWidth: 1,
                borderColor: "#CDDACE",
              }}
            >
              <Text style={s.muted}>
                {new Date(r.created_at).toLocaleString("tr-TR")} ·{" "}
                {r.device_label}
              </Text>
              <Action
                label="Geri yükleme önizlemesi"
                disabled={busy}
                onPress={() =>
                  run(async () => {
                    onRestore(await downloadCloudBackup(r.id));
                  })
                }
              />
            </View>
          ))}
          <Action
            label="Hesaptan çık"
            disabled={busy}
            onPress={() =>
              run(async () => {
                const { error } = await cloud!.auth.signOut({ scope: "local" });
                if (error) throw Error("Çıkış yapılamadı.");
                setUser("");
                setRows([]);
                setMessage("Çıkış yapıldı. Bu cihazdaki kayıtların korundu.");
              })
            }
          />
        </>
      )}
      {!!message && (
        <Text accessibilityRole="alert" style={s.muted}>
          {message}
        </Text>
      )}
    </View>
  );
}
