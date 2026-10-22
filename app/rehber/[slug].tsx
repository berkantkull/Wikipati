import { useLocalSearchParams } from "expo-router";
import { WikipatiAppScreen } from "../../App";

export default function GuideRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <WikipatiAppScreen initialTab="library" initialArticleSlug={slug} />;
}
