import { useState } from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { Module } from "../../types/types";

export const LearningModule = ({ module }: { module: Module }) => {
  const [activeChapter, setActiveChapter] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#181A20] p-6 rounded-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#F0B90B]">{module.title}</h2>
        <span className="px-4 py-2 bg-[#2B2F36] text-white rounded-full">
          {module.level}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 bg-[#2B2F36] p-4 rounded-lg">
          {module.chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveChapter(index)}
              className={`p-4 rounded-lg cursor-pointer mb-2 ${
                activeChapter === index
                  ? "bg-[#F0B90B] text-black"
                  : "text-white"
              }`}
            >
              <h3 className="font-medium">{chapter.title}</h3>
            </motion.div>
          ))}
        </div>

        <div className="col-span-2 bg-[#2B2F36] p-6 rounded-lg">
          <motion.div
            key={activeChapter}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {module.chapters[activeChapter].title}
            </h3>
            <p className="text-[#848E9C] mb-6">
              {module.chapters[activeChapter].content}
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="text-[#F0B90B] font-medium mb-4">
                  Practice Exercise
                </h4>
                {module.chapters[activeChapter].practice.map((exercise) => (
                  <motion.div
                    key={exercise.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#181A20] p-4 rounded-lg mb-2"
                  >
                    <h5 className="text-white font-medium">{exercise.title}</h5>
                    <p className="text-[#848E9C] text-sm mt-2">
                      {exercise.description}
                    </p>
                    <div className="flex items-center text-[#F0B90B] mt-2">
                      <Award className="w-4 h-4 mr-2" />
                      <span>{exercise.reward} tokens</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
