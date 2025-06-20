// components/ui/StatusIndicator.tsx
import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  text?: string
  icon?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'dot' | 'badge' | 'pill' | 'outline'
  style?: ViewStyle
  showIcon?: boolean
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  text,
  icon,
  size = 'medium',
  variant = 'dot',
  style,
  showIcon = false,
}) => {
  const { theme } = useTheme()

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          color: theme.colors.success,
          backgroundColor: `${theme.colors.success}20`, // 20% opacity
          defaultIcon: 'check-circle',
          textColor: theme.colors.success,
        }
      case 'warning':
        return {
          color: '#FFB800', // Warning color
          backgroundColor: '#FFB80020',
          defaultIcon: 'exclamation-triangle',
          textColor: '#CC9400',
        }
      case 'error':
        return {
          color: theme.colors.error,
          backgroundColor: `${theme.colors.error}20`,
          defaultIcon: 'times-circle',
          textColor: theme.colors.error,
        }
      case 'info':
        return {
          color: theme.colors.primary,
          backgroundColor: `${theme.colors.primary}20`,
          defaultIcon: 'info-circle',
          textColor: theme.colors.primary,
        }
      default: // neutral
        return {
          color: theme.colors.textMuted,
          backgroundColor: `${theme.colors.textMuted}20`,
          defaultIcon: 'circle',
          textColor: theme.colors.textMuted,
        }
    }
  }

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          dotSize: 6,
          iconSize: 12,
          fontSize: theme.typography.fontSize.caption,
          padding: variant === 'pill' || variant === 'badge' ? theme.spacing.xs : 0,
          minHeight: 20,
        }
      case 'large':
        return {
          dotSize: 12,
          iconSize: 18,
          fontSize: theme.typography.fontSize.secondary,
          padding: variant === 'pill' || variant === 'badge' ? theme.spacing.sm : 0,
          minHeight: 32,
        }
      default: // medium
        return {
          dotSize: 8,
          iconSize: 14,
          fontSize: theme.typography.fontSize.caption,
          padding: variant === 'pill' || variant === 'badge' ? theme.spacing.sm : 0,
          minHeight: 24,
        }
    }
  }

  const statusConfig = getStatusConfig()
  const sizeConfig = getSizeConfig()
  const displayIcon = icon || statusConfig.defaultIcon

  const renderDot = () => (
    <View
      style={[
        styles.dot,
        {
          width: sizeConfig.dotSize,
          height: sizeConfig.dotSize,
          borderRadius: sizeConfig.dotSize / 2,
          backgroundColor: statusConfig.color,
        },
      ]}
    />
  )

  const renderIcon = () => (
    <Icon
      name={displayIcon}
      type="font-awesome"
      size={sizeConfig.iconSize}
      color={statusConfig.color}
      style={text ? { marginRight: theme.spacing.xs } : {}}
    />
  )

  const renderContent = () => {
    switch (variant) {
      case 'dot':
        return (
          <View style={styles.dotContainer}>
            {renderDot()}
            {text && (
              <Text style={[styles.text, { 
                fontSize: sizeConfig.fontSize,
                color: theme.colors.textPrimary,
                marginLeft: theme.spacing.sm,
              }]}>
                {text}
              </Text>
            )}
          </View>
        )

      case 'badge':
      case 'pill':
        return (
          <View style={[
            styles.badge,
            {
              backgroundColor: statusConfig.backgroundColor,
              borderRadius: variant === 'pill' ? 100 : theme.borderRadius.sm,
              paddingHorizontal: sizeConfig.padding,
              paddingVertical: sizeConfig.padding / 2,
              minHeight: sizeConfig.minHeight,
            },
          ]}>
            {showIcon && renderIcon()}
            {text && (
              <Text style={[styles.text, { 
                fontSize: sizeConfig.fontSize,
                color: statusConfig.textColor,
                fontWeight: '500',
              }]}>
                {text}
              </Text>
            )}
          </View>
        )

      case 'outline':
        return (
          <View style={[
            styles.outline,
            {
              borderColor: statusConfig.color,
              borderWidth: 1,
              borderRadius: theme.borderRadius.sm,
              paddingHorizontal: sizeConfig.padding,
              paddingVertical: sizeConfig.padding / 2,
              minHeight: sizeConfig.minHeight,
            },
          ]}>
            {showIcon && renderIcon()}
            {text && (
              <Text style={[styles.text, { 
                fontSize: sizeConfig.fontSize,
                color: statusConfig.textColor,
                fontWeight: '500',
              }]}>
                {text}
              </Text>
            )}
          </View>
        )

      default:
        return renderDot()
    }
  }

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    },
    dotContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dot: {
      // Styles set dynamically
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    outline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    text: {
      // Styles set dynamically
    },
  })

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  )
}

export default StatusIndicator