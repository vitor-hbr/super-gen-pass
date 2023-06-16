import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { StoredDomainsContent } from "../../ui";
import { DATABASE_TABLES } from "../../utils/textConstants";
import { DialogFormData } from "../../utils/models";
import { revalidatePath } from "next/cache";

async function setup() {
    const session = await getServerSession(authOptions);
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SECRET
    );

    return { session, supabase };
}

const StoredDomainsPage = async () => {
    const { session, supabase } = await setup();

    const { data, error } = await supabase
        .from(DATABASE_TABLES.configs)
        .select();

    async function addNewConfigEntry(data: DialogFormData) {
        "use server";

        const { url, length, forceSpecialCharacter, onlyDomain } = data;

        const { data: configs, error } = await supabase
            .from(DATABASE_TABLES.configs)
            .insert([
                {
                    url,
                    length,
                    forceSpecialCharacter,
                    onlyDomain,
                    email: session.user.email,
                },
            ]);
        revalidatePath("/stored-domains");
    }

    async function removeConfigEntry(url: string) {
        "use server";

        const { data, error } = await supabase
            .from(DATABASE_TABLES.configs)
            .delete()
            .match({ url, email: session.user.email });
        revalidatePath("/stored-domains");
    }

    async function updateConfigEntry(data: DialogFormData) {
        "use server";

        const { url, length, forceSpecialCharacter, onlyDomain } = data;

        const { data: configs, error } = await supabase
            .from(DATABASE_TABLES.configs)
            .update({
                url,
                length,
                forceSpecialCharacter,
                onlyDomain,
            })
            .match({ url, email: session.user.email });
        revalidatePath("/stored-domains");
    }

    if (!session) {
        redirect("/");
    }

    return (
        <div className="mx-auto flex flex-col items-center p-8 text-white">
            <h3 className="pb-5">Stored Domains</h3>
            <StoredDomainsContent
                data={data}
                add={addNewConfigEntry}
                remove={removeConfigEntry}
                update={updateConfigEntry}
            />
        </div>
    );
};

export default StoredDomainsPage;
