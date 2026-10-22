import { useLocalSearchParams } from "expo-router";
import { LegalScreen } from "../../src/LegalScreen";
export default function LegalRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <LegalScreen slug={slug} />;
}
