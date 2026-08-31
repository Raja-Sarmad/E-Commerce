"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "@/lib/rtk/authApi";
import { clearAuthCookies } from "@/lib/rtk/authSlice";
import { baseApi } from "@/lib/rtk/baseApi";

export function useLogout() {
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const busyRef = useRef(false);

  const logout = useCallback(
    async (redirectTo = "/login") => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        await logoutMutation().unwrap();
      } catch {
        // Clear local session even if the API call fails
      } finally {
        dispatch(clearAuthCookies());
        dispatch(baseApi.util.resetApiState());
        busyRef.current = false;
        router.push(redirectTo);
      }
    },
    [dispatch, logoutMutation, router]
  );

  return { logout };
}
