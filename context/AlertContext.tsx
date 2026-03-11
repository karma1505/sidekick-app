import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { SidekickAlert } from '@/components/ui/SidekickAlert';
import { SidekickToast } from '@/components/ui/SidekickToast';

type AlertType = 'info' | 'success' | 'error' | 'warning' | 'confirm';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  buttons?: AlertButton[];
  type?: AlertType;
  cancelable?: boolean;
}

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  options: AlertOptions;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AlertContextType {
  showAlert: (title: string, message: string, options?: AlertOptions) => void;
  hideAlert: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    options: {},
  });

  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = useCallback((title: string, message: string, options: AlertOptions = {}) => {
    setAlert({
      visible: true,
      title,
      message,
      options: {
        type: 'info',
        ...options,
      },
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, visible: false }));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    setToast({
      visible: true,
      message,
      type,
    });

    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, showToast }}>
      {children}
      <SidekickAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        options={alert.options}
        onClose={hideAlert}
      />
      <SidekickToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
