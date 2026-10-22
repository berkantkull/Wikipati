import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { reminderDates, selectedDays, normalizeStore } from "../src/care.ts";
function harness({ granted = true, canAskAgain = true, fail = false } = {}) {
  const scheduled = new Map(),
    calls = [];
  const api = {
    IosAuthorizationStatus: { PROVISIONAL: 3 },
    AndroidImportance: { HIGH: 4 },
    SchedulableTriggerInputTypes: {
      DATE: "date",
      TIME_INTERVAL: "timeInterval",
    },
    setNotificationHandler: () => {},
    getPermissionsAsync: async () => ({ granted, canAskAgain }),
    requestPermissionsAsync: async () => {
      calls.push("permission");
      granted = true;
    },
    setNotificationChannelAsync: async () => calls.push("channel"),
    getAllScheduledNotificationsAsync: async () => [...scheduled.values()],
    cancelScheduledNotificationAsync: async (id) => {
      scheduled.delete(id);
    },
    scheduleNotificationAsync: async (n) => {
      if (fail) throw Error();
      scheduled.set(n.identifier, n);
      return n.identifier;
    },
  };
  const module = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync(
      new URL("../src/notifications.ts", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const context = {
    module,
    exports: module.exports,
    require: (name) =>
      name === "react-native"
        ? {
            Platform: { OS: "android" },
            Linking: { openSettings: async () => calls.push("settings") },
          }
        : name === "expo-notifications"
          ? api
          : name === "./care"
            ? { reminderDates, selectedDays }
            : null,
  };
  vm.runInNewContext(code, context);
  return { api: module.exports, scheduled, calls };
}
const store = () =>
  normalizeStore({
    pets: [{ id: "p", name: "Pamuk" }],
    entries: [
      {
        id: "e",
        petId: "p",
        title: "Kontrol",
        kind: "Kontrol",
        date: "2099-10-10",
        done: false,
      },
    ],
    favorites: [],
  });
test("permission channel is created before request and denied permission opens settings", async () => {
  const a = harness({ granted: false });
  await a.api.requestPermission();
  assert.deepEqual(a.calls, ["channel", "permission"]);
  const b = harness({ granted: false, canAskAgain: false });
  await b.api.requestPermission();
  assert.deepEqual(b.calls, ["channel", "settings"]);
});
test("test notification is a real native scheduling request with five second delay", async () => {
  const h = harness();
  await h.api.testNotification();
  assert.equal(h.scheduled.get("wikipati-test").trigger.seconds, 5);
});
test("reconciliation updates rather than duplicates and cancels completed/deleted reminders", async () => {
  const h = harness();
  let s = await h.api.syncNotifications(store());
  s = await h.api.syncNotifications(s);
  assert.equal(h.scheduled.size, 1);
  s.entries[0].done = true;
  await h.api.syncNotifications(s);
  assert.equal(h.scheduled.size, 0);
  s.entries[0].done = false;
  await h.api.syncNotifications(s);
  s.entries = [];
  await h.api.syncNotifications(s);
  assert.equal(h.scheduled.size, 0);
});
test("denial, disable and native failure never report successful scheduling", async () => {
  let h = harness({ granted: false });
  let s = await h.api.syncNotifications(store());
  assert.match(s.entries[0].notificationState, /izni/);
  assert.equal(h.scheduled.size, 0);
  h = harness();
  s = store();
  await h.api.syncNotifications(s);
  s.preferences.reminders = false;
  await h.api.syncNotifications(s);
  assert.equal(h.scheduled.size, 0);
  h = harness({ fail: true });
  s = await h.api.syncNotifications(store());
  assert.match(s.entries[0].notificationState, /yeniden dene/);
});

test("multiple days schedule independently, custom minutes persist and deselection cancels", async () => {
  const h = harness();
  let s = store();
  s.preferences = {
    reminders: true,
    daysBefore: [0, 1, 3],
    hour: 14,
    minute: 35,
  };
  s = await h.api.syncNotifications(s);
  assert.equal(h.scheduled.size, 3);
  for (const item of h.scheduled.values()) {
    assert.equal(item.trigger.date.getHours(), 14);
    assert.equal(item.trigger.date.getMinutes(), 35);
    assert.equal(item.content.data.targetRoute, "/pati/p/takvim");
    assert.match(item.content.title, /Pamuk/);
  }
  s.preferences.daysBefore = [0];
  s = await h.api.syncNotifications(s);
  assert.equal(h.scheduled.size, 1);
  s.preferences.daysBefore = [];
  await h.api.syncNotifications(s);
  assert.equal(h.scheduled.size, 0);
});
