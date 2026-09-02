import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AuthProvider } from '../src/contexts/AuthContext';

// Polyfill DOMException for React Native / Hermes
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).DOMException === 'undefined') {
  (globalThis as any).DOMException = class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name || 'DOMException';
    }
  };
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: '#0F1115' }}>
        <StatusBar style="light" backgroundColor="#0F1115" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F1115' } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </AuthProvider>
  );
}
