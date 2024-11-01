import Module from "module";

export const mockChartData = [
  {
    date: "Jan",
    price: 42000,
    volume: 12000,
    ma7: 41000,
    ma25: 40500,
    rsi: 65,
  },
  {
    date: "Feb",
    price: 44500,
    volume: 15000,
    ma7: 43000,
    ma25: 41000,
    rsi: 70,
  },
  {
    date: "Mar",
    price: 47000,
    volume: 18000,
    ma7: 45000,
    ma25: 42000,
    rsi: 75,
  },
  {
    date: "Apr",
    price: 45000,
    volume: 16000,
    ma7: 46000,
    ma25: 43000,
    rsi: 60,
  },
  {
    date: "May",
    price: 49000,
    volume: 20000,
    ma7: 47000,
    ma25: 44000,
    rsi: 80,
  },
];

export const modules: Module[] = [
  {
    id: 1,
    title: "Blockchain Fundamentals",
    description: "Core concepts of blockchain technology",
    reward: 100,
    duration: "4 hours",
    level: "Beginner",
    chapters: [
      {
        id: 1,
        title: "What is Blockchain?",
        content: "Comprehensive introduction to blockchain...",
        quizzes: [
          {
            id: 1,
            question: "What is the main feature of blockchain?",
            options: [
              "Decentralization",
              "Centralization",
              "Customization",
              "Modification",
            ],
            correctAnswer: 0,
            reward: 10,
          },
        ],
        practice: [
          {
            id: 1,
            title: "Create a Simple Block",
            description: "Practice creating a basic block structure",
            reward: 20,
          },
        ],
      },
    ],
  },
];
