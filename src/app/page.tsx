import { HomePageClient } from "./HomePageClient";
import { DATABASE_TABLES } from "../utils/database.types";
import { PasswordConfigEntry } from "../utils/models";
import { createServerClient } from "../utils/supabase/server";

export default async function Page() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialEntries: PasswordConfigEntry[] = [];
  if (user) {
    const { data, error } = await supabase
      .from(DATABASE_TABLES.configs)
      .select();

    if (!error && data) {
      initialEntries = data as PasswordConfigEntry[];
    }
  }

  return <HomePageClient initialEntries={initialEntries} />;
}
