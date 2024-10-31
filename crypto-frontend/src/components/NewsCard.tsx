// NewsCard.tsx
import React from "react";
import { motion } from "framer-motion";

const NewsCard: React.FC<{
  news: { title: string; summary: string; url: string };
}> = ({ news }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-gray-900 border border-gray-800 rounded-lg p-6"
  >
    <h3 className="font-semibold text-xl mb-2">{news.title}</h3>
    <p className="text-gray-400 mb-4">{news.summary}</p>
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:underline"
    >
      Read More
    </a>
  </motion.div>
);

export default NewsCard;
