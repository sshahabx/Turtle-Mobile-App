/**
 * Notification Error Handler
 * 
 * Wires up the toast callback to the notification service for error handling.
 * This component must be rendered inside the ToastProvider.
 * 
 * Requirements:
 * - 8.3: Handle storage failures with toast messages
 */

import { useEffect, useCallback } from 'react';
import { useToast } from '../ui/Toast';

export function NotificationErrorHandler(): null {
  const { showToast } = useToast();

  const setupToastCallback = useCallback(async () => {
    try {
      // Use dynamic import to avoid module loading issues with Metro bundler
      const notificationService = await import('../../services/notifications/notificationService');
      
      if (typeof notificationService.setToastCallback === 'function') {
        notificationService.setToastCallback((message: string, variant: 'error' | 'info' | 'success') => {
          showToast(message, variant);
        });
      } else {
        console.warn('[NotificationErrorHandler] setToastCallback not available');
      }
    } catch (error) {
      console.warn('[NotificationErrorHandler] Failed to set up toast callback:', error);
    }
  }, [showToast]);

  useEffect(() => {
    setupToastCallback();

    // Cleanup on unmount
    return () => {
      // Use dynamic import for cleanup as well
      import('../../services/notifications/notificationService')
        .then((notificationService) => {
          if (typeof notificationService.clearToastCallback === 'function') {
            notificationService.clearToastCallback();
          }
        })
        .catch(() => {
          // Ignore cleanup errors
        });
    };
  }, [setupToastCallback]);

  // This component doesn't render anything
  return null;
}

export default NotificationErrorHandler;
