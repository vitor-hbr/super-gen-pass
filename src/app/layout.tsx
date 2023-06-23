import { Metadata } from "next";
import { Nunito, Staatliches } from "next/font/google";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import "../styles/globals.scss";
import { Footer } from "../ui";
import { Header } from "../ui/Header";

const nunitoFont = Nunito({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-nunito",
});

const staatlichesFont = Staatliches({
    subsets: ["latin"],
    display: "swap",
    weight: "400",
    variable: "--font-staatliches",
});

export const metadata: Metadata = {
    title: {
        default: "Super Gen Pass",
        template: "%s | Super Gen Pass",
    },
    description:
        "A Next.js application providing password hashing using supergenpass-lib.",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { avatar_url } = await getGithubData();
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <html
            lang="en"
            className={`${nunitoFont.variable} ${staatlichesFont.variable} min-h-screen`}
        >
            <body className="flex min-h-screen flex-col">
                <Header user={user} />
                <main className="flex flex-grow">{children}</main>
                <Footer avatar_url={avatar_url} />
            </body>
        </html>
    );
}

const getGithubData = async () => {
    const response = await fetch("https://api.github.com/users/vitor-hbr");
    const { avatar_url, name, bio, html_url } = await response.json();

    return {
        avatar_url,
        name,
        bio,
        html_url,
    };
};
