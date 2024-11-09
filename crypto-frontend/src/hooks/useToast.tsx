import React from "react";
import { createRoot } from "react-dom/client";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastColors = (type: ToastProps["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg text-white shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${getToastColors(type)}`}
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const useToast = () => {
  const show = React.useCallback(
    (type: ToastProps["type"], message: string) => {
      const containerElement = document.createElement("div");
      document.body.appendChild(containerElement);

      const root = createRoot(containerElement);

      const closeToast = () => {
        root.unmount();
        document.body.removeChild(containerElement);
      };

      root.render(<Toast message={message} type={type} onClose={closeToast} />);
    },
    []
  );

  return {
    showToast: show,
    success: (message: string) => show("success", message),
    error: (message: string) => show("error", message),
    warning: (message: string) => show("warning", message),
    info: (message: string) => show("info", message),
  };
};
