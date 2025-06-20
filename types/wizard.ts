// types/wizard.ts
export interface WizardState {
  location: string
  mealTypes: string[]
  serviceStyles: string[]
  timing: 'now' | 'later'
  scheduledTime?: Date
  budget: number[]
  dietary: string[]
  features: string[]
}