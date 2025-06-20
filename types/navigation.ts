// types/navigation.ts - Create this file for proper navigation typing
import { WizardState } from '../screens/DiscoveryWizard'

export type RootStackParamList = {
  Splash: undefined
  Auth: undefined
  DiscoveryWizard: undefined
  MainTabs: undefined
  RestaurantDiscovery: {
    filters?: WizardState
  }
  RestaurantDetail: {
    restaurantId: string
  }
}

export type MainTabParamList = {
  Discovery: undefined
  Home: undefined
  Favorites: undefined
  Profile: undefined
}