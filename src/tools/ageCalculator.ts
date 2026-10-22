export type Species = "Kedi" | "Köpek";
export type DogSize = "Küçük" | "Orta" | "Büyük";
export type AgeResult = { months: number; stage: string | null; needsIndividualAssessment: boolean };

// Sources:
// Cats: 2021 AAHA/AAFP Feline Life Stage Guidelines
// https://catvets.com/resource/aaha-aafp-feline-life-stage-guidelines/
// Dogs: 2019 AAHA Canine Life Stage Guidelines
// https://www.aaha.org/resources/life-stage-canine/
// AAHA states that later canine stages depend on breed, size and estimated lifespan;
// therefore the function intentionally does not invent a senior-age cutoff.
export function calculateLifeStage(
  species: Species,
  years: number,
  months: number,
  _dogSize?: DogSize,
): AgeResult {
  if (!Number.isInteger(years) || !Number.isInteger(months) || years < 0 || months < 0 || months > 11)
    throw Error("Yaşı yıl ve ay olarak geçerli gir.");
  const total = years * 12 + months;
  if (species === "Kedi") {
    return {
      months: total,
      stage: total < 12 ? "Yavru" : total < 84 ? "Genç yetişkin" : total < 120 ? "Olgun yetişkin" : "İleri yaş",
      needsIndividualAssessment: false,
    };
  }
  if (total <= 9) return { months: total, stage: "Yavru", needsIndividualAssessment: false };
  if (total < 48) return { months: total, stage: "Genç yetişkin", needsIndividualAssessment: false };
  return { months: total, stage: null, needsIndividualAssessment: true };
}
