import LegalPage, { LegalSection } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Data Deletion Status — DM Trigger Bot",
};

export default async function DataDeletionStatusPage({ searchParams }) {
  const params = await searchParams;
  const confirmationCode = params?.id;

  return (
    <LegalPage title="Data Deletion Status" lastUpdated="July 24, 2026">
      <LegalSection title="Your data has been deleted">
        <p>
          We received a request to remove your data from DM Trigger Bot
          and it has been processed — your account, campaigns, DM
          history, and Instagram connection have been permanently
          deleted from our systems.
        </p>
        {confirmationCode && (
          <p>
            Confirmation code:{" "}
            <span className="rounded-md bg-base-surface px-2 py-1 font-mono text-xs text-ink">
              {confirmationCode}
            </span>
          </p>
        )}
      </LegalSection>

      <LegalSection title="Questions?">
        <p>
          If you believe this happened in error, or have any questions,
          contact{" "}
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
