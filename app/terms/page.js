export const metadata = {
  title: "Terms of Service — Betsel Stack",
  description:
    "The terms that govern your use of the Betsel Stack pallet pattern software.",
};

export default function TermsPage() {
  return (
    <div className="bst-wrap">
      <style>{`
        .bst-wrap {
          max-width: 760px;
          margin: 0 auto;
          padding: 56px 24px 96px;
          color: #d6dbe3;
          line-height: 1.7;
          font-size: 16px;
        }
        .bst-wrap h1 {
          font-size: 2.1rem;
          line-height: 1.2;
          margin: 0 0 8px;
          color: #f5f7fa;
        }
        .bst-updated {
          color: #9aa3af;
          font-size: 0.95rem;
          margin: 0 0 36px;
        }
        .bst-wrap h2 {
          font-size: 1.25rem;
          margin: 40px 0 12px;
          color: #f5f7fa;
        }
        .bst-wrap p {
          margin: 0 0 14px;
        }
        .bst-wrap ul {
          margin: 0 0 14px;
          padding-left: 22px;
        }
        .bst-wrap li {
          margin-bottom: 8px;
        }
        .bst-wrap a {
          color: #7fb2ff;
          text-decoration: underline;
        }
        @media (max-width: 480px) {
          .bst-wrap {
            padding: 36px 18px 72px;
          }
          .bst-wrap h1 {
            font-size: 1.7rem;
          }
        }
      `}</style>

      <h1>Terms of Service</h1>
      <p className="bst-updated">Effective date: July 2, 2026</p>

      <p>
        These Terms of Service ("Terms") govern your use of Betsel Stack, the
        pallet pattern creation and reporting software available at
        betselstack.com (the "Service"). By creating an account or using the
        Service, you agree to these Terms. If you are using the Service on
        behalf of a company, you represent that you have authority to bind
        that company, and "you" refers to that company.
      </p>

      <h2>1. The Service</h2>
      <p>
        Betsel Stack provides software tools for generating pallet loading
        patterns, editing layer arrangements, and creating reports based on
        case and pallet dimensions you enter. We may improve, modify, or add
        features to the Service over time.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You must provide accurate information when creating an account and
        keep your login credentials confidential. You are responsible for all
        activity that occurs under your account. Notify us promptly if you
        believe your account has been accessed without authorization. Each
        subscription is for use by a single account; sharing one account
        across multiple people is not permitted.
      </p>

      <h2>3. Free trial, subscription, and billing</h2>
      <ul>
        <li>
          <strong>Free trial.</strong> New accounts may include a 7-day free
          trial. If you do not cancel before the trial ends, your paid
          subscription begins automatically.
        </li>
        <li>
          <strong>Subscription.</strong> The Service is offered as a monthly
          subscription at the price shown on our pricing page at the time you
          subscribe. Payments are processed by Stripe and billed in advance
          each month.
        </li>
        <li>
          <strong>Cancellation.</strong> You may cancel at any time from your
          account page. Cancellation takes effect at the end of the current
          billing period, and you retain access until then. Except where
          required by law, payments already made are non-refundable.
        </li>
        <li>
          <strong>Price changes.</strong> We may change subscription pricing
          with advance notice. Price changes take effect at your next billing
          cycle after the notice period.
        </li>
      </ul>

      <h2>4. Your data</h2>
      <p>
        You retain ownership of the pallet patterns, dimensions, settings, and
        reports you create in the Service ("Your Data"). You grant us a
        limited license to store, process, and display Your Data solely to
        provide the Service to you. Our handling of personal information is
        described in our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>5. Our intellectual property</h2>
      <p>
        The Service — including its software, pattern-generation engine,
        design, and branding — is owned by us and protected by intellectual
        property laws. Your subscription gives you a limited, non-exclusive,
        non-transferable right to use the Service for your business purposes.
        You may not copy, resell, sublicense, reverse engineer, scrape, or
        create derivative works from the Service, or use it to build a
        competing product.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service in violation of any applicable law;</li>
        <li>
          Attempt to gain unauthorized access to the Service, other users'
          data, or our systems;
        </li>
        <li>
          Interfere with or disrupt the Service, including by overloading it
          with automated requests;
        </li>
        <li>
          Misrepresent output of the Service as certified engineering
          documentation.
        </li>
      </ul>

      <h2>7. Engineering disclaimer</h2>
      <p>
        Pallet patterns, stacking arrangements, and reports generated by the
        Service are planning aids based on the dimensions and parameters you
        provide. They do not account for every real-world factor, including
        but not limited to product weight distribution, packaging strength,
        load stability, stretch wrap or banding, transport conditions, and
        applicable safety regulations. You are solely responsible for
        verifying that any pallet configuration is safe and suitable for your
        products, equipment, and shipping conditions before using it in
        production. The Service is not a substitute for the judgment of a
        qualified packaging or safety professional.
      </p>

      <h2>8. Disclaimer of warranties</h2>
      <p>
        The Service is provided "as is" and "as available." To the fullest
        extent permitted by law, we disclaim all warranties, express or
        implied, including merchantability, fitness for a particular purpose,
        and non-infringement. We do not warrant that the Service will be
        uninterrupted, error-free, or that its output will meet your
        requirements.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we will not be liable for any
        indirect, incidental, special, consequential, or punitive damages, or
        for lost profits, lost data, product damage, personal injury, or
        business interruption arising from your use of the Service or reliance
        on its output. Our total liability for any claim relating to the
        Service is limited to the amount you paid us in the twelve months
        before the claim arose.
      </p>

      <h2>10. Termination</h2>
      <p>
        You may stop using the Service and cancel your subscription at any
        time. We may suspend or terminate your access if you materially
        violate these Terms, fail to pay, or use the Service in a way that
        risks harm to us or other users. Upon termination, your right to use
        the Service ends; you may request deletion of Your Data as described
        in our Privacy Policy.
      </p>

      <h2>11. Changes to the Service or these Terms</h2>
      <p>
        We may update these Terms from time to time. If we make material
        changes, we will update the effective date above and, where
        appropriate, notify you by email or through the Service. Continued use
        of the Service after changes take effect constitutes acceptance of the
        updated Terms.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of New Jersey,
        United States, without regard to conflict-of-law principles. Any
        dispute arising from these Terms or the Service will be resolved in
        the state or federal courts located in New Jersey, and you consent to
        their jurisdiction.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:team@betselstack.com">team@betselstack.com</a>.
      </p>
    </div>
  );
}
