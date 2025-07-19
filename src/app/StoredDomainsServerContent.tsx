import { StoredDomainsContent } from "../ui";
import { DATABASE_TABLES } from "../utils/database.types";
import { createServerClient } from "../utils/supabase/server";

export async function StoredDomainsServerContent() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="flex flex-1 items-center justify-center text-white">Please sign in to view your stored domains.</div>;
  }

  const { data, error } = await supabase
    .from(DATABASE_TABLES.configs)
    .select();

  if (error) {
    return <div className="flex flex-1 items-center justify-center text-white">Error loading stored domains.</div>;
  }

  return <StoredDomainsContent entries={data} />;
} 