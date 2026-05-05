import AppRoutes from "./routes";
import { BrowserRouter } from "react-router-dom";
import QueryProvider from "./components/providers/query-provider.tsx";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <QueryProvider>
          <AppRoutes />
        </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
