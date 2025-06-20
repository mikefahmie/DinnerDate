// components/wizard/TimingStep.tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'

interface TimingStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface TimingOption {
  id: 'now' | 'later' | 'anytime'
  label: string
  icon: { name: string; type: string }
  description: string
}

const TIMING_OPTIONS: TimingOption[] = [
  {
    id: 'now',
    label: 'Right Now',
    icon: { name: 'bolt', type: 'font-awesome' },
    description: 'I want to eat soon'
  },
  {
    id: 'later',
    label: 'Schedule for Later',
    icon: { name: 'calendar', type: 'font-awesome' },
    description: 'Plan for a specific time'
  },
  {
    id: 'anytime',
    label: 'Anytime',
    icon: { name: 'clock-o', type: 'font-awesome' },
    description: 'Show all restaurants regardless of hours'
  }
]

const TimingStep: React.FC<TimingStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  
  // Initialize with current time + 1 hour if no scheduled time
  const getInitialScheduledTime = () => {
    if (wizardState.scheduledTime) {
      return wizardState.scheduledTime
    }
    const now = new Date()
    now.setHours(now.getHours() + 1)
    now.setMinutes(0, 0, 0) // Round to nearest hour
    return now
  }

  const [selectedDate, setSelectedDate] = useState(getInitialScheduledTime())

  const handleTimingChange = (timing: 'now' | 'later' | 'anytime') => {
    if (timing === 'now' || timing === 'anytime') {
      updateWizardState({ 
        timing: timing,
        scheduledTime: undefined
      })
    } else {
      updateWizardState({ 
        timing: 'later',
        scheduledTime: selectedDate
      })
    }
  }

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false)
    if (date) {
      const newDate = new Date(selectedDate)
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
      setSelectedDate(newDate)
      updateWizardState({ scheduledTime: newDate })
    }
  }

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false)
    if (time) {
      const newDate = new Date(selectedDate)
      newDate.setHours(time.getHours(), time.getMinutes())
      setSelectedDate(newDate)
      updateWizardState({ scheduledTime: newDate })
    }
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const handleContinue = () => {
    onNext()
  }

  const renderTimingCard = (option: TimingOption) => {
    const isSelected = wizardState.timing === option.id

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.timingCard,
          isSelected && styles.selectedTimingCard
        ]}
        onPress={() => handleTimingChange(option.id)}
        activeOpacity={0.7}
      >
        <View style={styles.timingHeader}>
          <View style={[
            styles.timingIconContainer,
            isSelected && styles.selectedTimingIconContainer
          ]}>
            <Icon
              name={option.icon.name}
              type={option.icon.type}
              size={24}
              color={isSelected ? theme.colors.textOnPrimary : theme.colors.textPrimary}
            />
          </View>
          
          <View style={styles.timingContent}>
            <Text style={[
              styles.timingLabel,
              isSelected && styles.selectedTimingLabel
            ]}>
              {option.label}
            </Text>
            <Text style={[
              styles.timingDescription,
              isSelected && styles.selectedTimingDescription
            ]}>
              {option.description}
            </Text>
          </View>

          {isSelected && (
            <View style={styles.checkIconContainer}>
              <Icon
                name="check-circle"
                type="feather"
                size={24}
                color={theme.colors.primary}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const renderScheduleDetails = () => {
    if (wizardState.timing !== 'later') return null

    return (
      <View style={styles.scheduleContainer}>
        <Text style={styles.scheduleTitle}>When would you like to dine?</Text>
        
        <View style={styles.dateTimeSelectors}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon
              name="calendar"
              type="feather"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.dateTimeButtonText}>
              {formatDate(selectedDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Icon
              name="clock"
              type="feather"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.dateTimeButtonText}>
              {formatTime(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingTop: theme.spacing.md,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: theme.typography.fontSize.body * 1.4,
      paddingHorizontal: theme.spacing.md,
    },
    timingOptionsContainer: {
      marginBottom: theme.spacing.xl,
    },
    timingCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedTimingCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    timingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timingIconContainer: {
      width: 50,
      height: 50,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedTimingIconContainer: {
      backgroundColor: theme.colors.primary,
    },
    timingContent: {
      flex: 1,
    },
    timingLabel: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedTimingLabel: {
      color: theme.colors.primary,
    },
    timingDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.fontSize.secondary * 1.3,
    },
    selectedTimingDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      marginLeft: theme.spacing.md,
    },
    scheduleContainer: {
      backgroundColor: theme.colors.accent + '10', // 6% opacity
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    scheduleTitle: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    dateTimeSelectors: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    dateTimeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.sm,
      justifyContent: 'center',
    },
    dateTimeButtonText: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    buttonContainer: {
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
    },
    continueButtonText: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          When are you planning to dine? This helps us show relevant restaurants and their availability.
        </Text>

        <View style={styles.timingOptionsContainer}>
          {TIMING_OPTIONS.map(renderTimingCard)}
        </View>

        {renderScheduleDetails()}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          buttonStyle={styles.continueButton}
          titleStyle={styles.continueButtonText}
        />
      </View>
    </View>
  )
}

export default TimingStep