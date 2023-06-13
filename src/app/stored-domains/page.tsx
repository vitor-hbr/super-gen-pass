import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

const StoredDomainsPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin?callbackUrl=/stored-domains");
  }

  return (
    <>
      <h1>Stored Domains</h1>
      <p>{session.user.name}</p>
    </>
  );
};

export default StoredDomainsPage;
