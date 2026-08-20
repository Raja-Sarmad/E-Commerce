import { useGetMeQuery } from "@/lib/rtk/authApi";

const ADMIN_ROLES = ["admin", "super_admin", "manager", "staff", "editor", "vendor"];

export function useIsAdmin() {
  const { data: user, isLoading } = useGetMeQuery();
  const isAdmin = Boolean(user && ADMIN_ROLES.includes(user.role));
  return { isAdmin, isLoading, user };
}
