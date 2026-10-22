import { useLocalSearchParams } from "expo-router";
import { WikipatiAppScreen } from "../../App";

const value = (item: string | string[] | undefined) =>
  typeof item === "string" ? item : undefined;

export default function LibraryRoute() {
  const params = useLocalSearchParams<{ konu?: string; tur?: string; donem?: string }>();
  return (
    <WikipatiAppScreen
      initialTab="library"
      libraryFilters={{ konu: value(params.konu), tur: value(params.tur), donem: value(params.donem) }}
    />
  );
}
