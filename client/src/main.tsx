import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "@/lib/webfonts";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="form-builder-theme">
    <App />
  </ThemeProvider>
);
