import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import WelcomePage from "./pages/WelcomePage";
import HowToEnjoyPage from "./pages/HowToEnjoyPage";
import FlightOverview from "./pages/FlightOverview";
import TastingPage from "./pages/TastingPage";
import ResultsPage from "./pages/ResultsPage";
import AdminDashboard from "./pages/AdminDashboard";

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
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}
