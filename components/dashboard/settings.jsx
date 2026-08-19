import { createClient } from "@/lib/server";
import ConnectInstagramButton from "@/components/dashboard/ConnectInstagramButton";
import InstagramStatusBanner from "@/components/dashboard/InstagramStatusBanner";
import DeleteAccountSection from "@/components/dashboard/DeleteAccountSection";


export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("instagram_account_id")
    .eq("id", user?.id)
    .maybeSingle();

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="mb-6 font-display text-xl font-semibold text-ink">Settings</h1>
      <InstagramStatusBanner />

      <div className="max-w-md space-y-6">
        <div className="rounded-2xl border border-base-border bg-base-surface p-6">
          <p className="mb-1 text-xs text-ink-faint">Account email</p>
          <p className="text-sm text-ink">{user?.email}</p>
        </div>

        <div className="rounded-2xl border border-base-border bg-base-surface p-6">
          <p className="mb-3 text-xs text-ink-faint">Instagram connection</p>
          <ConnectInstagramButton connected={!!profile?.instagram_account_id} />  
                </div>


        <DeleteAccountSection />

      </div>
    </div>
  );
}