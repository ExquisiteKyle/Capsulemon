import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/common/Navbar";

export const metadata = {
  title: "Card Game",
  description: "A card game with packs and trading",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="mainContent">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
