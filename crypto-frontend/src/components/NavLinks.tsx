// NavLinks.tsx
import { Link } from "react-router-dom";

interface NavLink {
  name: string;
  path: string;
  protected: boolean;
}

const navItems: NavLink[] = [
  { name: "Markets", path: "/markets", protected: true },
  { name: "Trade", path: "/trade/btc-usdt", protected: true },
  { name: "Learn", path: "/learn", protected: false },
];

const NavLinks = ({
  user,
  location,
  mobile,
  onClick,
}: {
  user: any;
  location: any;
  mobile?: boolean;
  onClick?: () => void;
}) => (
  <>
    {navItems.map(
      (item) =>
        (!item.protected || user) && (
          <Link
            key={item.path}
            to={item.path}
            className={`block ${
              mobile ? "px-3 py-2 text-base" : "text-sm"
            } font-medium transition-colors ${
              location.pathname === item.path
                ? "text-blue-500"
                : "text-gray-300 hover:text-white"
            }`}
            onClick={mobile ? onClick : undefined}
          >
            {item.name}
          </Link>
        )
    )}
  </>
);

export default NavLinks;
