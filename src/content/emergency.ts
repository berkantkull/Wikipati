export type EmergencyItem = {
  id: string;
  title: string;
  summary: string;
  source: { title: string; url: string; publisher: string };
  visible: boolean;
};

// TODO: kaynak ve veteriner onayı gerekli. Onaylanana kadar kullanıcıya gösterilmez.
export const emergencyItems: EmergencyItem[] = [
  { id: "todo-1", title: "TODO: kaynak ve veteriner onayı gerekli", summary: "TODO: kaynak ve veteriner onayı gerekli", source: { title: "TODO", url: "https://example.invalid", publisher: "TODO" }, visible: false },
  { id: "todo-2", title: "TODO: kaynak ve veteriner onayı gerekli", summary: "TODO: kaynak ve veteriner onayı gerekli", source: { title: "TODO", url: "https://example.invalid", publisher: "TODO" }, visible: false },
];
