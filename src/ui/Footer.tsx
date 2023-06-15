import Image from "next/image";
import Link from "next/link";

export function Footer({ avatar_url }: { avatar_url: string }) {
  return (
    <footer className="text-sm md:text-base sticky bottom-0 flex w-full items-center justify-between gap-2 bg-gradient-to-t from-black  px-8 py-4 text-white">
      <Link
        href="https://github.com/vitor-hbr/super-gen-pass"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center"
      >
        <Image
          src={avatar_url}
          alt="My profile picture"
          width={60}
          height={60}
          className="rounded-full"
        />
        <span className="hidden pl-3 lg:block">Made by Vitor</span>
      </Link>

      <nav className="flex gap-2 lg:gap-5">
        <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </Link>
        <Link
          href="/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </Link>
        <Link
          href="https://github.com/chriszarate/supergenpass-lib"
          target="_blank"
          rel="noopener noreferrer"
        >
          SuperGenPass Library
        </Link>
      </nav>
    </footer>
  );
}
