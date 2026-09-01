"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { switchCartOwner } from "@/lib/rtk/cartSlice";
import type { AppDispatch, RootState } from "@/lib/rtk/store";

/** Load the signed-in customer's cart; keep cart empty when logged out. */
export function CartOwnerSync() {
  const dispatch = useDispatch<AppDispatch>();
  const cartOwnerId = useSelector((state: RootState) => state.cart.ownerId);
  const cartItems = useSelector((state: RootState) => state.cart.items.length);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { data: user, isFetching } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (isFetching) return;

    if (isAuthenticated && user?.id) {
      if (cartOwnerId !== user.id) {
        dispatch(switchCartOwner(user.id));
      }
      return;
    }

    if (!isAuthenticated && (cartOwnerId !== null || cartItems > 0)) {
      dispatch(switchCartOwner(null));
    }
  }, [cartItems, cartOwnerId, dispatch, isAuthenticated, isFetching, user?.id]);

  return null;
}
