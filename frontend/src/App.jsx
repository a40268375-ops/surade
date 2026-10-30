import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import AppRouter from "./router/router-index.jsx";
import LoadingScreen from "./components/LoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import { usePresenceHeartbeat } from "./utils/userPresence";
import { useGlobalNotifications } from "./hooks/useGlobalNotifications.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ReferralProvider } from "./context/ReferralContext.jsx";

function App() {
  usePresenceHeartbeat();
  useGlobalNotifications();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Memberikan transisi loading resmi Surade.com saat pertama kali masuk website
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
      {initialLoading && (
        <LoadingScreen
          isLoading={initialLoading}
          text="Surade.com"
          subtext="Portal UMKM & Ekosistem Digital Surade"
        />
      )}
      <AuthProvider>
        <ReferralProvider>
          <AppRouter />
        </ReferralProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
