import LegalPage, { LegalSection } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Terms of Service — DM Trigger Bot",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="July 24, 2026">
      <LegalSection title="1. Your account">
        <p>
          You&apos;re responsible for keeping your login credentials secure
          and for all activity that happens under your account, including
          campaigns run through any Instagram account you connect.
        </p>
      </LegalSection>

      <LegalSection title="2. Plans and DM limits">
        <p>
          The Free plan includes a 3-day trial and 100 automated DMs per
          reel. Paid plans increase this limit as described on the
          pricing page. Limits reset at the start of each billing cycle
          and unused DMs do not roll over.
        </p>
      </LegalSection>

      <LegalSection title="3. Acceptable use">
        <p>
          You agree not to use DM Trigger Bot to send spam, unsolicited
          commercial messages outside the scope of a genuine trigger
          reply, or content that violates Instagram&apos;s or Meta&apos;s
          own platform policies. Accounts found in violation may be
          suspended.
        </p>
      </LegalSection>

      <LegalSection title="4. Third-party platforms">
        <p>
          DM Trigger Bot connects to Instagram via the Meta Graph API.
          Your use of Instagram remains subject to Meta&apos;s own terms.
          We are not responsible for changes Meta makes to that API which
          may affect delivery.
        </p>
      </LegalSection>

      <LegalSection title="5. Account deletion">
        <p>
          You can permanently delete your account, campaigns, and DM
          history at any time from Settings → Delete my account, with no
          need to contact support. This action is immediate and
          irreversible.
        </p>
      </LegalSection>

      <LegalSection title="6. Cancellation">
        <p>
          You may cancel or downgrade your plan at any time from your
          dashboard. Cancellation takes effect at the end of the current
          billing cycle.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          Questions about these terms can be sent to{" "}
          <a
            href="mailto:support@dmtriggerbot.app"
            className="text-signal hover:underline"
          >
            support@dmtriggerbot.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
