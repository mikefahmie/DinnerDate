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
  id: 'now' | 'later'
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

  const handleTimingChange = (timing: 'now' | 'later') => {
    if (timing === 'now') {
      updateWizardState({ 
        timing: 'now',
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
          <View style={styles.timingIconContainer}>
            <Icon
              name={option.icon.name}
              type={option.icon.type}
              size={24}
              color={theme.colors.textPrimary}
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

          <View style={[
            styles.selectionIndicator,
            isSelected && styles.selectedIndicator
          ]}>
            <Text style={styles.checkmark}>
              {isSelected ? '✓' : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderScheduleSelector = () => {
    if (wizardState.timing !== 'later') return null

    return (
      <View style={styles.scheduleContainer}>
        <Text style={styles.scheduleTitle}>When would you like to dine?</Text>
        
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeLabel}>Date</Text>
            <Text style={styles.dateTimeValue}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeLabel}>Time</Text>
            <Text style={styles.dateTimeValue}>{formatTime(selectedDate)}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
            maximumDate={(() => {
              const maxDate = new Date()
              maxDate.setDate(maxDate.getDate() + 30) // 30 days from now
              return maxDate
            })()}
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
      padding: theme.spacing.screenPadding,
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: 22,
    },
    timingGrid: {
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
      borderRadius: 25,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    timingIcon: {
      // Removed - now using Icon component
    },
    timingContent: {
      flex: 1,
    },
    timingLabel: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedTimingLabel: {
      color: theme.colors.primary,
    },
    timingDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
    },
    selectedTimingDescription: {
      color: theme.colors.textPrimary,
    },
    selectionIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedIndicator: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkmark: {
      color: theme.colors.textOnPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    scheduleContainer: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    scheduleTitle: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    dateTimeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dateTimeButton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dateTimeLabel: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.xs,
    },
    dateTimeValue: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    buttonContainer: {
      paddingTop: theme.spacing.lg,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      height: theme.spacing.buttonHeight,
    },
    note: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    noteText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          When are you planning to dine? This helps us show current hours and availability.
        </Text>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            🕒 "Right Now" shows restaurants that are currently open
          </Text>
        </View>

        <View style={styles.timingGrid}>
          {TIMING_OPTIONS.map(renderTimingCard)}
        </View>

        {renderScheduleSelector()}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          buttonStyle={styles.continueButton}
        />
      </View>
    </View>
  )
}

export default TimingStep