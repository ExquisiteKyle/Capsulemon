import "./globals.css";

export const metadata = {
  title: "Project Website",
  description: "User-facing project website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
