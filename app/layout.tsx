import { Metadata } from "next";
import { Nunito } from "next/font/google";

import { Footer } from "../ui";
import "../styles/globals.scss";

const nunitoFont = Nunito({
  subsets: ["latin"],
  display: "swap",
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

  return (
    <html lang="en" className={`${nunitoFont} min-h-screen`}>
      <body className="min-h-screen flex relative">
        {children}
        <Footer avatar_url={avatar_url} />
      </body>
    </html>
  );
}

const getGithubData = async () => {
  const { avatar_url, name, bio, html_url } = await fetch(
    "https://api.github.com/users/vitor-hbr"
  )
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });

  return {
    avatar_url,
    name,
    bio,
    html_url,
  };
};
