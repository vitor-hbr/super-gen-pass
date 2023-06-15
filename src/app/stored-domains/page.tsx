import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { StoredDomainsContent } from "../../ui";

const StoredDomainsPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <>
      <h1>Stored Domains</h1>
      <StoredDomainsContent />
    </>
  );
};

export default StoredDomainsPage;
