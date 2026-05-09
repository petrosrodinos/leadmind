import { Routes as ReactRoutes, Route, Navigate } from "react-router-dom";
import { Routes } from "@/routes/routes";
import ProtectedRoute from "@/routes/protected-route";
import SignIn from "@/pages/auth/pages/sign-in";
import SignUp from "@/pages/auth/pages/sign-up";
import AuthLayout from "@/pages/auth/layout";
import DashboardLayout from "@/pages/dashboard/layout";
import DashboardHome from "@/pages/dashboard";
import LeadsDirectoryPage from "@/pages/dashboard/pages/leads-directory";
import LeadDirectoryDetailPage from "@/pages/dashboard/pages/leads-directory/pages/detail";
import LeadsPage from "@/pages/dashboard/pages/leads";
import FiltersPage from "@/pages/dashboard/pages/filters";
import NewFilterPage from "@/pages/dashboard/pages/filters/pages/new";
import FilterDetailPage from "@/pages/dashboard/pages/filters/pages/detail";
import FilterContactsPage from "@/pages/dashboard/pages/filters/pages/contacts";
import EditFilterPage from "@/pages/dashboard/pages/filters/pages/edit";
import FilterJobsPage from "@/pages/dashboard/pages/filters/pages/jobs";
import ContactsPage from "@/pages/dashboard/pages/contacts";
import ContactDetailPage from "@/pages/dashboard/pages/contacts/pages/detail";

export default function AppRoutes() {
  return (
    <ReactRoutes>
      {/* Auth routes */}
      <Route
        path="/auth"
        element={
          <ProtectedRoute loggedIn={false}>
            <AuthLayout />
          </ProtectedRoute>
        }
      >
        <Route path="sign-up" element={<SignUp />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route index element={<Navigate to={Routes.auth.sign_in} replace />} />
      </Route>

      {/* Dashboard routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute loggedIn={true}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="leads-directory" element={<LeadsDirectoryPage />} />
        <Route path="leads-directory/:uuid" element={<LeadDirectoryDetailPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="contacts/:uuid" element={<ContactDetailPage />} />
        <Route path="filters" element={<FiltersPage />} />
        <Route path="filters/new" element={<NewFilterPage />} />
        <Route path="filters/:uuid" element={<FilterDetailPage />}>
          <Route index element={<Navigate to="contacts" replace />} />
          <Route path="contacts" element={<FilterContactsPage />} />
          <Route path="jobs" element={<FilterJobsPage />} />
          <Route path="edit" element={<EditFilterPage />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={Routes.auth.sign_in} replace />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </ReactRoutes>
  );
}
