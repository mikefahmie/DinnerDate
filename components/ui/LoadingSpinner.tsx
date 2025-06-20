// components/ui/LoadingSpinner.tsx
import React from 'react'
import { View, StyleSheet, Animated, ViewStyle } from 'react-native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  style?: ViewStyle
  animationType?: 'spin' | 'pulse' | 'bounce'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  style,
  animationType = 'spin',
}) => {
  const { theme } = useTheme()
  const animatedValue = React.useRef(new Animated.Value(0)).current

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { iconSize: 16, containerSize: 32 }
      case 'large':
        return { iconSize: 40, containerSize: 80 }
      default: // medium
        return { iconSize: 24, containerSize: 48 }
    }
  }

  const sizeConfig = getSizeConfig()
  const spinnerColor = color || theme.colors.primary

  React.useEffect(() => {
    let animation: Animated.CompositeAnimation

    switch (animationType) {
      case 'spin':
        animation = Animated.loop(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        )
        break
      case 'pulse':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        )
        break
      case 'bounce':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
        )
        break
    }

    animation.start()

    return () => {
      animation.stop()
    }
  }, [animationType, animatedValue])

  const getAnimatedStyle = () => {
    switch (animationType) {
      case 'spin':
        return {
          transform: [
            {
              rotate: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }
      case 'pulse':
        return {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2],
              }),
            },
          ],
        }
      case 'bounce':
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10],
              }),
            },
          ],
        }
      default:
        return {}
    }
  }

  const styles = StyleSheet.create({
    container: {
      width: sizeConfig.containerSize,
      height: sizeConfig.containerSize,
      justifyContent: 'center',
      alignItems: 'center',
      ...style,
    },
    spinner: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, getAnimatedStyle()]}>
        <Icon
          name="spinner"
          type="font-awesome"
          size={sizeConfig.iconSize}
          color={spinnerColor}
        />
      </Animated.View>
    </View>
  )
}

export default LoadingSpinner