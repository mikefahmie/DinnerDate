// components/ui/ProgressBar.tsx
import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native'
import { useTheme } from '../../hooks/useTheme'

interface ProgressBarProps {
  current: number
  total: number
  height?: number
  backgroundColor?: string
  progressColor?: string
  borderRadius?: number
  animated?: boolean
  animationDuration?: number
  style?: ViewStyle
  showPercentage?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  height = 4,
  backgroundColor,
  progressColor,
  borderRadius,
  animated = true,
  animationDuration = 300,
  style,
  showPercentage = false,
}) => {
  const { theme } = useTheme()
  const animatedWidth = useRef(new Animated.Value(0)).current

  const progress = Math.min(Math.max(current / total, 0), 1) // Clamp between 0 and 1
  const percentage = Math.round(progress * 100)

  const barBackgroundColor = backgroundColor || theme.colors.border
  const barProgressColor = progressColor || theme.colors.primary
  const barBorderRadius = borderRadius !== undefined ? borderRadius : height / 2

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: animationDuration,
        useNativeDriver: false,
      }).start()
    } else {
      animatedWidth.setValue(progress)
    }
  }, [progress, animated, animationDuration, animatedWidth])

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      ...style,
    },
    track: {
      width: '100%',
      height: height,
      backgroundColor: barBackgroundColor,
      borderRadius: barBorderRadius,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: barProgressColor,
      borderRadius: barBorderRadius,
    },
    percentageContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    percentageText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </View>
      
      {showPercentage && (
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>
            {percentage}%
          </Text>
        </View>
      )}
    </View>
  )
}

export default ProgressBar