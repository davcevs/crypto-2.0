// Sidebar.tsx
const categories = [
  "Popular",
  "Slots",
  "Table Games",
  "Live Casino",
  "Jackpots",
  "New Games",
];

const Sidebar = () => {
  return (
    <div className="w-72 bg-violet-700 rounded border-r border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
          Categories
        </h2>
        <ul className="mt-4">
          {categories.map((category) => (
            <li
              key={category}
              className="text-gray-300 mb-4 cursor-pointer hover:text-white transition duration-300 transform hover:translate-x-2"
            >
              {category}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
