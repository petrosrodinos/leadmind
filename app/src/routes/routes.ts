export const Routes = {
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
        leads: "/dashboard/leads",
        filters: "/dashboard/filters",
        filters_new: "/dashboard/filters/new",
        filters_detail: "/dashboard/filters/:uuid",
        filters_contacts: "/dashboard/filters/:uuid/contacts",
        filters_jobs: "/dashboard/filters/:uuid/jobs",
        filters_edit: "/dashboard/filters/:uuid/edit",
        map: "/dashboard/map",
        analytics: "/dashboard/analytics",
        settings: "/dashboard/settings",
    },
};
