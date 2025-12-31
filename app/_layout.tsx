/**
 * Root Layout
 * 
 * Main app layout with font loading and providers.
 * Handles navigation structure for auth and main app flows.
 */

import { Stack } from "expo-router";
import { View, ActivityIndicator, Text, StyleSheet, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "../hooks/useFonts";
import { lightColors, darkColors } from "../theme/colors";
import { ToastProvider } from "../components/ui/Toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

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
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen 
                name="modals/add-job" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/edit-job" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/add-note" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/edit-note" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/add-task" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/edit-task" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/add-habit" 
                options={{ presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="modals/edit-habit" 
                options={{ presentation: 'modal' }} 
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
              <Stack.Screen name="job/[id]" />
              <Stack.Screen name="note/[id]" />
              <Stack.Screen name="task/[id]" />
              <Stack.Screen name="habit/[id]" />
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
