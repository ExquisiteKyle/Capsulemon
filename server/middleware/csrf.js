import { doubleCsrf } from "csrf-csrf";

const csrfOptions = {
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: "__Host-psifi.x-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
};

export const { generateToken, doubleCsrfProtection } = doubleCsrf(csrfOptions);
