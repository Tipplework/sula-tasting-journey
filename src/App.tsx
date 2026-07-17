import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import RootGate from "./pages/RootGate";
import HowToEnjoyPage from "./pages/HowToEnjoyPage";
import FlightOverview from "./pages/FlightOverview";
import TastingPage from "./pages/TastingPage";
import ResultsPage from "./pages/ResultsPage";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/admin/LoginPage";
import ResetPasswordPage from "./pages/admin/ResetPasswordPage";
import AdminGate from "./pages/admin/AdminGate";
import ContentCenter from "./pages/admin/ContentCenter";
import ContentEditor from "./pages/admin/ContentEditor";
import HomepageEditor from "./pages/admin/HomepageEditor";
import PrivacyCenter from "./pages/admin/PrivacyCenter";
import WinesFlightsCenter from "./pages/admin/WinesFlightsCenter";
import ContentViewer from "./pages/content/ContentViewer";

export default function App() {
  return (
    <>
      <AuthHashRouter />
      <Routes>
        <Route path="/" element={<RootGate />} />
        <Route path="/how-to-enjoy" element={<HowToEnjoyPage />} />
        <Route path="/flight" element={<FlightOverview />} />
        <Route path="/tasting" element={<TastingPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/admin" element={<AdminGate><AdminDashboard /></AdminGate>} />

        {/* Sula Content Experience */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/content-center" element={<AdminGate><ContentCenter /></AdminGate>} />
        <Route path="/content-center/homepage" element={<AdminGate><HomepageEditor /></AdminGate>} />
        <Route path="/content-center/new" element={<AdminGate><ContentEditor /></AdminGate>} />
        <Route path="/content-center/:id/edit" element={<AdminGate><ContentEditor /></AdminGate>} />
        <Route path="/content-center/privacy" element={<AdminGate><PrivacyCenter /></AdminGate>} />
        <Route path="/content-center/wines" element={<AdminGate><WinesFlightsCenter /></AdminGate>} />
        <Route path="/c/:slug" element={<ContentViewer />} />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}

/**
 * Supabase auth links (password reset, magic link, email confirm) always land
 * at the project's Site URL — which is "/" for this app — with the token or
 * error info in the URL hash. This component runs on every route change,
 * inspects the hash, and forwards the user to the right in-app screen so a
 * reset link never dead-ends on the guest welcome page.
 */
function AuthHashRouter() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash || hash.length < 2) return;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");
    const errorCode = params.get("error_code");
    const errorDesc = params.get("error_description");

    // Recovery link — send them to /reset-password with the tokens preserved
    if (type === "recovery" || params.get("access_token")) {
      if (loc.pathname !== "/reset-password") {
        nav(`/reset-password${window.location.hash}`, { replace: true });
      }
      return;
    }

    // Expired / invalid link — bounce to login with a clear message
    if (errorCode) {
      const friendly =
        errorCode === "otp_expired"
          ? "That reset link has expired. Request a new one below."
          : (errorDesc || "Sign-in link is invalid. Please try again.").replace(/\+/g, " ");
      toast.error(friendly);
      // Clear the hash and route to login
      window.history.replaceState(null, "", window.location.pathname);
      nav("/login", { replace: true });
    }
  }, [loc.pathname, nav]);

  return null;
}
