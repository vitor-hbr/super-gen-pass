import Image from "next/image";

export const Footer = ({ avatar_url }) => {
  return (
    <footer className="fixed bottom-0 bg-gradient-to-t from-black  text-white underline text-sm md:text-base w-full flex items-center justify-between p-6">
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
        Supergenpass package
      </a>
    </footer>
  );
};
