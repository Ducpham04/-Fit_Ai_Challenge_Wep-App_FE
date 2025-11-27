import { AppRouter } from "./router";
import { Toaster } from "./components_1/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import { ChallengeProvider } from "./context/ChallengeContext";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <ChallengeProvider>
        <AppRouter />
        <Toaster position="top-right" />
      </ChallengeProvider>
    </AuthProvider>
  );
}
