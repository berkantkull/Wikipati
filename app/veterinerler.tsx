import { router } from "expo-router";
import { NearbyVets } from "../src/NearbyVets";
export default function VetsRoute() {
  return <NearbyVets onClose={() => router.back()} />;
}
