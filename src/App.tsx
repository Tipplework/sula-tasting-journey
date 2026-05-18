import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import WelcomePage from "./pages/WelcomePage";
import HowToEnjoyPage from "./pages/HowToEnjoyPage";
import FlightOverview from "./pages/FlightOverview";
import TastingPage from "./pages/TastingPage";
import ResultsPage from "./pages/ResultsPage";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/admin/LoginPage";
import AdminGate from "./pages/admin/AdminGate";
import ContentCenter from "./pages/admin/ContentCenter";
import ContentEditor from "./pages/admin/ContentEditor";
import ContentViewer from "./pages/content/ContentViewer";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/how-to-enjoy" element={<HowToEnjoyPage />} />
        <Route path="/flight" element={<FlightOverview />} />
        <Route path="/tasting" element={<TastingPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Sula Content Experience */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/content-center" element={<AdminGate><ContentCenter /></AdminGate>} />
        <Route path="/content-center/new" element={<AdminGate><ContentEditor /></AdminGate>} />
        <Route path="/content-center/:id/edit" element={<AdminGate><ContentEditor /></AdminGate>} />
        <Route path="/c/:slug" element={<ContentViewer />} />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}
