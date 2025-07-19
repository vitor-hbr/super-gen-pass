"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Provider } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

export const Header = () => {
    const { user, loading } = useAuth();
    const supabase = createClient();

    const pathname = usePathname();
    const router = useRouter();

    const [authLoading, setAuthLoading] = useState(false);

    const handleSignIn = async (provider: Provider) => {
        setAuthLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/`
                }
            });
            
            if (error) {
                toast.error(`Sign in failed: ${error.message}`);
                setAuthLoading(false);
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
            setAuthLoading(false);
        }
    };

    const handleSignOut = async () => {
        setAuthLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                toast.error(`Sign out failed: ${error.message}`);
            } else {
                router.push('/');
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <header className="sticky top-0 grid w-full grid-cols-[1fr_auto_1fr] items-center bg-gray-900/30 px-5 py-4 text-p-mobile text-white backdrop-blur lg:px-8">
            <div/>
            <strong className="animate-gradient-text bg-gradient-to-r from-violet-600 via-slate-300  to-purple-400 bg-clip-text font-display text-h5-mobile uppercase text-transparent duration-1000 lg:text-h5-desktop">
                SuperGenPass
            </strong>
            {user && (
                <Image
                    src={user.user_metadata.avatar_url}
                    alt="Profile Picture"
                    width={56}
                    height={56}
                    className="w-9 justify-self-end rounded-full lg:w-10"
                    onClick={handleSignOut}
                />
            )}
            <dialog />
            {!user && (
                <button
                    className="flex flex-row justify-self-end rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-slate-900"
                    onClick={() => handleSignIn("google")}
                >
                    Sign In
                </button>
            )}
        </header>
    );
};
