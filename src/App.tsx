import { SiteShell } from "@/components/site-shell";
import { useNav } from "@/lib/nav";
import { AboutPage } from "@/pages/about";
import { ContactPage } from "@/pages/contact";
import { DirectoryPage } from "@/pages/directory";
import { FeedbackPage } from "@/pages/feedback";
import { GivePage } from "@/pages/give";
import { GuidePage } from "@/pages/guide";
import { ImpactPage } from "@/pages/impact";
import { JoinPage } from "@/pages/join";
import { DonatePage } from "@/pages/donate";
import { PrivacyPage } from "@/pages/privacy";
import { HomePage } from "@/pages/home";
import { PartnersPage } from "@/pages/partners";
import { VolunteerPage } from "@/pages/volunteer";

export default function App() {
  const path = useNav((s) => s.path);
  const page =
    path === "/directory" ? (
      <DirectoryPage />
    ) : path === "/partners" ? (
      <PartnersPage />
    ) : path === "/about" ? (
      <AboutPage />
    ) : path === "/feedback" ? (
      <FeedbackPage />
    ) : path === "/give" ? (
      <GivePage />
    ) : path === "/guide" ? (
      <GuidePage />
    ) : path === "/volunteer" ? (
      <VolunteerPage />
    ) : path === "/impact" ? (
      <ImpactPage />
    ) : path === "/join" ? (
      <JoinPage />
    ) : path === "/contact" ? (
      <ContactPage />
    ) : path === "/donate" ? (
      <DonatePage />
    ) : path === "/privacy" ? (
      <PrivacyPage />
    ) : (
      <HomePage />
    );

  return <SiteShell>{page}</SiteShell>;
}
