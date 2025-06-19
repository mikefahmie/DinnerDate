// components/Logo.tsx - Updated to use your actual logo
import React from 'react'
import { View, Image, Text } from 'react-native'
import { useTheme } from '../hooks/useTheme'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  style?: any
}

const logoSizes = {
  small: 40,
  medium: 60,
  large: 80,
}

export default function Logo({ size = 'medium', showText = false, style }: LogoProps) {
  const { theme, styles, colors } = useTheme()
  const logoSize = logoSizes[size]

  return (
    <View style={[styles.center, style]}>
      {/* Your actual logo */}
      <Image
        source={require('../assets/logo.png')}
        style={{
          width: logoSize,
          height: logoSize,
          borderRadius: theme.borderRadius.md,
        }}
        resizeMode="contain"
      />

      {showText && (
        <Text style={[
          size === 'large' ? styles.h1 : styles.h2,
          { 
            color: colors.primary,
            fontWeight: '700',
            textAlign: 'center',
            marginTop: theme.spacing.sm
          }
        ]}>
          DinnerDate
        </Text>
      )}
    </View>
  )
}