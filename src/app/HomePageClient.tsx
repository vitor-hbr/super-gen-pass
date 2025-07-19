"use client";

import { useAuth } from "../contexts/AuthContext";
import { SinglePasswordGenerator, StoredDomainsContent } from "../ui";
import { useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import { DATABASE_TABLES } from "../utils/database.types";
import useSWR from "swr";

interface HomePageClientProps {
  initialEntries: any[];
}

const fetcher = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(DATABASE_TABLES.configs)
    .select();
  
  if (error) throw error;
  return data;
};


export function HomePageClient({ initialEntries }: HomePageClientProps) {
  const { user, loading } = useAuth();

  const { data: entries, error, mutate: mutateEntries } = useSWR(
    user ? 'stored-domains' : null,
    fetcher,
    {
      fallbackData: initialEntries,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const supabase = createClient();

  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel('stored-domains-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: DATABASE_TABLES.configs,
          },
          () => {
            mutateEntries();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, supabase, mutateEntries]);

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <StoredDomainsContent entries={entries || []} />;
  }

  return (
    <div className="font-sans flex flex-1 flex-col items-center p-4 md:flex-row md:justify-around md:px-12 ">
      <div className="md:mb-48 w-full max-w-[600px] select-none py-6 text-center text-white md:w-2/4 md:text-left">
        <h1 className="animate-gradient-text bg-gradient-to-r from-violet-600 via-slate-300  to-purple-400 bg-clip-text pb-3 font-bold text-transparent duration-1000">
          Super Gen Pass!
        </h1>
        <p>
          A way for you to be more secure, and not have a single point of
          failure while using a password manager. Generate a password for each
          of the domains you need, using a master password.
        </p>
      </div>
      <SinglePasswordGenerator />
    </div>
  );
} 