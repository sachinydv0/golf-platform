import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './context/authStore';

// Layouts
import PublicLayout   from './components/common/PublicLayout';
import DashboardLayout from './components/dashboard/DashboardLayout';
import AdminLayout    from './components/admin/AdminLayout';

// Public pages
import HomePage       from './pages/public/HomePage';
import PricingPage    from './pages/public/PricingPage';
import CharitiesPage  from './pages/public/CharitiesPage';
import CharityDetail  from './pages/public/CharityDetail';
import DrawsPage      from './pages/public/DrawsPage';

// Auth pages
import LoginPage      from './pages/auth/LoginPage';
import RegisterPage   from './pages/auth/RegisterPage';

// Dashboard pages
import DashboardHome  from './pages/dashboard/DashboardHome';
import ScoresPage     from './pages/dashboard/ScoresPage';
import MyDrawsPage    from './pages/dashboard/MyDrawsPage';
import CharityPage    from './pages/dashboard/CharityPage';
import SubscriptionPage from './pages/dashboard/SubscriptionPage';
import ProfilePage    from './pages/dashboard/ProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminDraws     from './pages/admin/AdminDraws';
import AdminCharities from './pages/admin/AdminCharities';
import AdminWinners   from './pages/admin/AdminWinners';

// Guards
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

const SubscriberRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.subscription?.status !== 'active') return <Navigate to="/pricing" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/"           element={<HomePage />} />
        <Route path="/pricing"    element={<PricingPage />} />
        <Route path="/charities"  element={<CharitiesPage />} />
        <Route path="/charities/:slug" element={<CharityDetail />} />
        <Route path="/draws"      element={<DrawsPage />} />
      </Route>

      {/* Auth */}
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* User Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index                element={<DashboardHome />} />
        <Route path="scores"        element={<SubscriberRoute><ScoresPage /></SubscriberRoute>} />
        <Route path="draws"         element={<SubscriberRoute><MyDrawsPage /></SubscriberRoute>} />
        <Route path="charity"       element={<ProtectedRoute><CharityPage /></ProtectedRoute>} />
        <Route path="subscription"  element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
        <Route path="profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index               element={<AdminDashboard />} />
        <Route path="users"        element={<AdminUsers />} />
        <Route path="draws"        element={<AdminDraws />} />
        <Route path="charities"    element={<AdminCharities />} />
        <Route path="winners"      element={<AdminWinners />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
