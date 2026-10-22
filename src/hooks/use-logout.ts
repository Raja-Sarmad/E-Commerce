"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "@/lib/rtk/authApi";
import { clearAuthCookies } from "@/lib/rtk/authSlice";
import { switchCartOwner } from "@/lib/rtk/cartSlice";
import { baseApi } from "@/lib/rtk/baseApi";
import { selectStoreSlug } from "@/lib/rtk/storeSlice";

const VEYA_LOGIN_URL =
  process.env.NEXT_PUBLIC_COSMETIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3001";
const OVERDOSE_SITE_URL =
  process.env.NEXT_PUBLIC_OVERDOSE_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";
const WARQU_SITE_URL =
  process.env.NEXT_PUBLIC_WARQU_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3002";

export function useLogout() {
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const storeSlug = useSelector(selectStoreSlug);
  const busyRef = useRef(false);

  const logout = useCallback(
    async (redirectTo = "/login") => {
      const urlStore = typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).get("store")?.trim().toLowerCase() || "";
      const activeStore = urlStore || storeSlug;
      const destination =
        activeStore === "cosmetic"
          ? `${VEYA_LOGIN_URL}/login`
          : activeStore === "store"
            ? `${OVERDOSE_SITE_URL}/login`
            : activeStore === "warqu"
              ? WARQU_SITE_URL
              : redirectTo;
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        await logoutMutation().unwrap();
      } catch {
        // Clear local session even if the API call fails
      } finally {
        dispatch(switchCartOwner(null));
        dispatch(clearAuthCookies());
        dispatch(baseApi.util.resetApiState());
        busyRef.current = false;
        if (destination.startsWith("http")) {
          window.location.href = destination;
        } else {
          router.push(destination);
        }
      }
    },
    [dispatch, logoutMutation, router, storeSlug]
  );

  return { logout };
}
