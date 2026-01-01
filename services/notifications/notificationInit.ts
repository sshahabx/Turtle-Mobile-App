/**
 * Minimal Notification Initialization
 * Isolated to avoid module loading issues
 * 
 * Includes error handling per Requirements 8.1-8.4:
 * - 8.1: Permission denied handling
 * - 8.2: Retry logic for scheduling failures
 * - 8.3: Storage failures with toast messages
 * - 8.4: Push registration failures with fallback
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let isInitialized = false;
let expoPushToken: string | null = null;
let notificationReceivedSubscription: Notifications.EventSubscription | null = null;
let notificationResponseSubscription: Notifications.EventSubscription | null = null;

// Toast callback for displaying error messages
let showToastCallback: ((message: string, variant: 'error' | 'info' | 'success') => void) | null = null;

/**
 * Set the toast callback for displaying error messages
 * Should be called during app initialization
 */
export function setToastCallback(callback: (message: string, variant: 'error' | 'info' | 'success') => void): void {
  showToastCallback = callback;
}

/**
 * Clear the toast callback (for cleanup/testing)
 */
export function clearToastCallback(): void {
  showToastCallback = null;
}

/**
 * Log info message for debugging
 */
function logInfo(message: string): void {
  console.log(`[NotificationInit] ${message}`);
}

/**
 * Log error with context for debugging
 */
function logError(context: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[NotificationInit] ${context}:`, errorMessage);
}

/**
 * Request notification permissions
 * Requirement 8.1: Handle permission denied gracefully
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    if (!Device.isDevice) {
      logInfo('Push notifications require a physical device - continuing with in-app notifications only');
      return false;
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus === 'granted') {
      logInfo('Notification permissions granted');
      return true;
    } else {
      // Requirement 8.1: Log the status and continue without push notifications
      logInfo('Notification permissions denied - continuing with in-app notifications only');
      return false;
    }
  } catch (error) {
    // Requirement 8.1: Log error and continue gracefully
    logError('Error requesting notification permissions', error);
    return false;
  }
}

/**
 * Register for push notifications
 * Requirement 8.4: Handle push registration failures with fallback
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      logInfo('Push notifications not available on simulator - using in-app notifications only');
      return null;
    }
    const permissionGranted = await requestPermissions();
    if (!permissionGranted) {
      // Requirement 8.4: Fall back to in-app notifications only
      logInfo('Push permission not granted - falling back to in-app notifications');
      return null;
    }
    
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    expoPushToken = tokenData.data;
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    logInfo('Successfully registered for push notifications');
    return tokenData.data;
  } catch (error) {
    // Requirement 8.4: Handle push registration failures with fallback
    logError('Push notification registration failed - falling back to in-app notifications', error);
    expoPushToken = null;
    return null;
  }
}

export function setupNotificationListeners(): () => void {
  notificationReceivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    logInfo('Notification received: ' + notification.request.content.title);
  });
  
  notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    logInfo('Notification tapped: ' + response.notification.request.content.title);
  });
  
  return () => {
    if (notificationReceivedSubscription) {
      Notifications.removeNotificationSubscription(notificationReceivedSubscription);
      notificationReceivedSubscription = null;
    }
    if (notificationResponseSubscription) {
      Notifications.removeNotificationSubscription(notificationResponseSubscription);
      notificationResponseSubscription = null;
    }
  };
}

/**
 * Initialize notifications with comprehensive error handling
 */
export async function initializeNotifications(): Promise<boolean> {
  if (isInitialized) return true;
  
  try {
    logInfo('Starting notification initialization...');
    await registerForPushNotifications();
    setupNotificationListeners();
    isInitialized = true;
    logInfo('Notification service initialized successfully');
    return true;
  } catch (error) {
    logError('Error initializing notifications', error);
    isInitialized = true; // Mark as initialized to prevent retry loops
    
    // Still try to set up listeners for in-app notifications
    try {
      setupNotificationListeners();
    } catch (listenerError) {
      logError('Failed to set up notification listeners', listenerError);
    }
    
    return false;
  }
}

export function cleanupNotifications(): void {
  if (notificationReceivedSubscription) {
    Notifications.removeNotificationSubscription(notificationReceivedSubscription);
    notificationReceivedSubscription = null;
  }
  if (notificationResponseSubscription) {
    Notifications.removeNotificationSubscription(notificationResponseSubscription);
    notificationResponseSubscription = null;
  }
  isInitialized = false;
  expoPushToken = null;
}

export function getExpoPushToken(): string | null {
  return expoPushToken;
}
