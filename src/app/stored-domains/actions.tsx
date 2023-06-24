"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { PasswordConfigEntry } from "../../utils/models";
import { DATABASE_TABLES } from "../../utils/database.types";
import { ActionType } from "../../utils/constants";

export async function addNewConfigEntry(data: PasswordConfigEntry) {
    "use server";
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { url, length, forceSpecialCharacter, onlyDomain } = data;

    const { data: configs, error } = await supabase
        .from(DATABASE_TABLES.configs)
        .insert([
            {
                url,
                length,
                forceSpecialCharacter,
                onlyDomain,
                email: user.email,
            },
        ]);

    revalidatePath("/stored-domains");
}

export async function removeConfigEntry(id: string) {
    "use server";
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from(DATABASE_TABLES.configs)
        .delete()
        .match({ id, email: user.email });
    revalidatePath("/stored-domains");
}

export async function updateConfigEntry(data: PasswordConfigEntry) {
    "use server";
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { id, url, length, forceSpecialCharacter, onlyDomain } = data;

    const { data: configs, error } = await supabase
        .from(DATABASE_TABLES.configs)
        .update({
            url,
            length,
            forceSpecialCharacter,
            onlyDomain,
        })
        .match({ id, email: user.email });
    revalidatePath("/stored-domains");
}

export async function onDialogSubmit(
    dialogMode: ActionType.add | ActionType.edit,
    dialogState: PasswordConfigEntry
) {
    "use server";
    if (dialogMode === ActionType.add) {
        await addNewConfigEntry(dialogState);
    } else {
        await updateConfigEntry(dialogState);
    }
}
