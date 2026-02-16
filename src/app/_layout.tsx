// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { hasJwt } from '../app/utils/index';

const BG = '#0A0812';

export default function RootLayout() {
  const router   = useRouter();
  const segments = useSegments();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokenExists = await hasJwt();
        const inAuth      = segments[0] === '(auth)';
        const inTabs      = segments[0] === '(tabs)';

        if (!tokenExists && !inAuth) {
          // Pas de token → page de bienvenue
          router.replace('/(auth)/welcome');
        } else if (tokenExists && inAuth) {
          // Token présent mais sur une page auth → accueil
          router.replace('/(tabs)');
        }
      } catch (err) {
        console.error('[AUTH] Erreur vérification token:', err);
        router.replace('/(auth)/welcome');
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <View style={s.splash}>
        <ActivityIndicator color="#A78BFA" size="large" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)"  options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"  options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

const s = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
});