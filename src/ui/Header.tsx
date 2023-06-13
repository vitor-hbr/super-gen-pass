"use client";

import { useSession, signIn } from "next-auth/react";
import Image from "next/image";

export const Header = () => {
  const { data } = useSession();
  const userData = data?.user;

  return (
    <header className="text-sm md:text-base sticky top-0 flex w-full items-center justify-end bg-gradient-to-b from-black p-6 text-white underline">
      {userData && (
        <Image
          src={userData.image}
          alt="Profile Picture"
          width={56}
          height={56}
          className="rounded-full"
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
