import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import AppRouter from "./router/router-index.jsx";
import LoadingScreen from "./components/LoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import WelcomeBannerModal from "./components/WelcomeBannerModal";

function App() {
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Initial load: biarkan progress bar berjalan dinamis dan tuntas 100%
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
      <LoadingScreen isLoading={pageLoading} text="Surade.co.id" />
      <WelcomeBannerModal />
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;