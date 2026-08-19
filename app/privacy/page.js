import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Privacy Policy — DM Trigger Bot",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="July 24, 2026">
      <LegalSection title="1. Information we collect">
        <p>
          When you create an account, we collect your email address and a
          hashed password via our authentication provider. When you connect
          an Instagram account, we store your Instagram Business Account ID,
          your Facebook user ID, and an access token issued by Meta, used
          solely to send the automated replies you configure.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use your information">
        <p>
          We use your data to operate your account, run the trigger
          campaigns you create, enforce your plan&apos;s monthly DM limit,
          and show you delivery analytics. We do not sell your data to
          third parties.
        </p>
      </LegalSection>

      <LegalSection title="3. Instagram / Meta data">
        <p>
          Access tokens obtained through Facebook Login for Business are
          stored securely and used only to send messages on behalf of the
          account you explicitly connected. You can disconnect your
          Instagram account at any time from your dashboard, which
          deletes the stored token.
        </p>
      </LegalSection>

      <LegalSection title="4. Data retention">
        <p>
          We retain account and campaign data for as long as your account
          is active.
        </p>
      </LegalSection>

      <LegalSection title="5. Deleting your data">
        <p>
          You&apos;re in full control of this — no need to email anyone.
          From your dashboard, go to{" "}
          <span className="font-medium text-ink">Settings → Delete my account</span>{" "}
          and confirm. This immediately and permanently deletes your
          account, campaigns, DM activity history, and Instagram
          connection from our systems.
        </p>
        <p>
          If you instead remove DM Trigger Bot from your Facebook
          &quot;Apps and Websites&quot; settings directly, Meta
          automatically notifies us and we delete your data the same way.
          See our{" "}
          <Link href="/data-deletion" className="text-signal hover:underline">
            data deletion instructions
          </Link>{" "}
          for details.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
        <p>
          Questions about this policy can be sent to{" "}
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
