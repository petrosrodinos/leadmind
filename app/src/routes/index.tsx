import { Routes as ReactRoutes, Route, Navigate, useParams } from "react-router-dom";
import { FilterDetailTabIds, Routes } from "@/routes/routes";
import ProtectedRoute from "@/routes/protected-route";
import LandingPage from "@/pages/landing";
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
import ContactsPage from "@/pages/dashboard/pages/contacts";
import ContactDetailPage from "@/pages/dashboard/pages/contacts/pages/detail";
import SenderProfilesPage from "@/pages/dashboard/pages/sender-profiles";
import CampaignsPage from "@/pages/dashboard/pages/campaigns";
import NewCampaignPage from "@/pages/dashboard/pages/campaigns/pages/new";
import EditCampaignPage from "@/pages/dashboard/pages/campaigns/pages/edit";
import CampaignDetailPage from "@/pages/dashboard/pages/campaigns/pages/detail";

function NavigateToFilterTab({ tab }: { tab: (typeof FilterDetailTabIds)[keyof typeof FilterDetailTabIds] }) {
  const { uuid } = useParams<{ uuid: string }>();
  if (!uuid) {
    return <Navigate to={Routes.dashboard.filters} replace />;
  }
  const sp = new URLSearchParams();
  sp.set(Routes.dashboard.filters_detail_tab_query, tab);
  return <Navigate to={{ pathname: Routes.dashboard.filters_detail.replace(":uuid", uuid), search: sp.toString() }} replace />;
}

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
        <Route path="sender-profiles" element={<SenderProfilesPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="campaigns/new" element={<NewCampaignPage />} />
        <Route path="campaigns/:uuid" element={<CampaignDetailPage />} />
        <Route path="campaigns/:uuid/edit" element={<EditCampaignPage />} />
        <Route path="filters" element={<FiltersPage />} />
        <Route path="filters/new" element={<NewFilterPage />} />
        <Route path="filters/:uuid/contacts" element={<NavigateToFilterTab tab={FilterDetailTabIds.CONTACTS} />} />
        <Route path="filters/:uuid/jobs" element={<NavigateToFilterTab tab={FilterDetailTabIds.JOBS} />} />
        <Route path="filters/:uuid/filter" element={<NavigateToFilterTab tab={FilterDetailTabIds.FILTER} />} />
        <Route path="filters/:uuid" element={<FilterDetailPage />} />
      </Route>

      {/* Landing page */}
      <Route path={Routes.root} element={<LandingPage />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to={Routes.root} replace />} />
    </ReactRoutes>
  );
}
