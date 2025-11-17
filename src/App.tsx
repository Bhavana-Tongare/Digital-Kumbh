
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
// Route guards removed to restore normal behavior
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ReportMissing from "./pages/ReportMissing";
import ReportFound from "./pages/ReportFound";
import MyReports from "./pages/MyReports";
import RoutePlanner from "./pages/RoutePlanner";
import NearbyPlaces from "./pages/NearbyPlaces";
import Temples from "./pages/Temples";
import Chat from "./pages/Chat";
import EmergencyContacts from "./pages/EmergencyContacts";
import ContactSupport from "./pages/ContactSupport";
import HelpCenter from "./pages/HelpCenter";
import Accommodations from "./pages/Accommodations";
import ManageReports from "./pages/ManageReports";
import CrowdMonitoring from "./pages/CrowdMonitoring";
import ScreenManager from "./pages/ScreenManager";
import ScreenDisplay from "./pages/ScreenDisplay";
import EmergencyAlerts from "./pages/EmergencyAlerts";
import UserManagement from "./pages/UserManagement";
import Analytics from "./pages/Analytics";
import CrowdAnalytics from "./pages/CrowdAnalytics";
import ProfileSettings from "./pages/ProfileSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              
              {/* User Role Features */}
              <Route path="/report-missing" element={<ReportMissing />} />
              <Route path="/report-found" element={<ReportFound />} />
              <Route path="/my-reports" element={<MyReports />} />
              <Route path="/routes" element={<RoutePlanner />} />
              <Route path="/nearby" element={<NearbyPlaces />} />
              <Route path="/temples" element={<Temples />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/emergency-contacts" element={<EmergencyContacts />} />
              <Route path="/contact" element={<ContactSupport />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/accommodations" element={<Accommodations />} />
              
              {/* Authority Role Features */}
              <Route path="/manage-reports" element={<ManageReports />} />
              <Route path="/crowd-monitoring" element={<CrowdMonitoring />} />
              <Route path="/screen-manager" element={<ScreenManager />} />
              <Route path="/screens" element={<ScreenManager />} />
              <Route path="/screen-display" element={<ScreenDisplay />} />
              <Route path="/emergency-alerts" element={<EmergencyAlerts />} />
              
              {/* Admin Role Features */}
              <Route path="/users" element={<UserManagement />} />
              <Route path="/all-reports" element={<ManageReports />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/crowd-analytics" element={<CrowdAnalytics />} />
              
              {/* The catch-all route for 404 errors */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
