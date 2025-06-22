// hooks/useWizard.tsx - Updated to match new WizardState interface
import { useState, useEffect, useCallback, useMemo } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { WizardState } from '../screens/DiscoveryWizard'

interface UseWizardResult {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  resetWizard: () => void
  saveWizardState: () => Promise<void>
  loadWizardState: () => Promise<void>
  clearSavedState: () => Promise<void>
  isComplete: boolean
  getCompletionProgress: () => number
  shouldSkipCuisineStep: () => boolean
  getCurrentStepTitle: (step: number) => string
  getTotalSteps: () => number
}

const WIZARD_STORAGE_KEY = '@dinnerdate_wizard_state'

const DEFAULT_WIZARD_STATE: WizardState = {
  location: 'Ann Arbor/Ypsilanti',
  mealTypes: [],
  budget: [1, 2, 3, 4], // Default to all price levels
  cuisineTypes: [],
  dietary: [],
  features: [],
}

export const useWizard = (persistState: boolean = true): UseWizardResult => {
  const [wizardState, setWizardState] = useState<WizardState>(DEFAULT_WIZARD_STATE)

  // Update wizard state
  const updateWizardState = useCallback((updates: Partial<WizardState>) => {
    setWizardState(prev => {
      const newState = { ...prev, ...updates }
      
      // Auto-save if persistence is enabled
      if (persistState) {
        AsyncStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(newState))
          .catch(error => console.error('Error saving wizard state:', error))
      }
      
      return newState
    })
  }, [persistState])

  // Reset wizard to default state
  const resetWizard = useCallback(() => {
    setWizardState(DEFAULT_WIZARD_STATE)
    if (persistState) {
      clearSavedState()
    }
  }, [persistState])

  // Save wizard state to storage
  const saveWizardState = useCallback(async () => {
    if (!persistState) return
    
    try {
      await AsyncStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(wizardState))
    } catch (error) {
      console.error('Error saving wizard state:', error)
    }
  }, [wizardState, persistState])

  // Load wizard state from storage
  const loadWizardState = useCallback(async () => {
    if (!persistState) return
    
    try {
      const savedState = await AsyncStorage.getItem(WIZARD_STORAGE_KEY)
      if (savedState) {
        const parsedState = JSON.parse(savedState) as WizardState
        
        // Validate that saved state matches current interface
        const validatedState: WizardState = {
          location: parsedState.location || DEFAULT_WIZARD_STATE.location,
          mealTypes: Array.isArray(parsedState.mealTypes) ? parsedState.mealTypes : [],
          budget: Array.isArray(parsedState.budget) ? parsedState.budget : DEFAULT_WIZARD_STATE.budget,
          cuisineTypes: Array.isArray(parsedState.cuisineTypes) ? parsedState.cuisineTypes : [],
          dietary: Array.isArray(parsedState.dietary) ? parsedState.dietary : [],
          features: Array.isArray(parsedState.features) ? parsedState.features : [],
        }
        
        setWizardState(validatedState)
      }
    } catch (error) {
      console.error('Error loading wizard state:', error)
      // If loading fails, reset to default
      setWizardState(DEFAULT_WIZARD_STATE)
    }
  }, [persistState])

  // Clear saved state from storage
  const clearSavedState = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(WIZARD_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing saved wizard state:', error)
    }
  }, [])

  // Determine if we should skip the cuisine step
  const shouldSkipCuisineStep = useCallback((): boolean => {
    const mealTypes = wizardState.mealTypes
    return mealTypes.includes('breakfast') || 
           mealTypes.includes('coffee') || 
           mealTypes.includes('dessert')
  }, [wizardState.mealTypes])

  // Get total steps dynamically based on conditional logic
  const getTotalSteps = useCallback((): number => {
    return shouldSkipCuisineStep() ? 5 : 6 // Location, Meal, Budget, [Cuisine], Dietary, Features
  }, [shouldSkipCuisineStep])

  // Get step title based on current step and whether cuisine is skipped
  const getCurrentStepTitle = useCallback((step: number): string => {
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
        'What type of cuisine?',
        'Any dietary preferences?',
        'Looking for anything specific?'
      ]
      return titles[step - 1] || ''
    }
  }, [shouldSkipCuisineStep])

  // Check if wizard is complete (has minimum required fields)
  const isComplete = useMemo(() => {
    return !!(
      wizardState.location &&
      wizardState.budget.length > 0
      // Note: mealTypes, cuisineTypes, dietary, and features are optional
    )
  }, [wizardState])

  // Get completion progress as percentage
  const getCompletionProgress = useCallback((): number => {
    let completedSteps = 0
    const totalSteps = getTotalSteps()
    
    // Step 1: Location (required)
    if (wizardState.location) completedSteps++
    
    // Step 2: Meal types (optional but counts toward progress)
    if (wizardState.mealTypes.length > 0) completedSteps++
    
    // Step 3: Budget (required)
    if (wizardState.budget.length > 0) completedSteps++
    
    // Step 4: Cuisine (conditional - only if not skipped)
    if (!shouldSkipCuisineStep()) {
      if (wizardState.cuisineTypes.length > 0) completedSteps++
    } else {
      // If skipped, automatically count as completed
      completedSteps++
    }
    
    // Step 5: Dietary (optional)
    if (wizardState.dietary.length > 0) completedSteps++
    
    // Step 6: Features (optional) 
    if (wizardState.features.length > 0) completedSteps++
    
    return Math.round((completedSteps / totalSteps) * 100)
  }, [wizardState, getTotalSteps, shouldSkipCuisineStep])

  // Load saved state on mount
  useEffect(() => {
    if (persistState) {
      loadWizardState()
    }
  }, [loadWizardState, persistState])

  return {
    wizardState,
    updateWizardState,
    resetWizard,
    saveWizardState,
    loadWizardState,
    clearSavedState,
    isComplete,
    getCompletionProgress,
    shouldSkipCuisineStep,
    getCurrentStepTitle,
    getTotalSteps,
  }
}

// Helper function to validate wizard state
export const validateWizardState = (state: any): WizardState => {
  return {
    location: typeof state.location === 'string' ? state.location : DEFAULT_WIZARD_STATE.location,
    mealTypes: Array.isArray(state.mealTypes) ? state.mealTypes : [],
    budget: Array.isArray(state.budget) ? state.budget : DEFAULT_WIZARD_STATE.budget,
    cuisineTypes: Array.isArray(state.cuisineTypes) ? state.cuisineTypes : [],
    dietary: Array.isArray(state.dietary) ? state.dietary : [],
    features: Array.isArray(state.features) ? state.features : [],
  }
}

// Helper function to check if two wizard states are equal
export const isWizardStateEqual = (state1: WizardState, state2: WizardState): boolean => {
  return (
    state1.location === state2.location &&
    JSON.stringify(state1.mealTypes.sort()) === JSON.stringify(state2.mealTypes.sort()) &&
    JSON.stringify(state1.budget.sort()) === JSON.stringify(state2.budget.sort()) &&
    JSON.stringify(state1.cuisineTypes.sort()) === JSON.stringify(state2.cuisineTypes.sort()) &&
    JSON.stringify(state1.dietary.sort()) === JSON.stringify(state2.dietary.sort()) &&
    JSON.stringify(state1.features.sort()) === JSON.stringify(state2.features.sort())
  )
}

export default useWizard