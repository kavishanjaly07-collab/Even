
import { Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./components/home";
import Login from "./components/Login/Login";
import Register from "./Register/Register";

import Customerhome from "./components/ClientDashboard/CustomerHome";
import BrowseServices from "./components/ClientDashboard/BrowseServices";
import EventConnectBookings from "./components/ClientDashboard/EventConnectBookings";
import ProfileSettings from "./components/ClientDashboard/Profilesettings";
import EventConnectMessages from "./components/ClientDashboard/EventConnectMessages";
import { MyReviews, PaymentsBudget } from "./components/ClientDashboard/ClientDashboardPages";
import Payment from "./components/Payment/Payment";
import ClientBookingPayment from "./components/Payment/ClientBookingPayment";
import OverviewDashboard from "./components/AdminDashboard/Overviewdashboard";
import UserManagement from "./components/AdminDashboard/UserManagement";
import ProviderManagement from "./components/AdminDashboard/ProviderMangament";
import AdminServiceManagement from "./components/AdminDashboard/AdminserviceManagement";
import BookingManagement from "./components/AdminDashboard/BookingManagement";
import PaymentsCommission from "./components/AdminDashboard/Paymentcommission";
import SubscriptionManagement from "./components/AdminDashboard/Subscrptionmanagement";
import PlatformSettings from "./components/AdminDashboard/Platformsettings";
import ProviderHome from "./components/ServiceProviderDashboard/ProviderHome";
import BookingRequests from "./components/ServiceProviderDashboard/BookingRequests";
import AvailabilityCalendar from "./components/ServiceProviderDashboard/AvailabilityCalendar";
import MyServices from "./components/ServiceProviderDashboard/Myservices";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/payment" element={<ProtectedRoute role="provider"><Payment /></ProtectedRoute>} />
    <Route
  path="/client-payment"
  element={
    <ProtectedRoute role="customer">
      <ClientBookingPayment />
    </ProtectedRoute>
  }
/>
      {/* Customer Dashboard */}
      <Route path="/CustomerHome" element={<ProtectedRoute role="customer"><Customerhome /></ProtectedRoute>} />
      <Route path="/BrowseServices" element={<ProtectedRoute role="customer"><BrowseServices /></ProtectedRoute>} />
      <Route path="/MyBookings" element={<ProtectedRoute role="customer"><EventConnectBookings /></ProtectedRoute>} />
      <Route path="/Messages" element={<ProtectedRoute role="customer"><EventConnectMessages /></ProtectedRoute>} />
      <Route path="/MyProfile" element={<ProtectedRoute role="customer"><ProfileSettings /></ProtectedRoute>} />
      <Route path="/PaymentsBudget" element={<ProtectedRoute role="customer"><PaymentsBudget /></ProtectedRoute>} />
      <Route path="/MyReviews" element={<ProtectedRoute role="customer"><MyReviews /></ProtectedRoute>} />

      {/* Provider and admin dashboards */}
      <Route path="/ProviderDashboard" element={<ProtectedRoute role="provider"><ProviderHome /></ProtectedRoute>} />
      <Route path="/ProviderHome" element={<ProtectedRoute role="provider"><ProviderHome /></ProtectedRoute>} />
      <Route path="/MyServices" element={<ProtectedRoute role="provider"><MyServices /></ProtectedRoute>} />
      <Route path="/BookingRequests" element={<ProtectedRoute role="provider"><BookingRequests /></ProtectedRoute>} />
      <Route path="/AvailabilityCalendar" element={<ProtectedRoute role="provider"><AvailabilityCalendar /></ProtectedRoute>} />

      <Route
        path="/AdminDashboard"
        element={<ProtectedRoute role="admin"><Outlet /></ProtectedRoute>}
      >
        <Route index element={<OverviewDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="providers" element={<ProviderManagement />} />
        <Route path="services" element={<AdminServiceManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="payments" element={<PaymentsCommission />} />
        <Route path="subscriptions" element={<SubscriptionManagement />} />
        <Route path="settings" element={<PlatformSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
