import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Markets from "./components/Markets";
import Trade from "./components/Trade";
import Learn from "./components/Learn";
import { getCurrentUser } from "./services/authService";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import NFTMarket from "./components/NFTMarket";
import CreateNFT from "./components/CreateNFT";
import CryptoCasino from "./components/CryptoCasino";
import { TransactionsPage } from "./components/TransactionsPage";
import CryptoHoldingsDisplay from "./components/CryptoHoldingsDisplay";

// Enhanced ProtectedRoute component with user ID handling
const ProtectedRoute = ({
  children,
  requiresUserId = false,
}: {
  children: JSX.Element;
  requiresUserId?: boolean;
}) => {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For casino route, ensure user has an ID
  if (requiresUserId) {
    if (!user.id) {
      console.error("User session is invalid. Please log in again.");
      // Clear invalid session
      localStorage.removeItem("token");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
};

// Public Route Component - redirects logged-in users away from auth pages
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const user = getCurrentUser();
  const location = useLocation();

  if (
    user &&
    (location.pathname === "/login" || location.pathname === "/register")
  ) {
    return <Navigate to="/markets" replace />;
  }

  return children;
};
const DashboardRoute = () => {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Dashboard user={user} />;
};

// Casino wrapper component to handle user ID injection
const CasinoWrapper = () => {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user || !user.id) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if userId is already in URL
  const searchParams = new URLSearchParams(window.location.search);
  const currentUserId = searchParams.get("userId");

  // Only update URL if userId isn't already present or is different
  if (!currentUserId || currentUserId !== user.id) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?userId=${user.id}`
    );
  }

  return <CryptoCasino />;
};

function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-[#181818] text-white">
      <header>
        <Navbar />
      </header>
      <main className="flex-grow w-full max-w-[100vh] mx-auto mt-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <div className="min-h-screen text-black">
                    <Home />
                  </div>
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <div className="min-h-screen text-black">
                    <Login />
                  </div>
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <div className="min-h-screen text-black">
                    <Register />
                  </div>
                </PublicRoute>
              }
            />
            <Route
              path="/markets"
              element={
                <ProtectedRoute>
                  <Markets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trade/:pair"
              element={
                <ProtectedRoute>
                  <Trade />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRoute />
                </ProtectedRoute>
              }
            />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route
              path="/crypto-holdings"
              element={<CryptoHoldingsDisplay />}
            />
            <Route
              path="/nft-market"
              element={
                <ProtectedRoute>
                  <NFTMarket />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-nft"
              element={
                <ProtectedRoute>
                  <CreateNFT />
                </ProtectedRoute>
              }
            />
            <Route path="/learn" element={<Learn />} />
            <Route
              path="/crypto-casino"
              element={
                <ProtectedRoute requiresUserId={true}>
                  <CasinoWrapper />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
