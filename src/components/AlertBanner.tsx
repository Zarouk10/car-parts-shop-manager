
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AlertBannerProps {
  title: string;
  message: string;
  type: 'warning' | 'error' | 'info' | 'success';
  onDismiss?: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ title, message, type, onDismiss }) => {
  const getAlertClasses = () => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <Alert className={`mb-4 ${getAlertClasses()}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {title}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 p-1 hover:bg-black/10 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default AlertBanner;
