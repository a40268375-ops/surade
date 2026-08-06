import { useState, useEffect } from "react";
import AppRouter from "./router/index.jsx";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Show loading screen on initial load, then hide once everything is ready
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingScreen isLoading={pageLoading} text="Info.co.id" />
      <AppRouter />
    </>
  );
}

export default App;
