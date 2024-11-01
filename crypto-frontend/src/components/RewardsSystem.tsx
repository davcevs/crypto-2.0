import { motion } from "framer-motion";
import { Trophy, Target } from "lucide-react";
import { Achievement } from "../../types/types";

export const RewardsSystem = () => {
  const achievements: Achievement[] = [
    {
      id: 1,
      title: "Blockchain Pioneer",
      description: "Complete all beginner modules",
      icon: "Trophy",
      reward: 500,
      progress: 75,
    },
    // Add more achievements...
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#181A20] p-8 rounded-xl"
    >
      <h2 className="text-2xl font-bold text-[#F0B90B] mb-8">
        Rewards & Achievements
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-[#2B2F36] p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Your Progress</h3>
            <div className="flex items-center text-[#F0B90B]">
              <Trophy className="w-5 h-5 mr-2" />
              <span>1,250 tokens earned</span>
            </div>
          </div>

          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="bg-[#181A20] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">
                    {achievement.title}
                  </h4>
                  <span className="text-[#F0B90B]">
                    {achievement.reward} tokens
                  </span>
                </div>
                <p className="text-[#848E9C] text-sm mb-3">
                  {achievement.description}
                </p>
                <div className="w-full bg-[#2B2F36] rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-[#F0B90B] h-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-[#2B2F36] p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
            Daily Challenges
          </h3>
          <div className="space-y-4">
            <div className="bg-[#181A20] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">Complete 3 Quizzes</h4>
                <span className="text-[#F0B90B]">50 tokens</span>
              </div>
              <div className="flex items-center text-[#848E9C] mt-2">
                <Target className="w-4 h-4 mr-2" />
                <span>Progress: 2/3</span>
              </div>
            </div>
            {/* Add more daily challenges */}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
