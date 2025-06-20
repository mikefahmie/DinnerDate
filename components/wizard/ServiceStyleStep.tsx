// components/wizard/ServiceStyleStep.tsx - Fixed layout and spacing
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
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
          <View style={[
            styles.serviceIconContainer,
            isSelected && styles.selectedIconContainer
          ]}>
            <Icon
              name={service.icon.name}
              type={service.icon.type}
              size={24}
              color={isSelected ? theme.colors.textOnPrimary : theme.colors.textPrimary}
            />
          </View>
          
          <View style={styles.serviceContent}>
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
        
        <View style={styles.benefitsContainer}>
          {service.benefits.map((benefit, index) => (
            <View key={index} style={[
              styles.benefitChip,
              isSelected && styles.selectedBenefitChip
            ]}>
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
    note: {
      backgroundColor: theme.colors.accent + '15',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    noteText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.caption * 1.4,
    },
    serviceOptionsContainer: {
      marginBottom: theme.spacing.xl,
    },
    serviceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
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
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedIconContainer: {
      backgroundColor: theme.colors.primary,
    },
    serviceContent: {
      flex: 1,
    },
    serviceLabel: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedServiceLabel: {
      color: theme.colors.primary,
    },
    serviceDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.fontSize.secondary * 1.3,
    },
    selectedServiceDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      marginLeft: theme.spacing.md,
    },
    benefitsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    benefitChip: {
      backgroundColor: theme.colors.border + '40',
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    selectedBenefitChip: {
      backgroundColor: theme.colors.primary + '20',
    },
    benefitText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    selectedBenefitText: {
      color: theme.colors.primary,
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
          How would you like to enjoy your meal? Select all that interest you.
        </Text>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 Choose multiple options to see more restaurant choices
          </Text>
        </View>

        <View style={styles.serviceOptionsContainer}>
          {SERVICE_OPTIONS.map(renderServiceCard)}
        </View>
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

export default ServiceStyleStep