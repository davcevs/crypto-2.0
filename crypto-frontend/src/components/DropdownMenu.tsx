import React from "react";
import { Menu } from "@headlessui/react";
import { motion } from "framer-motion";

interface DropdownMenuProps {
  title: string;
  items: { name: string; href: string }[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ title, items }) => {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="text-gray-300 hover:text-white">
        {title}
      </Menu.Button>
      <Menu.Items className="absolute mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
        {items.map((item, index) => (
          <Menu.Item key={index}>
            {({ active }) => (
              <motion.a
                href={item.href}
                className={`block px-4 py-2 text-sm text-gray-200 ${
                  active ? "bg-gray-700" : ""
                }`}
                whileHover={{ scale: 1.02 }}
              >
                {item.name}
              </motion.a>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
};

export default DropdownMenu;
