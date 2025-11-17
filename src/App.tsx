import { AuthProvider } from './context/AuthContext';
import { ChallengeProvider } from './context/ChallengeContext';
import { AppRouter } from './router';
import { Toaster } from './components_1/ui/sonner';

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
