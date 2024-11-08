// components/Dashboard.tsx
import { Loader2 } from "lucide-react";
import DashboardLogic from "../Logic/DashboardLogic";
import DashboardUI from "./DashboardUI";
import QuickTradePanel from "./QuickTradePanel";
import { useState, useCallback, useEffect } from "react";

interface UserData {
  user: {
    id: string;
  };
}

const Dashboard = () => {
  const { wallet, stats, loading, error, fetchWalletData } = DashboardLogic();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const userData = JSON.parse(
      localStorage.getItem("user") || "{}"
    ) as UserData;
    if (userData.user?.id) {
      setUserId(userData.user.id);
    }
  }, []);

  const handleTradeComplete = useCallback(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return (
    <div className="p-6 space-y-6">
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="my-4 p-4 bg-red-500/10 text-red-500 rounded">
          <p>{error}</p>
        </div>
      )}

      {wallet && userId && (
        <>
          <QuickTradePanel
            onTradeComplete={handleTradeComplete}
            wallet={wallet}
            userId={userId}
          />
          <DashboardUI wallet={wallet} stats={stats} />
        </>
      )}

      {!wallet && !loading && !error && (
        <div className="my-4 p-4 bg-yellow-200 text-yellow-800 rounded">
          <p>No wallet data available</p>
        </div>
      )}

      {!userId && !loading && (
        <div className="my-4 p-4 bg-yellow-200 text-yellow-800 rounded">
          <p>Please log in to access your wallet</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
