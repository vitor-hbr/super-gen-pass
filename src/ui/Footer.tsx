import Image from "next/image";
import Link from "next/link";

export function Footer({ avatar_url }: { avatar_url: string }) {
    return (
        <footer className="sticky bottom-0 flex w-full items-center justify-between gap-2 bg-gradient-to-t from-black px-4 py-4 text-p-mobile text-white lg:px-8">
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

            <nav className="flex gap-5">
                <Link
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Privacy Policy
                </Link>
                <Link
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Terms of Service
                </Link>
            </nav>
        </footer>
    );
}
