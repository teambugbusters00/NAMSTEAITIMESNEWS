import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import DeepDive from './pages/DeepDive';
import OnboardingModal from './components/OnboardingModal';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Layout Route */}
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="story/:id" element={<DeepDive />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        
        {/* Keep global components like Modals outside of Routes if they are triggered via context */}
        <OnboardingModal />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;