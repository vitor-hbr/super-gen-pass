import Image from "next/image";

export function Footer({ avatar_url }: { avatar_url: string }) {
  return (
    <footer className="text-sm md:text-base sticky bottom-0 flex w-full items-center justify-between gap-2 bg-gradient-to-t from-black p-6 text-white underline">
      <a
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
      </a>

      <nav className="flex gap-2 lg:gap-5">
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
        <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </a>
        <a
          href="https://github.com/chriszarate/supergenpass-lib"
          target="_blank"
          rel="noopener noreferrer"
        >
          SuperGenPass Library
        </a>
      </nav>
    </footer>
  );
}
