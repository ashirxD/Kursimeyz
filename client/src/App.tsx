import './App.css';
import AppRouter from './routes/appRoutes';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Toaster from './components/Toaster';
import { createQueryClient } from './lib/queryClient';

const queryClient = createQueryClient();

// Google OAuth Client ID from environment variables
// Get this from Google Cloud Console: https://console.cloud.google.com/
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
