import { PasswordGenerator } from "../ui";

export default async function Page() {
  return (
    <div className="flex flex-1 flex-col md:flex-row md:justify-around font-mono items-center p-4 md:px-12 ">
      <div className="text-center md:text-left w-full md:w-2/4 text-white py-6 max-w-[600px] md:mb-48 select-none">
        <h1 className="pb-3 bg-gradient-to-r from-violet-600 via-slate-300  to-purple-400 animate-gradient-text text-transparent font-bold bg-clip-text duration-1000">
          Super Gen Pass!
        </h1>
        <p>
          A way for you to be more secure, and not have a single point of
          failure while using a password manager. Generate a password for each
          of the domains you need, using a master password.
        </p>
      </div>
      <PasswordGenerator />
    </div>
  );
}
