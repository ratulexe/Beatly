import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Eager load core routes
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Devices from '../pages/Settings/Devices/Devices';

// Lazy load feature routes
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const RecentTracks = lazy(() => import('../pages/RecentTracks/RecentTracks'));
const Analytics = lazy(() => import('../pages/Analytics/Analytics'));
const Artists = lazy(() => import('../pages/Artists/Artists'));
const Albums = lazy(() => import('../pages/Albums/Albums'));
const Groups = lazy(() => import('../pages/Groups/Groups'));
const CreateGroup = lazy(() => import('../pages/Groups/CreateGroup'));
const GroupDetails = lazy(() => import('../pages/Groups/GroupDetails'));
const Friends = lazy(() => import('../pages/Friends/Friends'));
const Invitations = lazy(() => import('../pages/Invitations/Invitations'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound'));

// Phase 11 Pages
const Leaderboard = lazy(() => import('../pages/Leaderboard/Leaderboard'));
const Compare = lazy(() => import('../pages/Compare/Compare'));
const Achievements = lazy(() => import('../pages/Achievements/Achievements'));
const Activity = lazy(() => import('../pages/Activity/Activity'));

// Phase 13 Pages
const AIHub = lazy(() => import('../pages/AI/AIHub'));

// Phase 14 Pages
const CoachDashboard = lazy(() => import('../pages/Coach/CoachDashboard'));

// Phase 15 Pages
const DiscoverDashboard = lazy(() => import('../pages/Discover/DiscoverDashboard'));

// Phase 16 Pages
const WrappedDashboard = lazy(() => import('../pages/Wrapped/WrappedDashboard'));

// Phase 17 Pages
const DeviceDetails = lazy(() => import('../pages/Settings/Devices/DeviceDetails'));

const PageLoader = () => (
  <div className="flex h-[80vh] w-full items-center justify-center">
    <Loader className="h-10 w-10 animate-spin text-beatly-primary" />
  </div>
);

const ProtectedDashboardLayout = () => (
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
);

const AppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleForceLogout = () => {
      navigate('/login', { replace: true });
    };
    window.addEventListener('force_logout', handleForceLogout);
    return () => window.removeEventListener('force_logout', handleForceLogout);
  }, [navigate]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Routes wrapped in Layout */}
        <Route element={<ProtectedDashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          
          {/* Phase 11 Routes */}
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/activity" element={<Activity />} />

          {/* Phase 13 & 14 Routes */}
          <Route path="/ai" element={<AIHub />} />
          <Route path="/coach" element={<CoachDashboard />} />

          {/* Phase 15 Routes */}
          <Route path="/discover" element={<DiscoverDashboard />} />

          {/* Phase 16 Routes */}
          <Route path="/wrapped" element={<WrappedDashboard />} />

          <Route path="/recent" element={<RecentTracks />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/create" element={<CreateGroup />} />
          <Route path="/groups/:id" element={<GroupDetails />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/devices" element={<Devices />} />
          <Route path="/settings/devices/:id" element={<DeviceDetails />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
