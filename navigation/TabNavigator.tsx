// navigation/TabNavigator.tsx
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { RouteProp } from '@react-navigation/native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import { useFavorites } from '../hooks/useFavorites'

// Screens
import DiscoveryWizardScreen from '../screens/DiscoveryWizard'
import FavoritesScreen from '../screens/FavoritesScreen'
import ProfileScreen from '../screens/ProfileScreen'

// Types
import type { MainTabParamList } from './AppNavigator'

const Tab = createBottomTabNavigator<MainTabParamList>()

interface TabIconProps {
  focused: boolean
  size: number
}

const TabNavigator: React.FC = () => {
  const { theme } = useTheme()
  const { favorites } = useFavorites()

  const getTabBarIcon = (routeName: string, focused: boolean, size: number) => {
    let iconName: string
    let iconType = 'font-awesome'

    switch (routeName) {
      case 'Discovery':
        iconName = focused ? 'search' : 'search'
        break
      case 'Favorites':
        iconName = focused ? 'heart' : 'heart-o'
        break
      case 'Profile':
        iconName = focused ? 'user' : 'user-o'
        break
      default:
        iconName = 'circle'
    }

    return (
      <Icon
        name={iconName}
        type={iconType}
        size={size}
        color={focused ? theme.colors.primary : theme.colors.textMuted}
      />
    )
  }

  const getBadgeCount = (routeName: string): number | undefined => {
    switch (routeName) {
      case 'Favorites':
        return favorites.length > 0 ? favorites.length : undefined
      default:
        return undefined
    }
  }

  return (
    <Tab.Navigator
      initialRouteName="Discovery"
      screenOptions={({ route }: { route: RouteProp<MainTabParamList> }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }: TabIconProps) => 
          getTabBarIcon(route.name, focused, size),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.divider,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
          ...theme.shadows.header,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.caption,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarBadge: getBadgeCount(route.name),
        tabBarBadgeStyle: {
          backgroundColor: theme.colors.error,
          color: theme.colors.textOnPrimary,
          fontSize: theme.typography.fontSize.caption - 2,
          fontWeight: '600',
          minWidth: 18,
          height: 18,
          borderRadius: 9,
        },
      })}
    >
      <Tab.Screen 
        name="Discovery" 
        component={DiscoveryWizardScreen}
        options={{
          tabBarLabel: 'Discover',
          title: 'Discover Restaurants',
        }}
      />
      
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favorites',
          title: 'Your Favorites',
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  )
}

export default TabNavigator