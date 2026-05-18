import WelcomePage from "./WelcomePage";
import LibraryPage from "./content/LibraryPage";

/**
 * Single-app, dual-domain router.
 * - pdfs.* hostname (or ?lib=1 for local preview) → content library
 * - everything else → wine flight welcome
 */
export default function RootGate() {
  if (typeof window === "undefined") return <WelcomePage />;

  const host = window.location.hostname;
  const params = new URLSearchParams(window.location.search);

  const isPdfsHost = host.startsWith("pdfs.") || params.get("lib") === "1";

  return isPdfsHost ? <LibraryPage /> : <WelcomePage />;
}
