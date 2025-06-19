// screens/SplashScreen.tsx
import React, { useEffect } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import Logo from '../components/Logo'

interface SplashScreenProps {
  onFinish: () => void
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { theme } = useTheme()
  const fadeAnim = new Animated.Value(0)

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    // Auto-transition after 500ms
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onFinish()
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#eae2b7', // Golden background from design
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Logo size="large" showText={true} />
    </Animated.View>
  )
}

export default SplashScreen