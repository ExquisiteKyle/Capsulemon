// This is a Server Component
import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "Gachapon Project",
  description: "Create your empire.",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
