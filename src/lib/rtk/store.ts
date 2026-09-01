import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import wishlistReducer from "./wishlistSlice";
import compareReducer from "./compareSlice";
import currencyReducer from "./currencySlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
      cart: cartReducer,
      wishlist: wishlistReducer,
      compare: compareReducer,
      currency: currencyReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
