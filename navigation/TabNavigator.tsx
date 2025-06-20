// navigation/TabNavigator.tsx - Home button that keeps tabs visible
import React from 'react'
import { Platform } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Icon } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'

// Import screens
import RestaurantDiscoveryScreen from '../screens/RestaurantDiscoveryScreen'
import FavoritesScreen from '../screens/FavoritesScreen'
import ProfileScreen from '../screens/ProfileScreen'
import DiscoveryWizardScreen from '../screens/DiscoveryWizard'

import { MainTabParamList } from '../types/navigation'

const Tab = createBottomTabNavigator<MainTabParamList>()

const TabNavigator: React.FC = () => {
  const { theme } = useTheme()
  
  // Get safe bottom padding for Android
  const getTabBarHeight = () => {
    const baseHeight = 60
    if (Platform.OS === 'android') {
      // Add extra padding for Android navigation bar
      return baseHeight + 80
    }
    return baseHeight
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.divider,
          borderTopWidth: 1,
          height: getTabBarHeight(),
          paddingBottom: Platform.OS === 'android' ? 80 : 20, // Extra padding for Android
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8, // Android shadow
          shadowColor: theme.colors.textPrimary, // iOS shadow
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.caption,
          fontWeight: '600',
          marginBottom: Platform.OS === 'android' ? 5 : 0,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      <Tab.Screen
        name="Discovery"
        component={RestaurantDiscoveryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="search"
              type="feather"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={DiscoveryWizardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="refresh-cw"
              type="feather"
              size={size}
              color={color}
            />
          ),
          tabBarLabel: 'Start Fresh',
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="heart"
              type="feather"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="user"
              type="feather"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

export default TabNavigator
