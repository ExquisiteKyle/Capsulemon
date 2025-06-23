"use client";

import { AuthProvider, createAuthAPI } from "../../shared/auth";

const api = createAuthAPI(process.env.NEXT_PUBLIC_BACKEND_URL);

export const Providers = ({ children }) => {
  return <AuthProvider api={api}>{children}</AuthProvider>;
};
