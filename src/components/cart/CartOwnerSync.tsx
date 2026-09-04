"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { setUser } from "@/lib/rtk/authSlice";
import { switchCartOwner } from "@/lib/rtk/cartSlice";
import type { AppDispatch, RootState } from "@/lib/rtk/store";

/** Load the signed-in customer's cart; keep cart empty when logged out. */
export function CartOwnerSync() {
  const dispatch = useDispatch<AppDispatch>();
  const cartOwnerId = useSelector((state: RootState) => state.cart.ownerId);
  const cartItems = useSelector((state: RootState) => state.cart.items.length);
  const { data: user, isFetching } = useGetMeQuery();

  useEffect(() => {
    if (isFetching) return;

    if (user?.id) {
      dispatch(setUser(user));
      if (cartOwnerId !== user.id) {
        dispatch(switchCartOwner(user.id));
      }
      return;
    }

    if (user === null && (cartOwnerId !== null || cartItems > 0)) {
      dispatch(setUser(null));
      dispatch(switchCartOwner(null));
    }
  }, [cartItems, cartOwnerId, dispatch, isFetching, user]);

  return null;
}

