import React from "react";

const TermsPage = () => {
  return (
    <section className="flex flex-col gap-4 p-7 text-white lg:p-11">
      <h3 className="animate-gradient-text bg-gradient-to-r from-violet-600 via-slate-300  to-purple-400 bg-clip-text pb-3 font-bold text-transparent duration-1000">
        Terms of Service of SuperGenPass
      </h3>
      <p>
        By using this open-source project, you agree to the following terms and
        conditions:
      </p>
      <p>
        1. You acknowledge that this project is provided on an &quot;as is&quot;
        basis, without warranties of any kind, express or implied.
      </p>
      <p>
        2. You understand that the project is maintained by a solo developer and
        is not affiliated with any company or organization.
      </p>
      <p>
        3. You agree to use the project for non-profit purposes only and not for
        any commercial gain.
      </p>
      <p>
        4. You accept that the developer is not responsible for any loss or
        damage incurred from the use of the project.
      </p>
      <p>
        5. You acknowledge that the developer may modify or discontinue the
        project at any time without prior notice.
      </p>
      <p>
        6. You understand that the project may include third-party libraries or
        services, which are subject to their own terms and conditions.
      </p>
      <p>
        These terms of service may be updated from time to time, and it is your
        responsibility to review and comply with the latest version.
      </p>
    </section>
  );
};

export default TermsPage;
