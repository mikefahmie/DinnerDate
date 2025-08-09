// types/navigation.ts - Updated with Search screen and search results support
import { WizardState } from '../screens/DiscoveryWizard'

export type RootStackParamList = {
  Splash: undefined
  Auth: undefined
  DiscoveryWizard: undefined
  MainTabs: undefined
  Search: undefined  // New search screen
  RestaurantDiscovery: {
    filters?: WizardState & {
      searchResults?: string[]  // Array of restaurant IDs from search
      searchResultsData?: any[]  // Full restaurant objects from search
    }
  }
  RestaurantDetail: {
    restaurantId: string
  }
}

export type MainTabParamList = {
  Discovery: undefined  // This will now go to Search screen
  Home: undefined
  Favorites: undefined
  Profile: undefined
}