// screens/DiscoveryWizard.tsx - Updated for new timing options and budget handling
import React, { useState } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { Button } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import { useNavigation } from '@react-navigation/native'
import WizardContainer from '../components/wizard/WizardContainer'
import LocationStep from '../components/wizard/LocationStep'
import MealTypeStep from '../components/wizard/MealTypeStep'
import ServiceStyleStep from '../components/wizard/ServiceStyleStep'
import TimingStep from '../components/wizard/TimingStep'
import BudgetStep from '../components/wizard/BudgetStep'
import DietaryStep from '../components/wizard/DietaryStep'
import FeaturesStep from '../components/wizard/FeaturesStep'

export interface WizardState {
  location: string
  mealTypes: string[]
  serviceStyles: string[]
  timing: 'now' | 'later' | 'anytime'
  scheduledTime?: Date
  budget: number[] // Changed from range to array of selected price levels
  dietary: string[]
  features: string[]
}

const TOTAL_STEPS = 7
const STEP_TITLES = [
  'Where are you dining?',
  'What meal are you planning?',
  'How would you like to dine?',
  'When are you dining?',
  'What\'s your budget?',
  'Any dietary preferences?',
  'Looking for anything specific?'
]

const DiscoveryWizardScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation()
  const [currentStep, setCurrentStep] = useState(1)
  const [slideAnim] = useState(new Animated.Value(0))
  
  const [wizardState, setWizardState] = useState<WizardState>({
    location: 'Ann Arbor, MI',
    mealTypes: [],
    serviceStyles: [],
    timing: 'now',
    budget: [], // Start with empty budget array - user can select multiple
    dietary: [],
    features: []
  })

  const updateWizardState = (updates: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      // Slide animation
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
      
      setCurrentStep(prev => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    // Skip current step (don't apply any filters for this category)
    handleNext()
  }

  const handleFinish = () => {
    // Ensure budget has default values if empty
    const finalWizardState = {
      ...wizardState,
      budget: wizardState.budget.length > 0 ? wizardState.budget : [1, 2, 3, 4]
    }
    
    // Navigate to results with wizard state
    navigation.navigate('RestaurantDiscovery', { filters: finalWizardState })
  }

  const getCurrentStepComponent = () => {
    const commonProps = {
      wizardState,
      updateWizardState,
      onNext: handleNext,
    }

    switch (currentStep) {
      case 1:
        return <LocationStep {...commonProps} />
      case 2:
        return <MealTypeStep {...commonProps} />
      case 3:
        return <ServiceStyleStep {...commonProps} />
      case 4:
        return <TimingStep {...commonProps} />
      case 5:
        return <BudgetStep {...commonProps} />
      case 6:
        return <DietaryStep {...commonProps} />
      case 7:
        return <FeaturesStep {...commonProps} />
      default:
        return <LocationStep {...commonProps} />
    }
  }

  const canSkip = currentStep > 1 // Can't skip location step
  const isLastStep = currentStep === TOTAL_STEPS

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    stepContainer: {
      flex: 1,
    },
    loadingContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    loadingText: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
    },
    resultsPreview: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
  })

  if (isLastStep && currentStep === TOTAL_STEPS) {
    return (
      <WizardContainer
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        title={STEP_TITLES[currentStep - 1]}
        onBack={handleBack}
        canSkip={false}
        hideSkip={true}
      >
        <View style={styles.stepContainer}>
          <Animated.View 
            style={[
              styles.content, 
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            {getCurrentStepComponent()}
            
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                Finding your perfect spots...
              </Text>
              <Button
                title="Show Results"
                onPress={handleFinish}
                buttonStyle={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.md,
                  marginTop: theme.spacing.lg,
                  paddingHorizontal: theme.spacing.xl,
                }}
              />
            </View>
          </Animated.View>
        </View>
      </WizardContainer>
    )
  }

  return (
    <WizardContainer
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      title={STEP_TITLES[currentStep - 1]}
      onBack={handleBack}
      onSkip={canSkip ? handleSkip : undefined}
      canSkip={canSkip}
    >
      <View style={styles.stepContainer}>
        <Animated.View 
          style={[
            styles.content, 
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          {getCurrentStepComponent()}
        </Animated.View>
      </View>
    </WizardContainer>
  )
}

export default DiscoveryWizardScreen