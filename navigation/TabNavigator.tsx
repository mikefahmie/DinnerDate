// navigation/TabNavigator.tsx - Ensure tabs are always visible
import React from 'react'
import { Platform } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Icon } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Import screens
import RestaurantDiscoveryScreen from '../screens/RestaurantDiscoveryScreen'
import FavoritesScreen from '../screens/FavoritesScreen'
import ProfileScreen from '../screens/ProfileScreen'
import DiscoveryWizardScreen from '../screens/DiscoveryWizard'

import { MainTabParamList } from '../types/navigation'

const Tab = createBottomTabNavigator<MainTabParamList>()

const TabNavigator: React.FC = () => {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  
  // Calculate tab bar height dynamically
  const getTabBarHeight = () => {
    const baseHeight = 60
    const extraPadding = Platform.OS === 'android' ? 80 : 20
    return baseHeight + Math.max(insets.bottom, extraPadding)
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
          paddingBottom: Platform.OS === 'android' ? 80 : Math.max(insets.bottom, 20),
          paddingTop: 10,
          position: 'absolute', // Keep this to ensure it overlays content
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: theme.colors.textPrimary,
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
        // Force tabs to be visible on all screens
        tabBarHideOnKeyboard: false,
        tabBarVisibilityAnimationConfig: {
          show: { animation: 'timing', config: { duration: 200 } },
          hide: { animation: 'timing', config: { duration: 200 } },
        },
      }}
      // Ensure tab bar is always shown
      screenListeners={{
        tabPress: (e) => {
          // Prevent default behavior and ensure tab navigation works
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