import AppRoutes from "./routes";
import { BrowserRouter } from "react-router-dom";
import QueryProvider from "./components/providers/query-provider.tsx";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import { Toast } from "@heroui/react/toast";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <QueryProvider>
          <>
            <AppRoutes />
            <Toast.Provider placement="bottom end" />
          </>
        </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
