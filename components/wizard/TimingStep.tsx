// components/wizard/TimingStep.tsx - Day-based timing selection
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
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
  id: 'today' | 'tomorrow' | 'specific' | 'anytime'
  label: string
  icon: { name: string; type: string }
  description: string
}

const TIMING_OPTIONS: TimingOption[] = [
  {
    id: 'today',
    label: 'Today',
    icon: { name: 'clock', type: 'feather' },
    description: 'Show restaurants open today'
  },
  {
    id: 'tomorrow',
    label: 'Tomorrow',
    icon: { name: 'sunrise', type: 'feather' },
    description: 'Show restaurants open tomorrow'
  },
  {
    id: 'specific',
    label: 'Pick a Date',
    icon: { name: 'calendar', type: 'feather' },
    description: 'Choose a specific date'
  },
  {
    id: 'anytime',
    label: 'Any Day',
    icon: { name: 'globe', type: 'feather' },
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
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Map old timing values to new ones
  const getCurrentTiming = (): 'today' | 'tomorrow' | 'specific' | 'anytime' => {
    if (wizardState.timing === 'anytime') return 'anytime'
    if (wizardState.timing === 'now') return 'today'
    if (wizardState.scheduledTime) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const scheduleDate = new Date(wizardState.scheduledTime)
      
      if (scheduleDate.toDateString() === today.toDateString()) {
        return 'today'
      } else if (scheduleDate.toDateString() === tomorrow.toDateString()) {
        return 'tomorrow'
      } else {
        return 'specific'
      }
    }
    return 'today'
  }

  const handleTimingChange = (timing: 'today' | 'tomorrow' | 'specific' | 'anytime') => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    switch (timing) {
      case 'today':
        updateWizardState({ 
          timing: 'now',
          scheduledTime: today
        })
        break
      case 'tomorrow':
        updateWizardState({ 
          timing: 'later',
          scheduledTime: tomorrow
        })
        break
      case 'specific':
        setShowDatePicker(true)
        break
      case 'anytime':
        updateWizardState({ 
          timing: 'anytime',
          scheduledTime: undefined
        })
        break
    }
  }

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false)
    if (date) {
      setSelectedDate(date)
      updateWizardState({ 
        timing: 'later',
        scheduledTime: date
      })
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

  const handleContinue = () => {
    onNext()
  }

  const renderTimingCard = (option: TimingOption) => {
    const currentTiming = getCurrentTiming()
    const isSelected = currentTiming === option.id

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

  const renderSelectedDateInfo = () => {
    if (getCurrentTiming() !== 'specific' || !wizardState.scheduledTime) return null

    return (
      <View style={styles.dateInfoContainer}>
        <Icon
          name="calendar"
          type="feather"
          size={20}
          color={theme.colors.primary}
        />
        <Text style={styles.dateInfoText}>
          Selected date: {formatDate(new Date(wizardState.scheduledTime))}
        </Text>
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    content: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: theme.typography.fontSize.body * 1.5,
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
    dateInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accent + '15',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    dateInfoText: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    note: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    noteText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.caption * 1.4,
    },
    buttonContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
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
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.subtitle}>
          When are you looking to dine? This helps us show restaurants that will be open and available.
        </Text>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 Restaurant hours and availability will be filtered based on your selection
          </Text>
        </View>

        <View style={styles.timingOptionsContainer}>
          {TIMING_OPTIONS.map(renderTimingCard)}
        </View>

        {renderSelectedDateInfo()}

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </ScrollView>

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