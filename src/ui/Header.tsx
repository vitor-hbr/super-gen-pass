"use client";

import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const { data } = useSession();
  const pathname = usePathname();

  const userData = data?.user;

  const links = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Stored Domains",
      href: "/stored-domains",
      requiresAuth: true,
    },
  ];

  return (
    <header className="text-sm md:text-base sticky top-0 grid w-full grid-cols-[1fr_auto_1fr] items-center bg-gray-950 px-8 py-4 text-white">
      <ul className="flex gap-6">
        {links.map((link) => {
          if (link.requiresAuth && !userData) return null;

          const isActive = pathname === link.href;
          return (
            <li className={isActive ? "font-bold" : ""}>
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
          className=" justify-self-end rounded-full"
        />
      )}
      {!userData && (
        <button className="btn btn-primary" onClick={() => signIn()}>
          Sign In
        </button>
      )}
    </header>
  );
};
