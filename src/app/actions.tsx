"use server";

import { revalidatePath } from "next/cache";

import { PasswordConfigEntry } from "../utils/models";
import { DATABASE_TABLES } from "../utils/database.types";
import { createServerClient } from "../utils/supabase/server";

export async function addNewConfigEntry(data: PasswordConfigEntry) {
    const supabase = await createServerClient();
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
        throw new Error('Unauthorized');
    }

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

    revalidatePath("/");
}

export async function removeConfigEntry(id: string) {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from(DATABASE_TABLES.configs)
        .delete()
        .match({ id, email: user.email });
    revalidatePath("/");
}

export async function updateConfigEntry(data: PasswordConfigEntry) {
    const supabase = await createServerClient();
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
    revalidatePath("/");
}