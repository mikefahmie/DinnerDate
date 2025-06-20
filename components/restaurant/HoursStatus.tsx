// components/restaurant/HoursStatus.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'

interface HoursStatusProps {
  restaurant: any // TODO: Add proper Restaurant type
  showFullHours?: boolean
  size?: 'small' | 'medium' | 'large'
}

interface OpenStatus {
  isOpen: boolean
  statusColor: 'green' | 'yellow' | 'red'
  displayText: string
  nextChange?: string
}

const HoursStatus: React.FC<HoursStatusProps> = ({
  restaurant,
  showFullHours = false,
  size = 'medium',
}) => {
  const { theme } = useTheme()

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: theme.typography.fontSize.caption,
          iconSize: 8,
          spacing: theme.spacing.xs,
        }
      case 'large':
        return {
          fontSize: theme.typography.fontSize.secondary,
          iconSize: 12,
          spacing: theme.spacing.sm,
        }
      default: // medium
        return {
          fontSize: theme.typography.fontSize.secondary,
          iconSize: 10,
          spacing: theme.spacing.sm,
        }
    }
  }

  const sizeConfig = getSizeConfig()

  const calculateOpenStatus = (): OpenStatus => {
    const now = new Date()
    const currentHours = restaurant.current_opening_hours

    if (!currentHours || !currentHours.periods) {
      return {
        isOpen: false,
        statusColor: 'red',
        displayText: 'Hours unavailable',
      }
    }

    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 100 + now.getMinutes() // HHMM format

    // Find today's hours
    const todaysPeriods = currentHours.periods.filter(
      (period: any) => period.open?.day === currentDay
    )

    if (todaysPeriods.length === 0) {
      return {
        isOpen: false,
        statusColor: 'red',
        displayText: 'Closed today',
      }
    }

    // Check if currently open
    for (const period of todaysPeriods) {
      const openTime = period.open?.hour * 100 + (period.open?.minute || 0)
      const closeTime = period.close 
        ? period.close.hour * 100 + (period.close.minute || 0)
        : 2400 // 24-hour if no close time

      if (currentTime >= openTime && currentTime < closeTime) {
        const closingHour = period.close?.hour || 24
        const closingMinute = period.close?.minute || 0
        const closingTime = new Date()
        closingTime.setHours(closingHour, closingMinute, 0, 0)

        const timeToClose = Math.abs(closingTime.getTime() - now.getTime()) / (1000 * 60) // minutes
        
        if (timeToClose <= 60) {
          return {
            isOpen: true,
            statusColor: 'yellow',
            displayText: `Closing at ${formatTime(closingHour, closingMinute)}`,
          }
        }

        return {
          isOpen: true,
          statusColor: 'green',
          displayText: `Open until ${formatTime(closingHour, closingMinute)}`,
        }
      }
    }

    // Find next opening time
    const nextOpenPeriod = findNextOpenPeriod(currentHours.periods, now)
    if (nextOpenPeriod) {
      return {
        isOpen: false,
        statusColor: 'red',
        displayText: nextOpenPeriod,
      }
    }

    return {
      isOpen: false,
      statusColor: 'red',
      displayText: 'Closed',
    }
  }

  const formatTime = (hour: number, minute: number = 0): string => {
    const date = new Date()
    date.setHours(hour, minute, 0, 0)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const findNextOpenPeriod = (periods: any[], currentTime: Date): string | null => {
    const currentDay = currentTime.getDay()
    const currentTimeNum = currentTime.getHours() * 100 + currentTime.getMinutes()

    // Check if opens later today
    const todaysPeriods = periods.filter((p: any) => p.open?.day === currentDay)
    for (const period of todaysPeriods) {
      const openTime = period.open?.hour * 100 + (period.open?.minute || 0)
      if (openTime > currentTimeNum) {
        return `Opens at ${formatTime(period.open.hour, period.open.minute)}`
      }
    }

    // Check tomorrow
    const tomorrow = (currentDay + 1) % 7
    const tomorrowPeriods = periods.filter((p: any) => p.open?.day === tomorrow)
    if (tomorrowPeriods.length > 0) {
      const firstPeriod = tomorrowPeriods[0]
      return `Opens tomorrow at ${formatTime(firstPeriod.open.hour, firstPeriod.open.minute)}`
    }

    return null
  }

  const getStatusIcon = (statusColor: string) => {
    const iconColor = {
      green: theme.colors.success,
      yellow: '#FFB800', // Warning color
      red: theme.colors.error,
    }[statusColor] || theme.colors.textMuted

    return (
      <Icon
        name="circle"
        type="font-awesome"
        size={sizeConfig.iconSize}
        color={iconColor}
        style={{ marginRight: sizeConfig.spacing }}
      />
    )
  }

  const renderFullHours = () => {
    if (!restaurant.regular_opening_hours?.weekday_descriptions) {
      return null
    }

    return (
      <View style={styles.fullHoursContainer}>
        <Text style={styles.fullHoursTitle}>Hours:</Text>
        {restaurant.regular_opening_hours.weekday_descriptions.map((day: string, index: number) => (
          <Text key={index} style={styles.dayHours}>
            {day}
          </Text>
        ))}
      </View>
    )
  }

  const openStatus = calculateOpenStatus()

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: sizeConfig.fontSize,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    fullHoursContainer: {
      marginTop: theme.spacing.sm,
    },
    fullHoursTitle: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    dayHours: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    unavailableContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    unavailableText: {
      fontSize: sizeConfig.fontSize,
      color: theme.colors.textMuted,
      fontStyle: 'italic',
    },
  })

  if (!restaurant.current_opening_hours && !restaurant.regular_opening_hours) {
    return (
      <View style={styles.unavailableContainer}>
        <Icon
          name="clock-o"
          type="font-awesome"
          size={sizeConfig.iconSize + 2}
          color={theme.colors.textMuted}
          style={{ marginRight: sizeConfig.spacing }}
        />
        <Text style={styles.unavailableText}>Hours not available</Text>
      </View>
    )
  }

  return (
    <View>
      <View style={styles.container}>
        {getStatusIcon(openStatus.statusColor)}
        <Text style={styles.statusText}>{openStatus.displayText}</Text>
      </View>
      
      {showFullHours && renderFullHours()}
    </View>
  )
}

export default HoursStatus