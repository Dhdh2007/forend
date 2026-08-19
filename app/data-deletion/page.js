import LegalPage, { LegalSection } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Data Deletion Instructions — DM Trigger Bot",
};

export default function DataDeletionPage() {
  return (
    <LegalPage title="Data Deletion Instructions" lastUpdated="July 24, 2026">
      <LegalSection title="Option 1 — Delete it yourself, instantly">
        <p>
          Log in, go to <span className="font-medium text-ink">Settings</span>,
          and click <span className="font-medium text-ink">Delete my account</span> in
          the Danger Zone section. Type &quot;DELETE&quot; to confirm. This
          immediately and permanently removes:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your account and login credentials</li>
          <li>All campaigns and trigger words you created</li>
          <li>Your full DM activity history</li>
          <li>Your connected Instagram access token</li>
        </ul>
        <p>No waiting period, no support ticket required.</p>
      </LegalSection>

      <LegalSection title="Option 2 — Remove the app from Facebook">
        <p>
          You can also revoke access from Facebook directly: go to{" "}
          <span className="font-medium text-ink">
            Facebook Settings → Apps and Websites
          </span>
          , find &quot;DM Trigger Bot&quot;, and remove it. Meta automatically
          sends us a signed deletion request when you do this, and we
          delete the same data listed above without you needing to visit
          our site at all.
        </p>
      </LegalSection>

      <LegalSection title="Option 3 — Email us">
        <p>
          If you can&apos;t access your account, email{" "}
          <a
            href="mailto:support@dmtriggerbot.app"
            className="text-signal hover:underline"
          >
            support@dmtriggerbot.app
          </a>{" "}
          from the address on file and we&apos;ll delete it manually within
          a few business days.
        </p>
      </LegalSection>

      <LegalSection title="What isn't deleted">
        <p>
          We may retain anonymized, aggregate usage statistics that no
          longer identify you, and any records we&apos;re legally required
          to keep (e.g. billing records, if applicable).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
