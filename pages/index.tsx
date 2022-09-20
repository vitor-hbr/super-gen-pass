import Head from "next/head";

import { PasswordGenerator, Footer } from "../components/index/";

export default function Home({ avatar_url }) {
  return (
    <>
      <Head>
        <title>Vitor&apos;s Super Gen Pass</title>
        <meta
          name="description"
          content="A Next.js application providing password hashing using supergenpass-lib"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col md:flex-row md:justify-around h-full font-mono bg-gradient-to-b from-slate-900 to-black items-center p-8 md:p-24 ">
        <div className="text-center md:text-left w-3/4 md:w-2/4 text-white py-6 max-w-[600px] md:mb-96 select-none">
          <h1 className="text-4xl md:text-5xl pb-3 bg-gradient-to-r from-violet-600 via-slate-300  to-purple-400 animate-gradient-text text-transparent font-bold bg-clip-text duration-1000">
            Super Gen Pass!
          </h1>
          <p className="text-lg md:text-2x">
            A way for you to be more secure, and not have a single point of
            failure while using a password manager. Generate a password for each
            of the domains you need, using a master password.
          </p>
        </div>
        <PasswordGenerator />
        <Footer avatar_url={avatar_url} />
      </div>
    </>
  );
}

export const getStaticProps = async () => {
  const { avatar_url, name, bio, html_url } = await fetch(
    "https://api.github.com/users/vitor-hbr"
  )
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });

  return {
    props: {
      avatar_url,
      name,
      bio,
      html_url,
    },
  };
};
