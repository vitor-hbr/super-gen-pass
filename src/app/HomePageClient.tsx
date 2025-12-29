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
  const { data, error } = await supabase.from(DATABASE_TABLES.configs).select();

  if (error) throw error;
  return data;
};

export function HomePageClient({ initialEntries }: HomePageClientProps) {
  const { user, loading } = useAuth();

  const {
    data: entries,
    error,
    mutate: mutateEntries,
  } = useSWR(user ? "stored-domains" : null, fetcher, {
    fallbackData: initialEntries,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const supabase = createClient();

  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel("stored-domains-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: DATABASE_TABLES.configs,
          },
          () => {
            mutateEntries();
          },
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
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <StoredDomainsContent entries={entries || []} />;
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center p-6 font-sans md:flex-row md:gap-12 lg:gap-24">
      <div className="mb-12 flex w-full max-w-[500px] flex-col justify-center text-center md:mb-0 md:text-left">
        <div className="animate-slide-up [animation-duration:1s]">
          <h1 className="font-display animate-gradient-text bg-300% bg-gradient-to-r from-violet-400 via-fuchsia-300 to-violet-400 bg-clip-text pb-4 text-transparent">
            Super Gen Pass
          </h1>
        </div>
        <p className="animate-fade-in text-lg leading-relaxed text-indigo-100/80 [animation-delay:200ms]">
          A smarter way to manage passwords without a single point of failure.
          Generate unique, secure passwords for every domain using just one
          master key.
        </p>
      </div>

      <div className="animate-fade-in [animation-delay:400ms]">
        <SinglePasswordGenerator />
      </div>
    </div>
  );
}
