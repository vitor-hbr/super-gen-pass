import Head from "next/head";

import { PasswordGenerator, Footer } from "../components/index/";

export default function Home() {
  return (
    <>
      <Head>
        <title>Vitor's Super Gen Pass</title>
        <meta
          name="description"
          content="A Next.js application providing password hashing using supergenpass-lib"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PasswordGenerator />
      <Footer />
    </>
  );
}
