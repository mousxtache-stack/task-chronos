import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, X, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type AlertType = "success" | "error" | "warning" | "info";

interface ModernAlertProps {
  title: string;
  message?: string;
  type?: AlertType;
  duration?: number;
  onClose?: () => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export function ModernAlert({
  title,
  message,
  type = "info",
  duration = 5000,
  onClose,
  position = "top-right",
}: ModernAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) setTimeout(onClose, 300); // Allow exit animation to complete
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) setTimeout(onClose, 300); // Allow exit animation to complete
  };

  // Map alert type to styles
  const alertStyles = {
    success: {
      bg: "bg-gradient-to-r from-emerald-500 to-green-500",
      icon: <CheckCircle className="h-5 w-5 text-white" />,
    },
    error: {
      bg: "bg-gradient-to-r from-red-500 to-rose-500",
      icon: <AlertCircle className="h-5 w-5 text-white" />,
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-500 to-yellow-500",
      icon: <AlertTriangle className="h-5 w-5 text-white" />,
    },
    info: {
      bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
      icon: <Info className="h-5 w-5 text-white" />,
    },
  };

  // Position styles
  const positionStyles = {
    "top-right": "fixed top-4 right-4",
    "top-left": "fixed top-4 left-4",
    "bottom-right": "fixed bottom-4 right-4",
    "bottom-left": "fixed bottom-4 left-4",
    "top-center": "fixed top-4 left-1/2 transform -translate-x-1/2",
    "bottom-center": "fixed bottom-4 left-1/2 transform -translate-x-1/2",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "z-50 max-w-sm rounded-lg shadow-lg",
            positionStyles[position]
          )}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-900">
            <div className={cn("flex items-center justify-center px-4", alertStyles[type].bg)}>
              {alertStyles[type].icon}
            </div>
            
            <div className="flex-1 p-4">
              <div className="flex justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {message && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{message}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ModernAlertContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col items-end justify-start gap-2 p-4 z-50">
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
} 