import { useState } from "react";
import { motion } from "framer-motion";
import { Book, Video, Award, ChevronRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  image: string;
}

const Learn = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const courses: Course[] = [
    {
      id: "1",
      title: "Introduction to Cryptocurrency",
      description: "Learn the basics of blockchain and cryptocurrency trading",
      level: "Beginner",
      duration: "2 hours",
      image: "/api/placeholder/400/225",
    },
    {
      id: "2",
      title: "Technical Analysis Fundamentals",
      description: "Master the art of reading charts and identifying patterns",
      level: "Intermediate",
      duration: "4 hours",
      image: "/api/placeholder/400/225",
    },
    {
      id: "3",
      title: "Advanced Trading Strategies",
      description: "Learn professional trading techniques and risk management",
      level: "Advanced",
      duration: "6 hours",
      image: "/api/placeholder/400/225",
    },
  ];

  const filteredCourses =
    selectedLevel === "all"
      ? courses
      : courses.filter((course) => course.level === selectedLevel);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-gradient-to-b from-blue-600/20 to-transparent"
      >
        <h1 className="text-4xl font-bold mb-4 text-white">
          Learn to Trade Like a Pro
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Access our comprehensive library of trading courses, tutorials, and
          resources to build your cryptocurrency trading knowledge and skills.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-900 p-6 rounded-xl"
          >
            <Book className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Comprehensive Courses
            </h3>
            <p className="text-gray-400">
              From beginner to advanced, our structured courses cover everything
              you need to know about trading.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-900 p-6 rounded-xl"
          >
            <Video className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Video Tutorials
            </h3>
            <p className="text-gray-400">
              Watch expert traders explain concepts and demonstrate strategies
              in detailed video lessons.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-900 p-6 rounded-xl"
          >
            <Award className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Earn Certificates
            </h3>
            <p className="text-gray-400">
              Complete courses and earn certificates to showcase your trading
              knowledge.
            </p>
          </motion.div>
        </div>

        {/* Course Filter */}
        <div className="flex space-x-4 mb-8 justify-center">
          <button
            onClick={() => setSelectedLevel("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedLevel === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            All Levels
          </button>
          <button
            onClick={() => setSelectedLevel("Beginner")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedLevel === "Beginner"
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Beginner
          </button>
          <button
            onClick={() => setSelectedLevel("Intermediate")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedLevel === "Intermediate"
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Intermediate
          </button>
          <button
            onClick={() => setSelectedLevel("Advanced")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedLevel === "Advanced"
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Courses List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-lg"
            >
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-400 mb-4">{course.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">{course.duration}</span>
                  <button className="text-blue-500 flex items-center">
                    Learn More <ChevronRight className="ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Learn;
