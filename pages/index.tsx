import Head from "next/head";

import { PasswordGenerator, Footer } from "../components/index/";

export default function Home() {
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
      <div className="flex flex-col md:flex-row md:justify-around h-full font-mono bg-gradient-to-b from-slate-900 to-black items-center p-8">
        <div className="text-center md:text-left w-3/4 md:w-2/4 text-white py-6 max-w-[600px] md:mb-96">
          <h1 className="text-4xl md:text-5xl pb-3">Super Gen Pass!</h1>
          <p className="text-lg md:text-2xl">
            A way for you to be more secure, and not have a single point of
            failure while using a password manager. Generate a password for each
            of the domains you need, using a master password.
          </p>
        </div>
        <PasswordGenerator />
        <Footer />
      </div>
    </>
  );
}
