// navigation/AppNavigator.tsx - Fixed navigation types
import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useTheme } from '../hooks/useTheme'

// Import the navigation types
import { RootStackParamList } from '../types/navigation'

// Screens
import SplashScreen from '../screens/SplashScreen'
import AuthScreen from '../screens/AuthScreen'
import DiscoveryWizardScreen from '../screens/DiscoveryWizard'
import RestaurantDiscoveryScreen from '../screens/RestaurantDiscoveryScreen'
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen'
import FavoritesScreen from '../screens/FavoritesScreen'
import TabNavigator from './TabNavigator'

const RootStack = createNativeStackNavigator<RootStackParamList>()

const AppNavigator: React.FC = () => {
  const { theme } = useTheme()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSplashFinish = () => {
    setShowSplash(false)
  }

  const handleAuthSuccess = () => {
    // Auth success is handled by the auth state change listener
  }

  const handleGuestMode = () => {
    // For guest mode, we can set a flag or navigate directly
    setSession(null) // Explicitly set no session for guest
  }

  const screenOptions = {
    headerShown: false,
    gestureEnabled: true,
    animation: 'slide_from_right' as const,
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  if (isLoading) {
    return <SplashScreen onFinish={() => {}} />
  }

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          notification: theme.colors.error,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: 'normal',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: 'bold',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      <RootStack.Navigator
        initialRouteName={session ? "MainTabs" : "Auth"}
        screenOptions={screenOptions}
      >
        {!session ? (
          // Auth Stack
          <>
            <RootStack.Screen name="Auth">
              {(props) => (
                <AuthScreen
                  {...props}
                  onAuthSuccess={handleAuthSuccess}
                  onGuestMode={handleGuestMode}
                />
              )}
            </RootStack.Screen>
            <RootStack.Screen 
              name="DiscoveryWizard" 
              component={DiscoveryWizardScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <RootStack.Screen 
              name="RestaurantDiscovery" 
              component={RestaurantDiscoveryScreen}
            />
            <RootStack.Screen 
              name="RestaurantDetail" 
              component={RestaurantDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </>
        ) : (
          // Authenticated Stack
          <>
            <RootStack.Screen 
              name="MainTabs" 
              component={TabNavigator}
            />
            <RootStack.Screen 
              name="DiscoveryWizard" 
              component={DiscoveryWizardScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <RootStack.Screen 
              name="RestaurantDiscovery" 
              component={RestaurantDiscoveryScreen}
            />
            <RootStack.Screen 
              name="RestaurantDetail" 
              component={RestaurantDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator