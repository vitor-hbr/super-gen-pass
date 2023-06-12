import { SinglePasswordGenerator } from "../ui";

export default async function Page() {
  return (
    <div className="font-mono flex flex-1 flex-col items-center p-4 md:flex-row md:justify-around md:px-12 ">
      <div className="md:mb-48 w-full max-w-[600px] select-none py-6 text-center text-white md:w-2/4 md:text-left">
        <h1 className="animate-gradient-text bg-gradient-to-r from-violet-600 via-slate-300  to-purple-400 bg-clip-text pb-3 font-bold text-transparent duration-1000">
          Super Gen Pass!
        </h1>
        <p>
          A way for you to be more secure, and not have a single point of
          failure while using a password manager. Generate a password for each
          of the domains you need, using a master password.
        </p>
      </div>
      <SinglePasswordGenerator />
    </div>
  );
}
