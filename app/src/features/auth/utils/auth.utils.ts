import type { LoggedInUser } from "@/features/user/interfaces/user.interface";

export const generateInitials = (value: string) => {
    if (!value) return "AN";
    const names = value.split(" ");
    const initials = names.map((name) => name[0]).join("").toUpperCase();
    return initials;
};

export const formatAuthUser = (data: any): LoggedInUser => {
    return {
        user_uuid: data.user.uuid,
        email: data.user.email,
        access_token: data.access_token,
        expires_in: data.expires_in,
        avatar: data?.user?.avatar?.url ?? null,
        full_name: data?.user?.full_name ?? data?.user?.email?.split("@")[0] ?? "A/N",
        role: data?.user?.role ?? null,
    };
};