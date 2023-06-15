"use client";

import { useState } from "react";
import { PasswordInput } from "./PasswordInput";

export const StoredDomainsContent = () => {
  const [masterPassword, setMasterPassword] = useState("");

  return (
    <>
      <PasswordInput
        onChange={(value) => setMasterPassword(value)}
        value={masterPassword}
        placeholder="Enter your master password"
      />
      <button>Generate</button>
    </>
  );
};
