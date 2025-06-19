// components/HeaderLogo.tsx - Component for header wordmark
import React from 'react'
import { Image, View } from 'react-native'
import { useTheme } from '../hooks/useTheme'

interface HeaderLogoProps {
  height?: number
  style?: any
}

export default function HeaderLogo({ height = 32, style }: HeaderLogoProps) {
  const { colors } = useTheme()

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <Image
        source={require('../assets/wordmark.png')}
        style={{
          height: height,
          resizeMode: 'contain',
          // Tint the wordmark to match header text color (vanilla)
          tintColor: colors.textOnPrimary,
        }}
      />
    </View>
  )
}