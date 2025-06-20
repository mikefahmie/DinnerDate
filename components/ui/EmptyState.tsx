// components/ui/EmptyState.tsx
import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'

interface EmptyStateProps {
  title: string
  message?: string
  icon?: string
  iconType?: string
  actionText?: string
  onAction?: () => void
  secondaryActionText?: string
  onSecondaryAction?: () => void
  style?: ViewStyle
  variant?: 'default' | 'search' | 'favorites' | 'error'
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  iconType = 'font-awesome',
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  style,
  variant = 'default',
}) => {
  const { theme } = useTheme()

  const getVariantConfig = () => {
    switch (variant) {
      case 'search':
        return {
          defaultIcon: 'search',
          iconColor: theme.colors.textMuted,
          backgroundColor: theme.colors.background,
        }
      case 'favorites':
        return {
          defaultIcon: 'heart-o',
          iconColor: theme.colors.error,
          backgroundColor: theme.colors.background,
        }
      case 'error':
        return {
          defaultIcon: 'exclamation-triangle',
          iconColor: theme.colors.error,
          backgroundColor: theme.colors.background,
        }
      default:
        return {
          defaultIcon: 'info-circle',
          iconColor: theme.colors.textMuted,
          backgroundColor: theme.colors.background,
        }
    }
  }

  const variantConfig = getVariantConfig()
  const displayIcon = icon || variantConfig.defaultIcon

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xxl,
      backgroundColor: variantConfig.backgroundColor,
      ...style,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      ...theme.shadows.small,
    },
    title: {
      fontSize: theme.typography.fontSize.h1,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    message: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: theme.spacing.xl,
      maxWidth: 280,
    },
    actionsContainer: {
      width: '100%',
      maxWidth: 280,
    },
    primaryAction: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      height: theme.spacing.buttonHeight,
      marginBottom: theme.spacing.md,
    },
    primaryActionTitle: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
    },
    secondaryAction: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      height: theme.spacing.buttonHeight,
    },
    secondaryActionTitle: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.fontSize.body,
    },
    singleActionContainer: {
      alignItems: 'center',
    },
    compactContainer: {
      paddingVertical: theme.spacing.lg,
    },
    compactIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginBottom: theme.spacing.lg,
    },
    compactTitle: {
      fontSize: theme.typography.fontSize.h2,
      marginBottom: theme.spacing.sm,
    },
    compactMessage: {
      fontSize: theme.typography.fontSize.secondary,
      marginBottom: theme.spacing.lg,
    },
  })

  const isCompact = !message || message.length < 50

  return (
    <View style={[
      styles.container,
      isCompact && styles.compactContainer,
    ]}>
      <View style={[
        styles.iconContainer,
        isCompact && styles.compactIconContainer,
      ]}>
        <Icon
          name={displayIcon}
          type={iconType}
          size={isCompact ? 24 : 32}
          color={variantConfig.iconColor}
        />
      </View>

      <Text style={[
        styles.title,
        isCompact && styles.compactTitle,
      ]}>
        {title}
      </Text>

      {message && (
        <Text style={[
          styles.message,
          isCompact && styles.compactMessage,
        ]}>
          {message}
        </Text>
      )}

      {(actionText || secondaryActionText) && (
        <View style={[
          styles.actionsContainer,
          (!secondaryActionText && actionText) && styles.singleActionContainer,
        ]}>
          {actionText && onAction && (
            <Button
              title={actionText}
              onPress={onAction}
              buttonStyle={styles.primaryAction}
              titleStyle={styles.primaryActionTitle}
            />
          )}

          {secondaryActionText && onSecondaryAction && (
            <Button
              title={secondaryActionText}
              onPress={onSecondaryAction}
              buttonStyle={styles.secondaryAction}
              titleStyle={styles.secondaryActionTitle}
            />
          )}
        </View>
      )}
    </View>
  )
}

export default EmptyState