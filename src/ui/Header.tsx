"use client";

import {
    User,
    createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaStore } from "react-icons/fa";

export const Header = ({ user }: { user: User | null }) => {
    const supabase = createClientComponentClient();

    const pathname = usePathname();
    const router = useRouter();

    const links = [
        {
            name: "Home",
            href: "/",
            icon: FaHome,
        },
        {
            name: "Stored Domains",
            href: "/stored-domains",
            requiresAuth: true,
            icon: FaStore,
        },
    ];

    const handleSignIn = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
        });
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <header className="sticky top-0 grid w-full grid-cols-[1fr_auto_1fr] items-center bg-gray-900/60 px-8 py-4 text-p-mobile text-white backdrop-blur">
            <ul className="flex gap-6">
                {links.map((link) => {
                    if (link.requiresAuth && !user) return null;

                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <li
                            className={`flex items-center gap-2 ${
                                isActive ? "font-semibold" : "font-thin"
                            }`}
                            key={link.href}
                        >
                            <Icon
                                className={`${
                                    isActive ? "text-violet-600" : "text-white"
                                }`}
                            />
                            <Link href={link.href}>{link.name}</Link>
                        </li>
                    );
                })}
            </ul>
            <strong className="animate-gradient-text bg-gradient-to-r from-violet-600 via-slate-300  to-purple-400 bg-clip-text font-display text-h5-desktop uppercase text-transparent duration-1000">
                SuperGenPass
            </strong>
            {user && (
                <Image
                    src={user.user_metadata.avatar_url}
                    alt="Profile Picture"
                    width={56}
                    height={56}
                    className="justify-self-end rounded-full"
                    onClick={handleSignOut}
                />
            )}
            {!user && (
                <button
                    className="flex flex-row justify-self-end rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-slate-900"
                    onClick={handleSignIn}
                >
                    Sign In
                </button>
            )}
        </header>
    );
};
