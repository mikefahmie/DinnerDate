// types/wizard.ts - Updated interface to match new wizard structure
export interface WizardState {
  location: string
  mealTypes: string[]      // Maps to serves_breakfast, serves_lunch, etc.
  budget: number[]         // Price levels [1,2,3,4]
  cuisineTypes: string[]   // Cuisine filtering (conditional step)
  dietary: string[]        // Dietary restrictions
  features: string[]       // Restaurant features
}

// Legacy interface for backward compatibility during migration
export interface LegacyWizardState {
  location: string
  mealTypes: string[]
  serviceStyles: string[]
  timing: 'now' | 'later' | 'anytime'
  scheduledTime?: Date
  budget: number[]
  dietary: string[]
  features: string[]
}

// Utility function to migrate from legacy state to new state
export const migrateLegacyWizardState = (legacy: LegacyWizardState): WizardState => {
  return {
    location: legacy.location,
    mealTypes: legacy.mealTypes,
    budget: legacy.budget,
    cuisineTypes: [], // New field, start empty
    dietary: legacy.dietary,
    features: legacy.features
  }
}

// Default wizard state
export const DEFAULT_WIZARD_STATE: WizardState = {
  location: 'Ann Arbor, MI',
  mealTypes: [],
  budget: [],
  cuisineTypes: [],
  dietary: [],
  features: []
}