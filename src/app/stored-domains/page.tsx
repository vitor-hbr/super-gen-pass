import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { StoredDomainsContent } from "../../ui";
import { DATABASE_TABLES } from "../../utils/database.types";

const StoredDomainsPage = async () => {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from(DATABASE_TABLES.configs)
        .select();

    if (!user) {
        redirect("/");
    }

    return <StoredDomainsContent entries={data} />;
};

export default StoredDomainsPage;
