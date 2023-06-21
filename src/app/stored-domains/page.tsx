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

    return (
        <div className="mx-auto flex flex-col items-center p-8 text-white">
            <h3 className="pb-5">Stored Domains</h3>
            <StoredDomainsContent entries={data} />
        </div>
    );
};

export default StoredDomainsPage;
