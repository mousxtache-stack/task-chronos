import React, { createContext, useContext, useState, useCallback } from 'react';
import { ModernAlert } from '@/components/ui/modern-alert';

type AlertType = "success" | "error" | "warning" | "info";

interface Alert {
  id: string;
  title: string;
  message?: string;
  type: AlertType;
  duration?: number;
}

interface AlertContextType {
  alerts: Alert[];
  showAlert: (title: string, message?: string, type?: AlertType, duration?: number) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback(
    (title: string, message?: string, type: AlertType = 'info', duration: number = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id, title, message, type, duration },
      ]);

      if (duration > 0) {
        setTimeout(() => {
          removeAlert(id);
        }, duration + 300); // Add extra time for animation
      }
      
      return id;
    },
    [removeAlert]
  );

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
      <div className="fixed inset-0 pointer-events-none flex flex-col items-end justify-start gap-2 p-4 z-50">
        {alerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <ModernAlert
              title={alert.title}
              message={alert.message}
              type={alert.type}
              duration={alert.duration}
              onClose={() => removeAlert(alert.id)}
            />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  
  return context;
} 