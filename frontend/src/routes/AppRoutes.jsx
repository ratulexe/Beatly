import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Login/Login';
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Settings/Settings';
import RecentTracks from '../pages/RecentTracks/RecentTracks';
import Analytics from '../pages/Analytics/Analytics';
import Artists from '../pages/Artists/Artists';
import Albums from '../pages/Albums/Albums';
import Groups from '../pages/Groups/Groups';
import CreateGroup from '../pages/Groups/CreateGroup';
import GroupDetails from '../pages/Groups/GroupDetails';
import Friends from '../pages/Friends/Friends';
import Invitations from '../pages/Invitations/Invitations';
import NotFound from '../pages/NotFound/NotFound';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* Dashboard Routes wrapped in Layout */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
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
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
