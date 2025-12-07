// frontend/src/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomeDashboard from "./pages/HomeDashboard";
import BotStatusPage from "./pages/BotStatusPage";
import TaskAllocationPage from "./pages/TaskAllocationPage";
import TaskQueuePage from "./pages/TaskQueuePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MapPage from "./pages/MapPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SvgLayoutMapPage from "./pages/SvgLayoutMapPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* protected */}
        <Route path="/dashboard" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
        <Route path="/bots" element={<ProtectedRoute><BotStatusPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TaskAllocationPage /></ProtectedRoute>} />
        <Route path="/queue" element={<ProtectedRoute><TaskQueuePage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/svg-map" element={<ProtectedRoute><SvgLayoutMapPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
