// types/navigation.ts
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
  Favorites: undefined
  Profile: undefined
}