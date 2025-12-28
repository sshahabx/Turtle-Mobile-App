import { Stack } from "expo-router";

/**
 * Auth Layout
 * Layout for authentication screens (sign-in)
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}
