import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import Guesthome from "./Pages/Guesthome";
import HowItWorks from "./Pages/HowItWorks";
import Footer from "./compoents/Footer/Footer";
import Resgitre from "./Pages/user/Resgitre";
import Auth from "./Pages/user/Auth";
import Dashboard from "./Pages/user/Dashboard";
import Verified from "./Pages/user/Verified";
import AuthPopupComplete from "./Pages/user/AuthPopupComplete";
import VideosUser from "./Pages/user/VideosUser";
import Reward from "./Pages/user/Reward";
import Withdraw from "./Pages/user/Withdraw";
import Historique from "./Pages/user/Historique";
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './contexts/UserContext';
import './utils/mockApiSetup'; // Setup mock API for development

function App() {
  return (
    <UserProvider>
      <Router>
        <TitleManager />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Guesthome/>} />
          <Route path="/how-it-works" element={<HowItWorks/>} />
          <Route path="/signup" element={<Resgitre/>} />
          <Route path="/verify" element={<Verified/>} />
          <Route path="/auth/popup-complete" element={<AuthPopupComplete/>} />
          <Route path="/signin" element={<Auth/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/videos-user" element={<VideosUser/>} />
          <Route path="/reward" element={<Reward/>} />
          <Route path="/withdraw" element={<Withdraw/>} />
          <Route path="/historique" element={<Historique/>} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </UserProvider>
  );
}

function TitleManager() {
  const location = useLocation();
  useEffect(() => {
    const route = location.pathname;
    const map = {
      "/": "Timipay – Watch ads, earn money",
      "/how-it-works": "How it works – Timipay",
      "/signin": "Sign in – Timipay",
      "/signup": "Create account – Timipay",
      "/auth/popup-complete": "Completing sign-in – Timipay",
      "/verify": "Verify your email – Timipay",
      "/dashboard": "Dashboard – Timipay",
      "/videos-user": "Videos – Timipay",
      "/reward": "Rewards – Timipay",
      "/withdraw": "Withdraw – Timipay",
      "/historique": "History – Timipay",
    };
    const defaultTitle = "Timipay";
    document.title = map[route] || defaultTitle;
  }, [location.pathname]);
  return null;
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch (_) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);
  return null;
}

export default App;
