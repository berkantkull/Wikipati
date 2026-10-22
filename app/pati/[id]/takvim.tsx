import { useLocalSearchParams } from "expo-router";
import { WikipatiAppScreen } from "../../../App";

export default function PetCalendarRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WikipatiAppScreen initialTab="calendar" initialPetId={id} />;
}
