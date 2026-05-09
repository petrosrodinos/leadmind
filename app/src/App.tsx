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
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <AppRoutes />
            </div>
            <Toast.Provider placement="bottom end" />
          </div>
        </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
