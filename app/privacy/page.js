export const metadata = {
  title: "Privacy Policy — Betsel Stack",
  description:
    "How Betsel Stack collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="bsp-wrap">
      <style>{`
        .bsp-wrap {
          max-width: 760px;
          margin: 0 auto;
          padding: 56px 24px 96px;
          color: #1f2937;
          line-height: 1.7;
          font-size: 16px;
        }
        .bsp-wrap h1 {
          font-size: 2.1rem;
          line-height: 1.2;
          margin: 0 0 8px;
          color: #111827;
        }
        .bsp-updated {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0 0 36px;
        }
        .bsp-wrap h2 {
          font-size: 1.25rem;
          margin: 40px 0 12px;
          color: #111827;
        }
        .bsp-wrap p {
          margin: 0 0 14px;
        }
        .bsp-wrap ul {
          margin: 0 0 14px;
          padding-left: 22px;
        }
        .bsp-wrap li {
          margin-bottom: 8px;
        }
        .bsp-wrap a {
          color: #1d4ed8;
          text-decoration: underline;
        }
        @media (max-width: 480px) {
          .bsp-wrap {
            padding: 36px 18px 72px;
          }
          .bsp-wrap h1 {
            font-size: 1.7rem;
          }
        }
      `}</style>

      <h1>Privacy Policy</h1>
      <p className="bsp-updated">Effective date: July 2, 2026</p>

      <p>
        Betsel Stack ("we," "us," or "our") provides pallet pattern creation
        and reporting software at betselstack.com (the "Service"). This policy
        explains what information we collect when you use the Service, how we
        use it, and the choices you have. We built Betsel Stack for packaging
        and engineering professionals, and we treat your data the way we would
        want ours treated: we collect only what the Service needs to work, and
        we never sell it.
      </p>

      <h2>Information we collect</h2>
      <p>We collect the following categories of information:</p>
      <ul>
        <li>
          <strong>Account information.</strong> When you create an account, we
          collect your email address and authentication credentials so you can
          sign in securely.
        </li>
        <li>
          <strong>Billing information.</strong> Payments are processed by
          Stripe, our payment provider. Your card number is transmitted
          directly to Stripe and is never stored on our servers. We retain
          only your subscription status and billing history references needed
          to manage your plan.
        </li>
        <li>
          <strong>Your work product.</strong> Pallet patterns, case and pallet
          dimensions, settings, and saved reports you create in the Service
          are stored in your account so you can access them across devices.
          This data belongs to you.
        </li>
        <li>
          <strong>Usage and technical data.</strong> Like most web
          applications, we and our hosting provider receive standard technical
          information such as IP address, browser type, and pages visited,
          which is used for security, troubleshooting, and keeping the Service
          reliable.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve the Service;</li>
        <li>Authenticate your account and keep it secure;</li>
        <li>Process subscription payments and manage free trials;</li>
        <li>
          Respond to support requests and send essential service
          communications (such as billing notices or security alerts);
        </li>
        <li>Monitor for abuse, fraud, and security threats.</li>
      </ul>
      <p>
        We do not sell your personal information, and we do not share your
        pallet data, reports, or designs with other customers or third
        parties for marketing purposes.
      </p>

      <h2>How your data is stored and protected</h2>
      <p>
        Your account data and saved work are stored in a managed cloud
        database with row-level security, meaning your data is technically
        isolated so that only your authenticated account can read or modify
        it. All connections to the Service are encrypted in transit using
        HTTPS/TLS. Access to production systems is limited to those who need
        it to operate the Service.
      </p>
      <p>
        No method of transmission or storage is 100% secure, but we follow
        industry-standard practices and review our security model regularly.
        If we ever become aware of a breach affecting your personal
        information, we will notify you as required by applicable law.
      </p>

      <h2>Service providers we rely on</h2>
      <p>
        We use a small number of trusted providers to operate the Service.
        Each receives only the information necessary to perform its function:
      </p>
      <ul>
        <li>
          <strong>Stripe</strong> — payment processing and subscription
          billing;
        </li>
        <li>
          <strong>Supabase</strong> — database hosting and authentication;
        </li>
        <li>
          <strong>Vercel</strong> — website and application hosting.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        The Service uses cookies and similar technologies that are necessary
        for it to function — primarily to keep you signed in to your account.
        We do not use third-party advertising cookies.
      </p>

      <h2>Data retention and deletion</h2>
      <p>
        We keep your account information and saved work for as long as your
        account is active. If you cancel your subscription, your saved data is
        retained so you can return, unless you ask us to delete it. You may
        request deletion of your account and associated data at any time by
        contacting us, and we will remove it except where we are required to
        retain limited records (for example, billing records for tax
        purposes).
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct,
        export, or delete your personal information. To exercise any of these
        rights, contact us using the details below and we will respond within
        a reasonable time.
      </p>

      <h2>Children's privacy</h2>
      <p>
        The Service is intended for business use by adults. We do not
        knowingly collect personal information from anyone under 18.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. If we make material
        changes, we will update the effective date above and, where
        appropriate, notify you by email or through the Service.
      </p>

      <h2>Contact us</h2>
      <p>
        If you have questions about this policy or your data, contact us at{" "}
        <a href="mailto:support@betselstack.com">support@betselstack.com</a>.
      </p>
    </main>
  );
}
