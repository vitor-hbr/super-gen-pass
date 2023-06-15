"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaStore } from "react-icons/fa";

export const Header = () => {
  const { data } = useSession();
  const pathname = usePathname();

  const userData = data?.user;

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

  return (
    <header className="text-sm md:text-base sticky top-0 grid w-full grid-cols-[1fr_auto_1fr] items-center bg-gray-950 px-8 py-4 text-white">
      <ul className="flex gap-6">
        {links.map((link) => {
          if (link.requiresAuth && !userData) return null;

          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <li
              className={`flex items-center gap-2 ${
                isActive ? "font-semibold" : "font-thin"
              }`}
            >
              <Icon
                className={`${isActive ? "text-violet-600" : "text-white"}`}
              />
              <Link href={link.href}>{link.name}</Link>
            </li>
          );
        })}
      </ul>
      <strong className="animate-gradient-text bg-gradient-to-r from-violet-600 via-slate-300  to-purple-400 bg-clip-text font-display text-h5-desktop uppercase text-transparent duration-1000">
        SuperGenPass
      </strong>
      {userData && (
        <Image
          src={userData.image}
          alt="Profile Picture"
          width={56}
          height={56}
          className="justify-self-end rounded-full"
          onClick={() => signOut()}
        />
      )}
      {!userData && (
        <button
          className="flex flex-row justify-self-end rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-slate-900"
          onClick={() => signIn()}
        >
          Sign In
        </button>
      )}
    </header>
  );
};
