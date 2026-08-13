import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import AppRouter from "./router/index.jsx";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Hide loading screen immediately on initial load without artificial delay
    setPageLoading(false);
  }, []);

  return (
    <>
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
      <LoadingScreen isLoading={pageLoading} text="Info.co.id" />
      <AppRouter />
    </>
  );
}

export default App;
