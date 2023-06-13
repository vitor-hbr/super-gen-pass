"use client";

import { useSession, signIn } from "next-auth/react";
import Image from "next/image";

export const Header = () => {
  const { data } = useSession();
  const userData = data?.user;
  return (
    <header className="flex items-center justify-between bg-gray-800 p-4">
      <h1 className="text-2xl font-bold text-white">Super Gen Pass</h1>
      {userData && (
        <Image
          src={userData.image}
          alt="Profile Picture"
          width={64}
          height={64}
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
