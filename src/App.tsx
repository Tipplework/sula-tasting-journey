import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
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
