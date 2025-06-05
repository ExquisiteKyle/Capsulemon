// This is a Server Component
import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "Project Website",
  description: "User-facing project website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
