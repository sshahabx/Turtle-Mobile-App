/**
 * Root Layout
 * 
 * Main app layout with font loading and providers.
 * Handles navigation structure for auth and main app flows.
 * Initializes notification service on app launch.
 */

import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { View, ActivityIndicator, Text, StyleSheet, useColorScheme, AppState, AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "../hooks/useFonts";
import { lightColors, darkColors } from "../theme/colors";
import { ToastProvider } from "../components/ui/Toast";
import { NotificationErrorHandler } from "../components/notifications/NotificationErrorHandler";
import { queryClient } from "../services/queryClient";

/**
 * Loading screen displayed while fonts are loading
 */
function LoadingScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  
  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
    </View>
  );
}

export default function RootLayout() {
  const { fontsLoaded, fontError } = useFonts();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  const appState = useRef(AppState.currentState);
  const notificationCleanup = useRef<(() => void) | null>(null);

  // Initialize notification service on app launch
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Use minimal notification init to avoid module loading issues
        const { initializeNotifications, setupNotificationListeners, cleanupNotifications } = 
          await import('../services/notifications/notificationInit');
        
        await initializeNotifications();
        notificationCleanup.current = setupNotificationListeners();
      } catch (error) {
        console.error('Failed to initialize notification service:', error);
      }
    };

    initNotifications();

    // Handle app state changes (background/foreground)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        console.log('App has come to the foreground');
      }
      appState.current = nextAppState;
    });

    // Cleanup on unmount
    return () => {
      subscription.remove();
      if (notificationCleanup.current) {
        notificationCleanup.current();
      }
    };
  }, []);

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return <LoadingScreen />;
  }

  // Log font error but continue with fallback fonts
  if (fontError) {
    console.warn('Font loading error, using fallback fonts:', fontError.message);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <NotificationErrorHandler />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen 
                name="modals/add-job" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
              <Stack.Screen 
                name="modals/edit-job" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/add-note" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
              <Stack.Screen 
                name="modals/edit-note" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
              <Stack.Screen 
                name="modals/add-task" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
              <Stack.Screen 
                name="modals/edit-task" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
              <Stack.Screen 
                name="modals/add-habit" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
              <Stack.Screen 
                name="modals/edit-habit" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
              <Stack.Screen 
                name="modals/offer-details" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/offer-details-replace" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/accepted-confirm" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/goal-setting" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/notifications" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
              <Stack.Screen 
                name="job/[id]" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
              <Stack.Screen 
                name="note/[id]" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
              <Stack.Screen 
                name="task/[id]" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
              <Stack.Screen 
                name="habit/[id]" 
                options={{ 
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }} 
              />
            </Stack>
        </ToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'System',
  },
});
