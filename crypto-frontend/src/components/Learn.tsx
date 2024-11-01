import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChartAnalysis } from "./../components/ChartAnalysis";
import { LearningModule } from "./../components/LearningModule";
import { RewardsSystem } from "./../components/RewardsSystem";
import { modules } from "./../data/mockData";

const Learn = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "modules", label: "Learning Modules" },
    { id: "analysis", label: "Chart Analysis" },
    { id: "rewards", label: "Rewards" },
  ];

  return (
    <div className="min-h-screen bg-black p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        <header className="text-center mb-16">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold mb-4 text-[#F0B90B]"
          >
            Crypto University
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-xl"
          >
            Master cryptocurrency trading through interactive learning
          </motion.p>
        </header>

        <nav className="mb-12">
          <ul className="flex justify-center space-x-6">
            {tabs.map((tab) => (
              <motion.li
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#F0B90B] text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              </motion.li>
            ))}
          </ul>
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 rounded-xl p-8 shadow-xl"
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-[#F0B90B]">
                    Start Your Journey
                  </h2>
                  <p className="text-gray-300">
                    Welcome to Crypto University. Begin your journey to becoming
                    a skilled cryptocurrency trader with our comprehensive
                    learning platform.
                  </p>
                  <button className="bg-[#F0B90B] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#F0B90B]/90 transition-colors">
                    Get Started
                  </button>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-[#F0B90B] mb-4">
                    Your Progress
                  </h3>
                  {/* Progress metrics would go here */}
                </div>
              </div>
            )}
            {activeTab === "modules" && <LearningModule modules={modules} />}
            {activeTab === "analysis" && <ChartAnalysis />}
            {activeTab === "rewards" && <RewardsSystem />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Learn;
