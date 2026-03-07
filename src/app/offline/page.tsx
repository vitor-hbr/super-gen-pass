import { HomePageClient } from "../HomePageClient";

export const dynamic = "force-static";

export default function OfflinePage() {
  return <HomePageClient initialEntries={[]} />;
}
