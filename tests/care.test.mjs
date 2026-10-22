import test from "node:test";
import assert from "node:assert/strict";
import {
  reminderDate,
  weightPoints,
  removePet,
  removeEntry,
  restoreItem,
  normalizeStore,
} from "../src/care.ts";
const pet = {
  id: "p1",
  name: "Pamuk",
  species: "Kedi",
  breed: "",
  birthday: "",
  allergies: "",
};
const entry = {
  id: "e1",
  petId: "p1",
  title: "Kontrol",
  kind: "Kontrol",
  date: "2026-10-01",
  notes: "",
  done: false,
};
const base = () =>
  normalizeStore({ pets: [pet], entries: [entry], favorites: ["1"] });
test("legacy records migrate without losing data", () => {
  const s = base();
  assert.deepEqual(s.pets, [pet]);
  assert.equal(s.preferences.hour, 9);
  assert.deepEqual(s.checklist, {});
  assert.deepEqual(s.trash, []);
});
test("deleting and restoring a pet preserves associated records and checklist", () => {
  const s = base();
  s.checklist.p1 = ["water"];
  const deleted = removePet(s, "p1");
  assert.equal(deleted.pets.length, 0);
  assert.equal(deleted.entries.length, 0);
  const restored = restoreItem(deleted, "pet-p1");
  assert.deepEqual(restored.entries, [entry]);
  assert.deepEqual(restored.checklist.p1, ["water"]);
  assert.equal(restored.trash.length, 0);
});
test("restoring an entry requires its parent and does not duplicate records", () => {
  let s = removeEntry(base(), "e1");
  s = removePet(s, "p1");
  assert.throws(() => restoreItem(s, "entry-e1"));
  s = restoreItem(s, "pet-p1");
  s = restoreItem(s, "entry-e1");
  assert.equal(restoreItem(s, "entry-e1").entries.length, 1);
});
test("reminders schedule only selected future days", () => {
  const prefs = { reminders: true, daysBefore: 3, hour: 18 };
  assert.equal(
    reminderDate(
      "2026-10-10",
      prefs,
      new Date("2026-10-01T00:00:00"),
    ).getDate(),
    7,
  );
  assert.equal(
    reminderDate(
      "2026-10-10",
      {...prefs,daysBefore:[0,3]},
      new Date("2026-10-09T00:00:00"),
    ).getDate(),
    10,
  );
  assert.equal(
    reminderDate("2026-10-10", prefs, new Date("2026-10-10T19:00:00")),
    null,
  );
});
test("weight history isolates pets, orders chronologically and ignores invalid measurements", () => {
  const entries = [
    { ...entry, id: "2", kind: "Kilo", weight: 4, date: "2026-09-02" },
    { ...entry, id: "1", kind: "Kilo", weight: 3.8, date: "2026-09-01" },
    { ...entry, id: "3", kind: "Kilo", weight: 5, petId: "other" },
    { ...entry, id: "4", kind: "Kilo", weight: -1 },
  ];
  assert.deepEqual(
    weightPoints(entries, "p1").map((e) => e.weight),
    [3.8, 4],
  );
});
