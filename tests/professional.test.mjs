import test from "node:test";
import assert from "node:assert/strict";
import { finishCare, nextRoutineDate } from "../src/routines.ts";
import { healthReport } from "../src/healthReport.ts";
import { parseBackup, backupJSON } from "../src/backup.ts";
const pet = {
  id: "p",
  name: "<script>alert(1)</script>",
  species: "Kedi",
  breed: "",
  birthday: "",
  allergies: "A & B",
  needs: ["Bakım"],
  lifeStage: "Yetişkin",
};
const base = () => ({
  pets: [pet],
  entries: [
    {
      id: "e",
      petId: "p",
      title: "Tarama",
      kind: "Bakım",
      date: "2026-10-01",
      notes: "",
      done: false,
      repeatDays: 7,
      file: "local-secret",
      notification: "old",
    },
  ],
  favorites: [],
  preferences: { reminders: true, daysBefore: [1], hour: 9 },
  checklist: {},
  trash: [],
});
test("recurrence skips elapsed slots, keeps history, strips old attachment/notification and is idempotent", () => {
  let s = finishCare(base(), "e", "2026-10-18", "next");
  assert.equal(s.entries.length, 2);
  assert.equal(s.entries[0].completedAt, "2026-10-18");
  assert.equal(s.entries[1].date, "2026-10-22");
  assert.equal(s.entries[1].notification, undefined);
  assert.equal(s.entries[1].file, undefined);
  assert.deepEqual(finishCare(s, "e", "2026-10-18", "again"), s);
  assert.equal(nextRoutineDate("2026-12-31", 1, "2026-12-31"), "2027-01-01");
});
test("PDF escapes untrusted text and isolates the selected pet", () => {
  const html = healthReport(
    pet,
    [
      ...base().entries,
      {
        ...base().entries[0],
        id: "other",
        petId: "other",
        title: "DO NOT INCLUDE",
      },
    ],
    "2026-10-18",
  );
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("DO NOT INCLUDE"));
  assert.ok(!html.includes("local-secret"));
});
test("portable backups retain recurring plans and personalization; invalid recurrence rejected", () => {
  const s = finishCare(base(), "e", "2026-10-18", "next");
  const backup = parseBackup(backupJSON(s));
  assert.equal(backup.entries[1].repeatDays, 7);
  assert.equal(backup.entries[0].completedAt, "2026-10-18");
  assert.deepEqual(backup.pets[0].needs, ["Bakım"]);
  s.entries[0].repeatDays = -1;
  assert.throws(() => backupJSON(s));
});

test("explicit incoming-version restore updates records while preserving local attachments", async () => {
  const { mergeBackup } = await import("../src/backup.ts");
  const current = base();
  const backup = parseBackup(backupJSON(current));
  backup.entries[0].title = "Yeni başlık";
  backup.entries[0].repeatDays = 1;
  assert.equal(mergeBackup(current, backup).entries[0].title, "Tarama");
  const restored = mergeBackup(current, backup, true);
  assert.equal(restored.entries[0].title, "Yeni başlık");
  assert.equal(restored.entries[0].repeatDays, 1);
  assert.equal(restored.entries[0].file, "local-secret");
});
