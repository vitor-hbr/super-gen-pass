import { HomePageClient } from "./HomePageClient";
import { DATABASE_TABLES } from "../utils/database.types";
import { createServerClient } from "../utils/supabase/server";

export default async function Page() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialEntries: any[] = [];
  if (user) {
    const { data, error } = await supabase
      .from(DATABASE_TABLES.configs)
      .select();
    
    if (!error) {
      initialEntries = data;
    }
  }

  return <HomePageClient initialEntries={initialEntries} />;
}
