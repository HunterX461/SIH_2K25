import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { initializeGeofencing } from '@/modules/geofencing';

export default function RootLayout() {
  useFrameworkReady();

  // Initialize geofencing service on app startup
  useEffect(() => {
    const setupGeofencing = async () => {
      try {
        console.log('Setting up geofencing service...');
        
        // Initialize with default configuration
        const initialized = await initializeGeofencing({
          backendBaseUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000',
          enableLocationTracking: true,
          locationUpdateInterval: 5000, // 5 seconds
        });

        if (initialized) {
          console.log('Geofencing service initialized successfully');
        } else {
          console.warn('Geofencing service initialization failed');
        }
      } catch (error) {
        console.error('Error setting up geofencing:', error);
      }
    };

    // Initialize geofencing after component mounts
    setupGeofencing();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
