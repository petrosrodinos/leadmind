export const Routes = {
    root: "/",
    auth: {
        sign_in: "/auth/sign-in",
        sign_up: "/auth/sign-up",
    },
    admin: {
        users: "/admin/users",
        alerts: "/admin/alerts",
    },
    dashboard: {
        root: "/dashboard",
        leads_directory: "/dashboard/leads-directory",
        leads_directory_detail: "/dashboard/leads-directory/:uuid",
        leads: "/dashboard/leads",
        contacts: "/dashboard/contacts",
        contacts_detail: "/dashboard/contacts/:uuid",
        filters: "/dashboard/filters",
        filters_new: "/dashboard/filters/new",
        filters_scoring_instructions: "/dashboard/filters/scoring-instructions",
        filters_detail: "/dashboard/filters/:uuid",
        filters_detail_tab_query: "tab",
        map: "/dashboard/map",
        analytics: "/dashboard/analytics",
        settings: "/dashboard/settings",
        sender_profiles: "/dashboard/sender-profiles",
        integrations: "/dashboard/integrations",
        campaigns: "/dashboard/campaigns",
        campaigns_new: "/dashboard/campaigns/new",
        campaigns_detail: "/dashboard/campaigns/:uuid",
        campaigns_edit: "/dashboard/campaigns/:uuid/edit",
        reminders: "/dashboard/reminders",
        forms: "/dashboard/forms",
        forms_detail: "/dashboard/forms/:uuid",
        admin_batch_jobs: "/dashboard/admin/batch-jobs",
    },
};

export const FilterDetailTabIds = {
    FILTER: "filter",
    CONTACTS: "contacts",
    JOBS: "jobs",
} as const;
