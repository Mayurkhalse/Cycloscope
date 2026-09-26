import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { RoleClearanceRibbon } from './components/auth/RoleClearanceRibbon';
import { AuthGateway } from './components/auth/AuthGateway';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ChatWidget } from './components/chatbot/ChatWidget';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export function App() {
  const { isAuthenticated } = useAuthStore();

  // Pre-website Authentication Gateway: gates access before entering the workstation
  if (!isAuthenticated) {
    return <AuthGateway />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 selection:bg-ocean-500 selection:text-white">
          <DisclaimerBanner />
          <RoleClearanceRibbon />
          <Navbar />
          <Sidebar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <ChatWidget />
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

