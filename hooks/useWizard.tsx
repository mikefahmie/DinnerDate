// hooks/useWizard.tsx
import { useState, useEffect, useCallback } from 'react'
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
}

const WIZARD_STORAGE_KEY = '@dinnerdate_wizard_state'

const DEFAULT_WIZARD_STATE: WizardState = {
  location: 'Ann Arbor, MI',
  mealTypes: [],
  serviceStyles: [],
  timing: 'now',
  budget: [1, 4],
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

  // Save current wizard state to AsyncStorage
  const saveWizardState = useCallback(async () => {
    try {
      await AsyncStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(wizardState))
    } catch (error) {
      console.error('Error saving wizard state:', error)
      throw error
    }
  }, [wizardState])

  // Load wizard state from AsyncStorage
  const loadWizardState = useCallback(async () => {
    try {
      const savedState = await AsyncStorage.getItem(WIZARD_STORAGE_KEY)
      if (savedState) {
        const parsedState = JSON.parse(savedState) as WizardState
        setWizardState(parsedState)
      }
    } catch (error) {
      console.error('Error loading wizard state:', error)
      // If loading fails, keep default state
    }
  }, [])

  // Clear saved wizard state
  const clearSavedState = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(WIZARD_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing wizard state:', error)
    }
  }, [])

  // Check if wizard is considered "complete" (has meaningful selections)
  const isComplete = useCallback((): boolean => {
    // Wizard is complete if user has made at least some selections
    return (
      wizardState.location !== '' &&
      (wizardState.mealTypes.length > 0 ||
       wizardState.serviceStyles.length > 0 ||
       wizardState.dietary.length > 0 ||
       wizardState.features.length > 0 ||
       wizardState.timing === 'later' ||
       (wizardState.budget[0] > 1 || wizardState.budget[1] < 4))
    )
  }, [wizardState])

  // Get completion progress as percentage (0-100)
  const getCompletionProgress = useCallback((): number => {
    let completedSteps = 0
    const totalSteps = 7

    // Step 1: Location (always considered complete if not empty)
    if (wizardState.location) completedSteps++

    // Step 2: Meal Types
    if (wizardState.mealTypes.length > 0) completedSteps++

    // Step 3: Service Styles
    if (wizardState.serviceStyles.length > 0) completedSteps++

    // Step 4: Timing
    if (wizardState.timing === 'later' || wizardState.timing === 'now') completedSteps++

    // Step 5: Budget (complete if changed from default)
    if (wizardState.budget[0] > 1 || wizardState.budget[1] < 4) completedSteps++

    // Step 6: Dietary
    if (wizardState.dietary.length > 0) completedSteps++

    // Step 7: Features
    if (wizardState.features.length > 0) completedSteps++

    return Math.round((completedSteps / totalSteps) * 100)
  }, [wizardState])

  // Load saved state on mount if persistence is enabled
  useEffect(() => {
    if (persistState) {
      loadWizardState()
    }
  }, [persistState, loadWizardState])

  return {
    wizardState,
    updateWizardState,
    resetWizard,
    saveWizardState,
    loadWizardState,
    clearSavedState,
    isComplete: isComplete(),
    getCompletionProgress,
  }
}

// Helper function to convert wizard state to human-readable summary
export const getWizardSummary = (state: WizardState): string => {
  const parts: string[] = []

  if (state.location) {
    parts.push(`📍 ${state.location}`)
  }

  if (state.mealTypes.length > 0) {
    parts.push(`🍽️ ${state.mealTypes.join(', ')}`)
  }

  if (state.serviceStyles.length > 0) {
    parts.push(`🥡 ${state.serviceStyles.join(', ')}`)
  }

  if (state.timing === 'later' && state.scheduledTime) {
    const time = new Date(state.scheduledTime).toLocaleString()
    parts.push(`⏰ ${time}`)
  } else if (state.timing === 'now') {
    parts.push(`⚡ Right now`)
  }

  if (state.budget[0] > 1 || state.budget[1] < 4) {
    const priceSymbols = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }
    const min = priceSymbols[state.budget[0] as keyof typeof priceSymbols]
    const max = priceSymbols[state.budget[1] as keyof typeof priceSymbols]
    parts.push(`💰 ${min} - ${max}`)
  }

  if (state.dietary.length > 0 && !state.dietary.includes('none')) {
    parts.push(`🌱 ${state.dietary.join(', ')}`)
  }

  if (state.features.length > 0) {
    parts.push(`✨ ${state.features.length} features`)
  }

  return parts.join(' • ')
}

// Helper function to validate wizard state
export const validateWizardState = (state: WizardState): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!state.location || state.location.trim() === '') {
    errors.push('Location is required')
  }

  if (state.timing === 'later' && !state.scheduledTime) {
    errors.push('Scheduled time is required when timing is set to later')
  }

  if (state.budget.length !== 2 || state.budget[0] > state.budget[1]) {
    errors.push('Invalid budget range')
  }

  if (state.budget[0] < 1 || state.budget[1] > 4) {
    errors.push('Budget must be between $ and $$$$')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}