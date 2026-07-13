import type { ReactNode } from "react";
import { Suspense, lazy } from "react";
import { Spinner } from "@heroui/react";
import { Routes as ReactRoutes, Route, Navigate, useParams } from "react-router-dom";
import { FilterDetailTabIds, ListDetailTabIds, Routes } from "@/routes/routes";
import ProtectedRoute from "@/routes/protected-route";
import { Permissions } from "@/config/permissions";

const LandingPage = lazy(() => import("@/pages/landing"));
const AuthLayout = lazy(() => import("@/pages/auth/layout"));
const SignIn = lazy(() => import("@/pages/auth/pages/sign-in"));
const SignUp = lazy(() => import("@/pages/auth/pages/sign-up"));

const DashboardLayout = lazy(() => import("@/pages/dashboard/layout"));
const DashboardHome = lazy(() => import("@/pages/dashboard"));
const LeadsDirectoryPage = lazy(() => import("@/pages/dashboard/pages/leads-directory"));
const LeadDirectoryDetailPage = lazy(() => import("@/pages/dashboard/pages/leads-directory/pages/detail"));
const LeadsPage = lazy(() => import("@/pages/dashboard/pages/leads"));
const ContactsPage = lazy(() => import("@/pages/dashboard/pages/contacts"));
const ContactDetailPage = lazy(() => import("@/pages/dashboard/pages/contacts/pages/detail"));
const ListsPage = lazy(() => import("@/pages/dashboard/pages/lists"));
const ListDetailPage = lazy(() => import("@/pages/dashboard/pages/lists/pages/detail"));
const RemindersPage = lazy(() => import("@/pages/dashboard/pages/reminders"));
const FormsPage = lazy(() => import("@/pages/dashboard/pages/forms"));
const FormDetailPage = lazy(() => import("@/pages/dashboard/pages/forms/pages/detail"));
const SenderProfilesPage = lazy(() => import("@/pages/dashboard/pages/sender-profiles"));
const IntegrationsPage = lazy(() => import("@/pages/dashboard/pages/integrations"));
const CampaignsPage = lazy(() => import("@/pages/dashboard/pages/campaigns"));
const NewCampaignPage = lazy(() => import("@/pages/dashboard/pages/campaigns/pages/new"));
const EditCampaignPage = lazy(() => import("@/pages/dashboard/pages/campaigns/pages/edit"));
const CampaignDetailPage = lazy(() => import("@/pages/dashboard/pages/campaigns/pages/detail"));
const SendHistoryPage = lazy(() => import("@/pages/dashboard/pages/send-history"));
const MessageTemplatesPage = lazy(() => import("@/pages/dashboard/pages/message-templates"));
const SettingsUsagePage = lazy(() => import("@/pages/dashboard/pages/settings/usage"));

const DashboardFiltersLayout = lazy(() => import("@/pages/dashboard/pages/filters/layout"));
const FiltersPage = lazy(() => import("@/pages/dashboard/pages/filters"));
const NewFilterPage = lazy(() => import("@/pages/dashboard/pages/filters/pages/new"));
const FilterDetailPage = lazy(() => import("@/pages/dashboard/pages/filters/pages/detail"));
const ScoringInstructionsPage = lazy(() => import("@/pages/dashboard/pages/filters/pages/scoring-instructions"));

const AdminBatchJobsPage = lazy(() => import("@/pages/dashboard/pages/admin/batch-jobs"));
const AdminSystemStatusPage = lazy(() => import("@/pages/dashboard/pages/admin/system-status"));

