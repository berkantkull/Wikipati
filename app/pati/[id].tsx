import { useLocalSearchParams } from "expo-router";
import { WikipatiAppScreen } from "../../App";

export default function PetRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WikipatiAppScreen initialTab="pets" initialPetId={id} />;
}
