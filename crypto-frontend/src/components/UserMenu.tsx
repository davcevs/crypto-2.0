import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, User } from "lucide-react";

interface UserMenuProps {
  user: any;
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  userMenuOpen,
  setUserMenuOpen,
  handleLogout,
}) => {
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white"
      >
        <User size={20} />
        <span>{user.email}</span>
        <ChevronDown size={16} />
      </motion.button>

      <AnimatePresence>
        {userMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg py-1"
          >
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
