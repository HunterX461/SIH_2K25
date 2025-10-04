import { Tabs } from 'expo-router';
import { Shield, MapPin, User, TriangleAlert as AlertTriangle, Settings } from 'lucide-react-native';
// --- 1. IMPORT THE HOOK TO READ THE TOURIST ID ---
import { useGlobalSearchParams } from 'expo-router';

export default function TabLayout() {
  // --- 2. GET THE TOURIST ID FROM THE GLOBAL NAVIGATION STATE ---
  const { touristId } = useGlobalSearchParams<{ touristId: string }>();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Shield size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Maps',
          tabBarIcon: ({ size, color }) => (
            <MapPin size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: 'Emergency',
          tabBarIcon: ({ size, color }) => (
            <AlertTriangle size={size} color={color} />
          ),
          // --- 3. THIS IS THE CRITICAL CHANGE ---
          // This line dynamically builds the link for the emergency tab.
          // If a touristId exists, it creates a link like "/emergency?touristId=23".
          // If not, it just links to "/emergency".
          href: touristId ? `/emergency?touristId=${touristId}` : '/emergency',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}