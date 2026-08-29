import { SiteShell } from "@/components/site-shell";
import { useNav } from "@/lib/nav";
import { AboutPage } from "@/pages/about";
import { DirectoryPage } from "@/pages/directory";
import { FeedbackPage } from "@/pages/feedback";
import { HomePage } from "@/pages/home";
import { PartnersPage } from "@/pages/partners";

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
    ) : (
      <HomePage />
    );

  return <SiteShell>{page}</SiteShell>;
}
