
// components/LoadingScreen.tsx - Centralized loading screen with logo
import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Text } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import Logo from './Logo'

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  const { styles, colors } = useTheme()

  return (
    <View style={styles.centerContainer}>
      <Logo size="large" showText />
      <ActivityIndicator 
        size="large" 
        color={colors.primary} 
        style={{ marginVertical: 20 }}
      />
      <Text style={[styles.secondaryText, { textAlign: 'center' }]}>
        {message}
      </Text>
    </View>
  )
}