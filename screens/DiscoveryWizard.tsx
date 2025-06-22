// screens/DiscoveryWizard.tsx - Updated with conditional logic
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { Button } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'
import WizardContainer from '../components/wizard/WizardContainer'
import LocationStep from '../components/wizard/LocationStep'
import MealTypeStep from '../components/wizard/MealTypeStep'
import BudgetStep from '../components/wizard/BudgetStep'
import CuisineStep from '../components/wizard/CuisineStep'
import DietaryStep from '../components/wizard/DietaryStep'
import FeaturesStep from '../components/wizard/FeaturesStep'

export interface WizardState {
  location: string
  mealTypes: string[]
  budget: number[] // Price levels 1,2,3,4
  cuisineTypes: string[]
  dietary: string[]
  features: string[]
}

type DiscoveryWizardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DiscoveryWizard'>

const INITIAL_WIZARD_STATE: WizardState = {
  location: 'Ann Arbor/Ypsilanti',  // ✅ Use market field
  mealTypes: [],
  budget: [],
  cuisineTypes: [],
  dietary: [],
  features: []
}

const DiscoveryWizardScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation<DiscoveryWizardNavigationProp>()
  const [currentStep, setCurrentStep] = useState(1)
  const [slideAnim] = useState(new Animated.Value(0))
  
  const [wizardState, setWizardState] = useState<WizardState>(INITIAL_WIZARD_STATE)

  // Reset wizard state whenever this screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setWizardState(INITIAL_WIZARD_STATE)
      setCurrentStep(1)
      slideAnim.setValue(0)
    }, [slideAnim])
  )

  const updateWizardState = (updates: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...updates }))
  }

  // Determine if we should skip the cuisine step
  const shouldSkipCuisineStep = (): boolean => {
    const mealTypes = wizardState.mealTypes
    return mealTypes.includes('breakfast') || 
           mealTypes.includes('coffee') || 
           mealTypes.includes('dessert')
  }

  // Get total steps dynamically based on whether cuisine step is skipped
  const getTotalSteps = (): number => {
    return shouldSkipCuisineStep() ? 5 : 6 // Location, Meal, Budget, [Cuisine], Dietary, Features
  }

  // Get step title based on current step and whether cuisine is skipped
  const getStepTitle = (step: number): string => {
    if (shouldSkipCuisineStep()) {
      const titles = [
        'Where are you dining?',
        'What meal are you planning?', 
        'What\'s your budget?',
        'Any dietary preferences?',
        'Looking for anything specific?'
      ]
      return titles[step - 1] || ''
    } else {
      const titles = [
        'Where are you dining?',
        'What meal are you planning?',
        'What\'s your budget?', 
        'In the mood for anything specific?',
        'Any dietary preferences?',
        'Looking for anything specific?'
      ]
      return titles[step - 1] || ''
    }
  }

  const handleNext = () => {
    const totalSteps = getTotalSteps()
    
    if (currentStep < totalSteps) {
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

    if (shouldSkipCuisineStep()) {
      // Skip cuisine step flow: Location -> Meal -> Budget -> Dietary -> Features
      switch (currentStep) {
        case 1:
          return <LocationStep {...commonProps} />
        case 2:
          return <MealTypeStep {...commonProps} />
        case 3:
          return <BudgetStep {...commonProps} />
        case 4:
          return <DietaryStep {...commonProps} />
        case 5:
          return <FeaturesStep {...commonProps} />
        default:
          return <LocationStep {...commonProps} />
      }
    } else {
      // Normal flow: Location -> Meal -> Budget -> Cuisine -> Dietary -> Features
      switch (currentStep) {
        case 1:
          return <LocationStep {...commonProps} />
        case 2:
          return <MealTypeStep {...commonProps} />
        case 3:
          return <BudgetStep {...commonProps} />
        case 4:
          return <CuisineStep {...commonProps} />
        case 5:
          return <DietaryStep {...commonProps} />
        case 6:
          return <FeaturesStep {...commonProps} />
        default:
          return <LocationStep {...commonProps} />
      }
    }
  }

  const canSkip = currentStep > 1 // Can't skip location step
  const totalSteps = getTotalSteps()
  const isLastStep = currentStep === totalSteps

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

  if (isLastStep && currentStep === totalSteps) {
    return (
      <WizardContainer
        currentStep={currentStep}
        totalSteps={totalSteps}
        title={getStepTitle(currentStep)}
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
      totalSteps={totalSteps}
      title={getStepTitle(currentStep)}
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