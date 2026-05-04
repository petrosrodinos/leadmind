import { useEffect } from "react";
import { useRefreshAccountToken } from "@/features/auth/hooks/use-auth.ts";
import { useAuthStore } from "@/stores/auth.ts";

export const AuthTokenRefresher = () => {
  const { isLoggedIn, user_uuid } = useAuthStore();
  const { mutate: refreshAccountToken } = useRefreshAccountToken();

  useEffect(() => {
    if (isLoggedIn && user_uuid) {
      refreshAccountToken();
    }
  }, []);

  return null;
};