function RouteFallback() {
  return (
    <div className="flex h-full min-h-0 flex-1 items-center justify-center p-6">
      <Spinner size="lg" />
    </div>
  );
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

function NavigateToFilterTab({ tab }: { tab: (typeof FilterDetailTabIds)[keyof typeof FilterDetailTabIds] }) {
  const { uuid } = useParams<{ uuid: string }>();
  if (!uuid) {
    return <Navigate to={Routes.dashboard.filters} replace />;
  }
  const sp = new URLSearchParams();
  sp.set(Routes.dashboard.filters_detail_tab_query, tab);
  return <Navigate to={{ pathname: Routes.dashboard.filters_detail.replace(":uuid", uuid), search: sp.toString() }} replace />;
}

function NavigateToListTab({ tab }: { tab: (typeof ListDetailTabIds)[keyof typeof ListDetailTabIds] }) {
  const { uuid } = useParams<{ uuid: string }>();
  if (!uuid) {
    return <Navigate to={Routes.dashboard.lists} replace />;
  }
  const sp = new URLSearchParams();
  sp.set(Routes.dashboard.lists_detail_tab_query, tab);
  return <Navigate to={{ pathname: Routes.dashboard.lists_detail.replace(":uuid", uuid), search: sp.toString() }} replace />;
}

export default function AppRoutes() {
  return (
    <ReactRoutes>
      {/* Auth routes */}
      <Route
        path="/auth"
        element={
          <ProtectedRoute loggedIn={false}>
            <Lazy>
              <AuthLayout />
            </Lazy>
          </ProtectedRoute>
        }
      >
        <Route
          path="sign-up"
          element={
            <Lazy>
              <SignUp />
            </Lazy>
          }
        />
        <Route
          path="sign-in"
          element={
            <Lazy>
              <SignIn />
            </Lazy>
          }
        />
        <Route index element={<Navigate to={Routes.auth.sign_in} replace />} />
      </Route>

      {/* Dashboard routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute loggedIn={true}>
            <Lazy>
              <DashboardLayout />
            </Lazy>
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Lazy>
              <DashboardHome />
            </Lazy>
          }
        />
        <Route
          path="leads-directory"
          element={
            <Lazy>
              <LeadsDirectoryPage />
            </Lazy>
          }
        />
        <Route
          path="leads-directory/:uuid"
          element={
            <Lazy>
              <LeadDirectoryDetailPage />
            </Lazy>
          }
        />
        <Route
          path="leads"
          element={
            <Lazy>
              <LeadsPage />
            </Lazy>
          }
        />
        <Route
          path="contacts"
          element={
            <Lazy>
              <ContactsPage />
            </Lazy>
          }
        />
        <Route
          path="contacts/:uuid"
          element={
            <Lazy>
              <ContactDetailPage />
            </Lazy>
          }
        />
        <Route
          path="lists"
          element={
            <Lazy>
              <ListsPage />
            </Lazy>
          }
        />
        <Route path="lists/:uuid/analytics" element={<NavigateToListTab tab={ListDetailTabIds.ANALYTICS} />} />
        <Route path="lists/:uuid/contacts" element={<NavigateToListTab tab={ListDetailTabIds.CONTACTS} />} />
        <Route
          path="lists/:uuid"
          element={
            <Lazy>
              <ListDetailPage />
            </Lazy>
          }
        />
        <Route
          path="reminders"
          element={
            <Lazy>
              <RemindersPage />
            </Lazy>
          }
        />
        <Route
          path="forms"
          element={
            <Lazy>
              <FormsPage />
            </Lazy>
          }
        />
        <Route
          path="forms/:uuid"
          element={
            <Lazy>
              <FormDetailPage />
            </Lazy>
          }
        />
        <Route
          path="sender-profiles"
          element={
            <Lazy>
              <SenderProfilesPage />
            </Lazy>
          }
        />
        <Route
          path="integrations"
          element={
            <Lazy>
              <IntegrationsPage />
            </Lazy>
          }
        />
        <Route path="settings" element={<Navigate to={Routes.dashboard.settings_usage} replace />} />
        <Route
          path="settings/usage"
          element={
            <Lazy>
              <SettingsUsagePage />
            </Lazy>
          }
        />
        <Route
          path="campaigns"
          element={
            <Lazy>
              <CampaignsPage />
            </Lazy>
          }
        />
        <Route
          path="campaigns/new"
          element={
            <Lazy>
              <NewCampaignPage />
            </Lazy>
          }
        />
        <Route
          path="campaigns/:uuid"
          element={
            <Lazy>
              <CampaignDetailPage />
            </Lazy>
          }
        />
        <Route
          path="campaigns/:uuid/edit"
          element={
            <Lazy>
              <EditCampaignPage />
            </Lazy>
          }
        />
        <Route
          path="send-history"
          element={
            <Lazy>
              <SendHistoryPage />
            </Lazy>
          }
        />
        <Route
          path="message-templates"
          element={
            <Lazy>
              <MessageTemplatesPage />
            </Lazy>
          }
        />
        <Route
          path="filters"
          element={
            <Lazy>
              <DashboardFiltersLayout />
            </Lazy>
          }
        >
          <Route
            index
            element={
              <Lazy>
                <FiltersPage />
              </Lazy>
            }
          />
          <Route
            path="new"
            element={
              <Lazy>
                <NewFilterPage />
              </Lazy>
            }
          />
          <Route
            path="scoring-instructions"
            element={
              <Lazy>
                <ScoringInstructionsPage />
              </Lazy>
            }
          />
          <Route path=":uuid/contacts" element={<NavigateToFilterTab tab={FilterDetailTabIds.CONTACTS} />} />
          <Route path=":uuid/jobs" element={<NavigateToFilterTab tab={FilterDetailTabIds.JOBS} />} />
          <Route path=":uuid/filter" element={<NavigateToFilterTab tab={FilterDetailTabIds.FILTER} />} />
          <Route path=":uuid/analytics" element={<NavigateToFilterTab tab={FilterDetailTabIds.ANALYTICS} />} />
          <Route
            path=":uuid"
            element={
              <Lazy>
                <FilterDetailPage />
              </Lazy>
            }
          />
        </Route>
        <Route
          path="admin/batch-jobs"
          element={
            <ProtectedRoute requiredRoles={Permissions.admin_batch_jobs}>
              <Lazy>
                <AdminBatchJobsPage />
              </Lazy>
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/system-status"
          element={
            <ProtectedRoute requiredRoles={Permissions.admin_batch_jobs}>
              <Lazy>
                <AdminSystemStatusPage />
              </Lazy>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Landing page */}
      <Route
        path={Routes.root}
        element={
          <Lazy>
            <LandingPage />
          </Lazy>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to={Routes.root} replace />} />
    </ReactRoutes>
  );
}
