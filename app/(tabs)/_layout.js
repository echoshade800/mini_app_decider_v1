import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingTop: 5,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wheel',
          tabBarIcon: ({ size, color }) => (
            <FontAwesome5 name="compact-disc" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="random"
        options={{
          title: 'Number',
          tabBarIcon: ({ size, color }) => (
            <FontAwesome5 name="sort-numeric-down" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coin"
        options={{
          title: 'Coin',
          tabBarIcon: ({ size, color }) => (
            <FontAwesome5 name="coins" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}