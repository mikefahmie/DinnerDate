// components/restaurant/ActionIcons.tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'

interface ActionIconsProps {
  restaurant: any // TODO: Add proper Restaurant type
  showLabels?: boolean
  size?: 'small' | 'medium' | 'large'
  iconColor?: string
  onWebsite?: () => void
  onDirections?: () => void
  onPhone?: () => void
  onMenu?: () => void
}

interface ActionButton {
  id: string
  icon: string
  label: string
  available: boolean
  onPress: () => void
}

const ActionIcons: React.FC<ActionIconsProps> = ({
  restaurant,
  showLabels = true,
  size = 'medium',
  iconColor,
  onWebsite,
  onDirections,
  onPhone,
  onMenu,
}) => {
  const { theme } = useTheme()

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: 16,
          containerSize: 36,
          fontSize: theme.typography.fontSize.caption,
          spacing: theme.spacing.xs,
        }
      case 'large':
        return {
          iconSize: 24,
          containerSize: 56,
          fontSize: theme.typography.fontSize.secondary,
          spacing: theme.spacing.md,
        }
      default: // medium
        return {
          iconSize: 20,
          containerSize: 44,
          fontSize: theme.typography.fontSize.caption,
          spacing: theme.spacing.sm,
        }
    }
  }

  const sizeConfig = getSizeConfig()
  const buttonIconColor = iconColor || theme.colors.textPrimary

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-start',
      paddingVertical: theme.spacing.xs,
    },
    actionButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: sizeConfig.containerSize / 2,
      marginHorizontal: theme.spacing.xs,
      ...theme.shadows.small,
    },
    disabledButton: {
      backgroundColor: theme.colors.disabled,
      opacity: 0.5,
    },
    actionLabel: {
      marginTop: theme.spacing.xs,
      textAlign: 'center',
      fontWeight: '500',
    },
    emptyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
    },
    emptyText: {
      fontSize: sizeConfig.fontSize,
      color: theme.colors.textMuted,
      marginLeft: theme.spacing.sm,
      fontStyle: 'italic',
    },
  })

  const handleWebsite = () => {
    if (onWebsite) {
      onWebsite()
    } else if (restaurant.website_uri) {
      Linking.openURL(restaurant.website_uri).catch(() => {
        Alert.alert('Error', 'Unable to open website')
      })
    }
  }

  const handleDirections = () => {
    if (onDirections) {
      onDirections()
    } else if (restaurant.location_lat && restaurant.location_lng) {
      const url = `maps:0,0?q=${restaurant.location_lat},${restaurant.location_lng}`
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps web
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${restaurant.location_lat},${restaurant.location_lng}`
        Linking.openURL(webUrl).catch(() => {
          Alert.alert('Error', 'Unable to open maps')
        })
      })
    }
  }

  const handlePhone = () => {
    if (onPhone) {
      onPhone()
    } else if (restaurant.phone_number) {
      Linking.openURL(`tel:${restaurant.phone_number}`).catch(() => {
        Alert.alert('Error', 'Unable to make phone call')
      })
    }
  }

  const handleMenu = () => {
    if (onMenu) {
      onMenu()
    } else {
      // Could link to menu if available in restaurant data
      Alert.alert('Menu', 'Menu viewing coming soon!')
    }
  }

  const getActionButtons = (): ActionButton[] => {
    return [
      {
        id: 'website',
        icon: 'globe',
        label: 'Website',
        available: !!restaurant.website_uri,
        onPress: handleWebsite,
      },
      {
        id: 'directions',
        icon: 'map-marker',
        label: 'Directions',
        available: !!(restaurant.location_lat && restaurant.location_lng),
        onPress: handleDirections,
      },
      {
        id: 'phone',
        icon: 'phone',
        label: 'Call',
        available: !!restaurant.phone_number,
        onPress: handlePhone,
      },
      {
        id: 'menu',
        icon: 'list-ul',
        label: 'Menu',
        available: true, // Always show for future functionality
        onPress: handleMenu,
      },
    ]
  }

  const renderActionButton = (action: ActionButton) => {
    if (!action.available) return null

    return (
      <TouchableOpacity
        key={action.id}
        style={[
          styles.actionButton,
          {
            width: sizeConfig.containerSize,
            height: sizeConfig.containerSize,
          },
          !action.available && styles.disabledButton
        ]}
        onPress={action.onPress}
        disabled={!action.available}
        activeOpacity={0.7}
      >
        <Icon
          name={action.icon}
          type="font-awesome"
          size={sizeConfig.iconSize}
          color={action.available ? buttonIconColor : theme.colors.disabled}
        />
        
        {showLabels && (
          <Text
            style={[
              styles.actionLabel,
              {
                fontSize: sizeConfig.fontSize,
                color: action.available ? theme.colors.textSecondary : theme.colors.disabled,
              }
            ]}
            numberOfLines={1}
          >
            {action.label}
          </Text>
        )}
      </TouchableOpacity>
    )
  }

  const availableActions = getActionButtons().filter(action => action.available)

  if (availableActions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon
          name="info-circle"
          type="font-awesome"
          size={sizeConfig.iconSize}
          color={theme.colors.textMuted}
        />
        <Text style={styles.emptyText}>No actions available</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {availableActions.map(renderActionButton)}
    </View>
  )
}

export default ActionIcons