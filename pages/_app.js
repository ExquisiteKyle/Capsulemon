import "../styles/globals.css"; // Import global styles
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="mainContent">
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  );
}

export default MyApp;
