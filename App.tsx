// App.tsx - Fixed with FontAwesome initialization
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@rneui/themed'
import { rneTheme } from './theme/createRNEUITheme'
import AppNavigator from './navigation/AppNavigator'

// CRITICAL: Import the fontAwesome utility to initialize the library
import './utils/fontAwesome'

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={rneTheme}>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}