// App.tsx - Updated with AppNavigator and centralized theme
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@rneui/themed'
import { rneTheme } from './theme/createRNEUITheme'
import AppNavigator from './navigation/AppNavigator'

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={rneTheme}>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}