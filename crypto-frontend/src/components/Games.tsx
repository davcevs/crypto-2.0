import SlotMachine from "./SlotMachine";
import Roulette from "./Roulette";
import Blackjack from "./Blackjack";

export const games = [
  {
    title: "Slots of Fortune",
    imageSrc: "./../src/assets/1.png.webp",
    category: "Slots",
    bgColor: "bg-gradient-to-br from-yellow-400 to-red-500",
    component: SlotMachine,
  },
  {
    title: "Roulette Royale",
    imageSrc: "/api/placeholder/400/320",
    category: "Table Games",
    bgColor: "bg-gradient-to-br from-green-600 to-blue-600",
    component: Roulette,
  },
  {
    title: "Blackjack Pro",
    imageSrc: "/api/placeholder/400/320",
    category: "Card Games",
    bgColor: "bg-gradient-to-br from-purple-600 to-pink-600",
    component: Blackjack,
  },
];
