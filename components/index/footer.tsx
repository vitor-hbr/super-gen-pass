import Image from "next/image";

export const Footer = () => {
  return (
    <footer>
      <a
        href="https://github.com/vitor-hbr"
        target="_blank"
        rel="noopener noreferrer"
      >
        Made by{" "}
        <span>
          <Image
            src="/vitor-profile.png"
            alt="My profile picture"
            width={60}
            height={60}
          />
        </span>
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
