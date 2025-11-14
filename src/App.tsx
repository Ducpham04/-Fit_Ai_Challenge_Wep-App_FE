import { AuthProvider } from './src/context/AuthContext';
import { AppRouter } from './src/router';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
