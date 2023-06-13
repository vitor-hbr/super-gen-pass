import React from "react";

const PrivacyPage = () => {
  return (
    <section className="flex flex-col gap-4 p-7 text-white lg:p-11">
      <h3 className="animate-gradient-text bg-gradient-to-r from-violet-600 via-slate-300  to-purple-400 bg-clip-text pb-3 font-bold text-transparent duration-1000">
        Privacy Policy
      </h3>
      <p>
        Your privacy is important to us. This open-source project does not
        collect any personally identifiable information from its users.
      </p>
      <p>
        We may collect non-personal information, such as anonymized usage
        statistics, to improve the project and understand how it is being used.
      </p>
      <p>
        The project does not use cookies or any other tracking mechanisms to
        track user activities.
      </p>
      <p>
        Please note that since this is an open-source project, it is possible
        for third parties to fork, modify, and distribute the project
        independently. We are not responsible for the privacy practices of such
        third-party instances.
      </p>
      <p>
        This privacy policy may be updated from time to time, and it is your
        responsibility to review and comply with the latest version.
      </p>
    </section>
  );
};

export default PrivacyPage;
