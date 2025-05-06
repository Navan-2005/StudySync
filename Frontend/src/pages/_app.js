import { Provider } from "react-redux";
import { store } from "../store/store";
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }) {
  // Add client-side only rendering to avoid hydration issues
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient ? (
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      ) : (
        // Optional: Show a minimal loading state or skeleton while client-side code initializes
        <div style={{ visibility: "hidden" }}>
          <Component {...pageProps} />
        </div>
      )}
    </>
  );
}

export default MyApp;