import Image from "next/image";

export function Footer({ avatar_url }: { avatar_url: string }) {
  return (
    <footer className="text-sm md:text-base fixed bottom-0  flex w-full items-center justify-between bg-gradient-to-t from-black p-6 text-white underline">
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
        <span className="pl-3">Made by Vitor</span>
      </a>

      <a
        href="https://github.com/chriszarate/supergenpass-lib"
        target="_blank"
        rel="noopener noreferrer"
      >
        SuperGenPass library
      </a>
    </footer>
  );
}
