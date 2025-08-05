// utils/fontAwesome.ts - Fixed FontAwesome Setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faLeaf,
  faUtensils,
  faPizzaSlice,
  faBowlFood,
  faHamburger,
  faCoffee,
  faFish,
  faSun,
  faCheckCircle,
  faSeedling,
  faBan,
  faWineGlass,
  faCocktail,
  faBeer,
  faCalendar,
  faMusic,
  faDog,
  faUsers,
  faChild,
  faTv,
  faWheelchair,
  faParking,
  faWifi,
  faShoppingBag,
  faTruck,
  faCompass,
  faUser,
  faDollarSign,
  faMoneyBillWave,
  faGlobeAfrica,
  faCircle,
  faBreadSlice,
  faFire,
  faIceCream,
  faBars,
  faChevronLeft,
  faTimes,
  faCheck,
  faCog,
  faSearch,
  faFilter,
  faSort,
  faShare,
  faEllipsisH
} from '@fortawesome/pro-solid-svg-icons'

import { 
  faHeart 
} from '@fortawesome/pro-regular-svg-icons'

import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core'

// Add all icons to the library BEFORE using them
library.add(
  // Solid icons
  faLeaf,
  faUtensils,
  faPizzaSlice,
  faBowlFood,
  faHamburger,
  faCoffee,
  faFish,
  faSun,
  faCheckCircle,
  faSeedling,
  faBan,
  faWineGlass,
  faCocktail,
  faBeer,
  faCalendar,
  faMusic,
  faDog,
  faUsers,
  faChild,
  faTv,
  faWheelchair,
  faParking,
  faWifi,
  faShoppingBag,
  faTruck,
  faCompass,
  faUser,
  faDollarSign,
  faMoneyBillWave,
  faGlobeAfrica,
  faCircle,
  faBreadSlice,
  faFire,
  faIceCream,
  faBars,
  faChevronLeft,
  faTimes,
  faCheck,
  faCog,
  faSearch,
  faFilter,
  faSort,
  faShare,
  faEllipsisH,
  
  // Regular icons
  faHeart
)

// Icon style constants
export const IconStyles = {
  SOLID: 'fas' as IconPrefix,
  REGULAR: 'far' as IconPrefix,
  DUOTONE: 'fad' as IconPrefix,
  BRANDS: 'fab' as IconPrefix
} as const

// Helper function to create FontAwesome icon arrays with proper typing
export const createIcon = (style: IconPrefix, name: string): [IconPrefix, IconName] => {
  return [style, name as IconName]
}

// App icons with ONLY icons that are imported above
export const AppIcons = {
  // Navigation & System
  MENU: createIcon(IconStyles.SOLID, 'bars'),
  BACK: createIcon(IconStyles.SOLID, 'chevron-left'),
  CLOSE: createIcon(IconStyles.SOLID, 'times'),
  CHECK: createIcon(IconStyles.SOLID, 'check'),
  SETTINGS: createIcon(IconStyles.SOLID, 'cog'),
  SEARCH: createIcon(IconStyles.SOLID, 'search'),
  FILTER: createIcon(IconStyles.SOLID, 'filter'),
  SORT: createIcon(IconStyles.SOLID, 'sort'),
  HEART: createIcon(IconStyles.REGULAR, 'heart'),
  SHARE: createIcon(IconStyles.SOLID, 'share'),
  MORE: createIcon(IconStyles.SOLID, 'ellipsis-h'),

  // Meal Types
  BREAKFAST: createIcon(IconStyles.SOLID, 'sun'),
  LUNCH: createIcon(IconStyles.SOLID, 'hamburger'),
  DINNER: createIcon(IconStyles.SOLID, 'utensils'),
  COFFEE: createIcon(IconStyles.SOLID, 'coffee'),
  DESSERT: createIcon(IconStyles.SOLID, 'ice-cream'),

  // Budget
  DOLLAR: createIcon(IconStyles.SOLID, 'dollar-sign'),
  MONEY: createIcon(IconStyles.SOLID, 'money-bill-wave'),

  // Cuisine Types (only using imported icons)
  AFRICAN: createIcon(IconStyles.SOLID, 'globe-africa'),
  BAGEL: createIcon(IconStyles.SOLID, 'circle'),
  BAKERY: createIcon(IconStyles.SOLID, 'bread-slice'),
  BAR_GRILL: createIcon(IconStyles.SOLID, 'beer'),
  BBQ: createIcon(IconStyles.SOLID, 'fire'),
  BREAKFAST_FOOD: createIcon(IconStyles.SOLID, 'sun'),
  BRUNCH: createIcon(IconStyles.SOLID, 'coffee'),
  CHINESE: createIcon(IconStyles.SOLID, 'bowl-food'),
  FAST_FOOD: createIcon(IconStyles.SOLID, 'hamburger'),
  BURGER: createIcon(IconStyles.SOLID, 'hamburger'),
  MEDITERRANEAN: createIcon(IconStyles.SOLID, 'leaf'),
  MIDDLE_EASTERN: createIcon(IconStyles.SOLID, 'utensils'),
  PIZZA: createIcon(IconStyles.SOLID, 'pizza-slice'),
  SEAFOOD: createIcon(IconStyles.SOLID, 'fish'),
  SUSHI: createIcon(IconStyles.SOLID, 'fish'),
  ICE_CREAM: createIcon(IconStyles.SOLID, 'ice-cream'),
  STEAK: createIcon(IconStyles.SOLID, 'utensils'),

  // Dietary
  NO_RESTRICTIONS: createIcon(IconStyles.SOLID, 'check-circle'),
  VEGETARIAN: createIcon(IconStyles.SOLID, 'leaf'),
  VEGAN: createIcon(IconStyles.SOLID, 'seedling'),
  GLUTEN_FREE: createIcon(IconStyles.SOLID, 'ban'),

  // Beverages
  WINE: createIcon(IconStyles.SOLID, 'wine-glass'),
  COCKTAILS: createIcon(IconStyles.SOLID, 'cocktail'),
  BEER: createIcon(IconStyles.SOLID, 'beer'),
  COFFEE_SERVICE: createIcon(IconStyles.SOLID, 'coffee'),

  // Amenities
  OUTDOOR_SEATING: createIcon(IconStyles.SOLID, 'sun'),
  RESERVATIONS: createIcon(IconStyles.SOLID, 'calendar'),
  LIVE_MUSIC: createIcon(IconStyles.SOLID, 'music'),
  DOG_FRIENDLY: createIcon(IconStyles.SOLID, 'dog'),
  GROUP_DINING: createIcon(IconStyles.SOLID, 'users'),
  FAMILY_FRIENDLY: createIcon(IconStyles.SOLID, 'child'),
  SPORTS: createIcon(IconStyles.SOLID, 'tv'),

  // Accessibility
  WHEELCHAIR: createIcon(IconStyles.SOLID, 'wheelchair'),
  PARKING: createIcon(IconStyles.SOLID, 'parking'),
  WIFI: createIcon(IconStyles.SOLID, 'wifi'),
  TAKEOUT: createIcon(IconStyles.SOLID, 'shopping-bag'),
  DELIVERY: createIcon(IconStyles.SOLID, 'truck'),

  // Tab Navigation
  DISCOVER: createIcon(IconStyles.SOLID, 'compass'),
  FAVORITES: createIcon(IconStyles.REGULAR, 'heart'),
  PROFILE: createIcon(IconStyles.SOLID, 'user')
} as const

export default AppIcons