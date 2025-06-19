// components/wizard/ServiceStyleStep.tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'

interface ServiceStyleStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface ServiceOption {
  id: string
  label: string
  icon: { name: string; type: string }
  description: string
  benefits: string[]
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'dine_in',
    label: 'Dine In',
    icon: { name: 'cutlery', type: 'font-awesome' },
    description: 'Full restaurant experience',
    benefits: ['Full menu', 'Table service', 'Atmosphere']
  },
  {
    id: 'takeout',
    label: 'Takeout',
    icon: { name: 'shopping-bag', type: 'font-awesome' },
    description: 'Grab and go',
    benefits: ['Quick pickup', 'Eat anywhere', 'No waiting']
  },
  {
    id: 'delivery',
    label: 'Delivery',
    icon: { name: 'truck', type: 'font-awesome' },
    description: 'Delivered to you',
    benefits: ['Stay home', 'Convenience', 'No travel']
  }
]

const ServiceStyleStep: React.FC<ServiceStyleStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()

  const toggleServiceStyle = (serviceId: string) => {
    const currentStyles = wizardState.serviceStyles || []
    const updatedStyles = currentStyles.includes(serviceId)
      ? currentStyles.filter(id => id !== serviceId)
      : [...currentStyles, serviceId]
    
    updateWizardState({ serviceStyles: updatedStyles })
  }

  const handleContinue = () => {
    onNext()
  }

  const renderServiceCard = (service: ServiceOption) => {
    const isSelected = wizardState.serviceStyles?.includes(service.id) || false

    return (
      <TouchableOpacity
        key={service.id}
        style={[
          styles.serviceCard,
          isSelected && styles.selectedServiceCard
        ]}
        onPress={() => toggleServiceStyle(service.id)}
        activeOpacity={0.7}
      >
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIconContainer}>
            <Icon
              name={service.icon.name}
              type={service.icon.type}
              size={24}
              color={theme.colors.textPrimary}
            />
          </View>
          
          <View style={styles.serviceTitleContainer}>
            <Text style={[
              styles.serviceLabel,
              isSelected && styles.selectedServiceLabel
            ]}>
              {service.label}
            </Text>
            <Text style={[
              styles.serviceDescription,
              isSelected && styles.selectedServiceDescription
            ]}>
              {service.description}
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

        <View style={styles.benefitsContainer}>
          {service.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={[
                styles.benefitText,
                isSelected && styles.selectedBenefitText
              ]}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
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
    serviceGrid: {
      marginBottom: theme.spacing.xl,
    },
    serviceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedServiceCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    serviceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    serviceIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    serviceIcon: {
      // Removed - now using Icon component
    },
    serviceTitleContainer: {
      flex: 1,
    },
    serviceLabel: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedServiceLabel: {
      color: theme.colors.primary,
    },
    serviceDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
    },
    selectedServiceDescription: {
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
    benefitsContainer: {
      paddingLeft: theme.spacing.lg,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    benefitBullet: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textMuted,
      marginRight: theme.spacing.sm,
      width: 8,
    },
    benefitText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
      flex: 1,
    },
    selectedBenefitText: {
      color: theme.colors.textSecondary,
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
          How would you like to enjoy your meal? Select all that interest you.
        </Text>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 Choose multiple options to see more restaurant choices
          </Text>
        </View>

        <View style={styles.serviceGrid}>
          {SERVICE_OPTIONS.map(renderServiceCard)}
        </View>
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

export default ServiceStyleStep