// GameCard.tsx
import React from "react";

interface GameCardProps {
  title: string;
  imageSrc: string;
  category: string;
  bgColor: string;
  onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  imageSrc,
  category,
  bgColor,
  onClick,
}) => {
  return (
    <div
      className={`rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 ${bgColor}`}
    >
      <img
        src={imageSrc}
        alt={title}
        className="w-full h-40 md:h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-300">{category}</p>
        <button
          onClick={onClick}
          className="mt-4 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
        >
          Play Now
        </button>
      </div>
    </div>
  );
};

export default GameCard;
