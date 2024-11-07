import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Trophy,
  Target,
  Star,
  ArrowUpRight,
  ChevronRight,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockChartData } from "@/data/mockData";

const CryptoAcademy = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const [progress, setProgress] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1W");
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  const mockPerformanceData = [
    { date: "Mon", performance: 75, tokens: 120 },
    { date: "Tue", performance: 82, tokens: 150 },
    { date: "Wed", performance: 88, tokens: 180 },
    { date: "Thu", performance: 85, tokens: 160 },
    { date: "Fri", performance: 92, tokens: 200 },
    { date: "Sat", performance: 95, tokens: 220 },
    { date: "Sun", performance: 98, tokens: 250 },
  ];

  const featuredCourses = [
    {
      id: 1,
      title: "Technical Analysis Mastery",
      level: "Advanced",
      duration: "8 weeks",
      reward: "500 tokens",
      enrolled: 1234,
      rating: 4.8,
      progress: 45,
      chapters: [
        { title: "Introduction to TA", completed: true },
        { title: "Chart Patterns", completed: true },
        { title: "Indicators", completed: false },
        { title: "Advanced Strategies", completed: false },
      ],
    },
    {
      id: 2,
      title: "DeFi Fundamentals",
      level: "Intermediate",
      duration: "6 weeks",
      reward: "350 tokens",
      enrolled: 2156,
      rating: 4.9,
      progress: 75,
      chapters: [
        { title: "What is DeFi?", completed: true },
        { title: "Lending Protocols", completed: true },
        { title: "Yield Farming", completed: true },
        { title: "Risk Management", completed: false },
      ],
    },
  ];

  const achievements = [
    {
      title: "Trading Pioneer",
      description: "Complete your first trade simulation",
      progress: 100,
      tokens: 50,
      completed: true,
    },
    {
      title: "Analysis Expert",
      description: "Master all technical analysis modules",
      progress: 65,
      tokens: 200,
      completed: false,
    },
    {
      title: "Community Leader",
      description: "Help 10 other students with their queries",
      progress: 80,
      tokens: 150,
      completed: false,
    },
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="col-span-2 bg-black/40 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Current Progress
                </h3>
                <p className="text-gray-400">Technical Analysis Course</p>
              </div>
              <Badge className="bg-yellow-400/20 text-yellow-400">
                In Progress
              </Badge>
            </div>
            <Progress value={progress} className="h-2 bg-gray-700">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </Progress>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-gray-400">Weekly Streak</p>
                <p className="text-2xl font-bold text-white">7 Days</p>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-gray-400">Total XP</p>
                <p className="text-2xl font-bold text-white">2,450</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="font-medium text-white">850 Tokens Earned</p>
                <p className="text-sm text-gray-400">Top 10% of users</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Star className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="font-medium text-white">5 Courses Completed</p>
                <p className="text-sm text-gray-400">Expert status achieved</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-3 bg-black/40 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Weekly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockPerformanceData}>
                <defs>
                  <linearGradient
                    id="performanceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#F0B90B" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#F0B90B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2B2F36" />
                <XAxis dataKey="date" stroke="#848E9C" />
                <YAxis stroke="#848E9C" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E1E1E",
                    border: "1px solid #2B2F36",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="performance"
                  stroke="#F0B90B"
                  fill="url(#performanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCourses = () => (
    <motion.div variants={containerVariants} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredCourses.map((course, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="bg-black/40 backdrop-blur p-6 rounded-xl border border-gray-800"
            onClick={() => setSelectedCourse(course)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {course.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-400/20 text-yellow-400">
                    {course.level}
                  </Badge>
                  <span className="text-gray-400 text-sm">
                    {course.duration}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-white">{course.rating}</span>
              </div>
            </div>
            <Progress value={course.progress} className="h-2 bg-gray-700 mt-4">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </Progress>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                Chapters
              </h4>
              <div className="space-y-2">
                {course.chapters.map((chapter, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span
                      className={`${
                        chapter.completed ? "text-yellow-400" : "text-gray-400"
                      }`}
                    >
                      {chapter.title}
                    </span>
                    {chapter.completed && (
                      <Check className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Market Analysis Tools</h2>
        <div className="flex gap-2">
          {["1D", "1W", "1M", "3M"].map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-4 py-2 rounded-lg ${
                selectedTimeframe === tf
                  ? "bg-yellow-400 text-black"
                  : "bg-black/40 text-gray-400"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Price Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2B2F36" />
                  <XAxis dataKey="date" stroke="#848E9C" />
                  <YAxis stroke="#848E9C" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E1E1E",
                      border: "1px solid #2B2F36",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#F0B90B"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ma7"
                    stroke="#E6007A"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">
                Technical Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["RSI", "MACD", "Bollinger Bands"].map((indicator) => (
                  <div
                    key={indicator}
                    className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                  >
                    <span className="text-gray-400">{indicator}</span>
                    <ChevronRight className="w-5 h-5 text-yellow-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">
                Learning Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-yellow-400/10 border-yellow-400/20">
                  <AlertDescription className="text-yellow-400">
                    Complete the Technical Analysis course to unlock advanced
                    indicators
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-black/20 p-6 rounded-lg border border-gray-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {achievement.completed ? (
                        <Trophy className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <Target className="w-8 h-8 text-gray-400" />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-yellow-400 font-bold">
                        {achievement.tokens}
                      </span>
                      <span className="text-gray-400"> tokens</span>
                    </div>
                  </div>
                  <Progress
                    value={achievement.progress}
                    className="h-2 bg-gray-700"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </Progress>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Token Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-black/20 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Available Tokens</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    1,250
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+250</span>
                  <span>this week</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white">Recent Rewards</h4>
                {[
                  {
                    activity: "Course Completion",
                    tokens: 200,
                    date: "2 days ago",
                  },
                  { activity: "Daily Streak", tokens: 50, date: "1 day ago" },
                  {
                    activity: "Quiz Success",
                    tokens: 100,
                    date: "5 hours ago",
                  },
                ].map((reward, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black/20 p-3 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {reward.activity}
                      </p>
                      <p className="text-xs text-gray-400">{reward.date}</p>
                    </div>
                    <span className="text-yellow-400 font-medium">
                      +{reward.tokens}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6 mt-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Crypto Academy</h1>
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="bg-black/40">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                Courses
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                Analysis
              </TabsTrigger>
              <TabsTrigger
                value="rewards"
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                Rewards
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
          >
            {activeSection === "overview" && renderOverview()}
            {activeSection === "courses" && renderCourses()}
            {activeSection === "analysis" && renderAnalysis()}
            {activeSection === "rewards" && renderRewards()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CryptoAcademy;
