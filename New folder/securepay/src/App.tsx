import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/useUserStore';
import MobileLayout from './components/layout/MobileLayout';
import ToastContainer from './components/ui/ToastContainer';
import Preloader from './components/ui/Preloader';
import PinLogin from './pages/PinLogin';
import Dashboard from './pages/Dashboard';
import QrScan from './pages/PaymentMethods/QrScan';
import QrGenerate from './pages/PaymentMethods/QrGenerate';
import PayContact from './pages/PaymentMethods/PayContact';
import PayNumber from './pages/PaymentMethods/PayNumber';
import BankTransfer from './pages/PaymentMethods/BankTransfer';
import TransactionProcess from './pages/TransactionProcess';
import History from './pages/History';
import Emergency from './pages/Emergency';
import AiAdvisor from './pages/AiAdvisor';
import AdminPage from './pages/AdminPage';

function App() {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const theme = useUserStore(state => state.theme);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (showPreloader) {
    return <Preloader onComplete={() => setShowPreloader(false)} />;
  }

  return (
    <>
      <ToastContainer />
      <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <PinLogin />} />
        <Route path="/admin" element={<AdminPage />} />
        
        {/* Protected Routes inside Mobile Layout */}
        <Route element={isAuthenticated ? <MobileLayout /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pay/qr" element={<QrScan />} />
          <Route path="/pay/qr-generate" element={<QrGenerate />} />
          <Route path="/pay/contact" element={<PayContact />} />
          <Route path="/pay/number" element={<PayNumber />} />
          <Route path="/pay/bank" element={<BankTransfer />} />
          <Route path="/pay/processing" element={<TransactionProcess />} />
          <Route path="/history" element={<History />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/ai-advisor" element={<AiAdvisor />} />
        </Route>
      </Routes>
    </Router>
    </>
  );
}

export default App;
