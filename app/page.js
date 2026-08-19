import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import EasySetup from "@/components/landing/EasySetup";
import { CTA, Footer } from "@/components/landing/CTA";
import { createClient } from "@/lib/server";
import WarmupPing from "@/components/WarmupPing";   // ← added


export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  return (
    <main className="min-h-screen bg-base">
      <Navbar isLoggedIn={isLoggedIn} />
      <Hero isLoggedIn={isLoggedIn} />
      <HowItWorks />
      <EasySetup />
      <CTA isLoggedIn={isLoggedIn} />
      <Footer />
      <WarmupPing />
    </main>
  );
}