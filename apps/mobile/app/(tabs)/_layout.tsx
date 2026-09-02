import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#B4FF39',
        tabBarInactiveTintColor: '#6B7280',
        sceneStyle: { backgroundColor: '#0F1115' }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
        }}
      />
      <Tabs.Screen
        name="visits"
        options={{
          title: 'Visitas',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#161922',
    borderTopWidth: 1,
    borderTopColor: '#2B3145',
    paddingVertical: 10,
    height: 60,
  },
});
