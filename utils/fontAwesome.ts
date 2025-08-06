// utils/fontAwesome.ts - Updated with missing icons
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faLeaf,
  faUtensils,
  faPizzaSlice,
  faBowlFood,
  faHamburger,
  faBurger,
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
  // Additional icons needed for features
  faGlobe,
  faCross,
  faStar,
  faTree,
  faHome,
  faMoon,
  faCarrot,
  faShield,
  faMapMarkerAlt,
  faPeopleGroup,
  faFamilyPants,
  faDogLeashed,
  faWheelchairMove
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
  faBurger,
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
  faGlobe,
  faCross,
  faStar,
  faTree,
  faHome,
  faMoon,
  faCarrot,
  faShield,
  faMapMarkerAlt,
  faPeopleGroup,
  faFamilyPants,
  faDogLeashed,
  faWheelchairMove,
  
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
  BREAKFAST: createIcon(IconStyles.DUOTONE, 'sun'),
  LUNCH: createIcon(IconStyles.SOLID, 'hamburger'),
  DINNER: createIcon(IconStyles.SOLID, 'utensils'),
  UTENSILS: createIcon(IconStyles.SOLID, 'utensils'), // Added for FilterModal
  COFFEE: createIcon(IconStyles.SOLID, 'coffee'),
  DESSERT: createIcon(IconStyles.SOLID, 'ice-cream'),

  // Budget
  DOLLAR: createIcon(IconStyles.SOLID, 'dollar-sign'),
  MONEY: createIcon(IconStyles.SOLID, 'money-bill-wave'),

  // Cuisine Types - using available icons
  AFRICAN: createIcon(IconStyles.SOLID, 'globe-africa'),
  AMERICAN: createIcon(IconStyles.SOLID, 'hamburger'),
  BAGEL: createIcon(IconStyles.SOLID, 'circle'),
  BAKERY: createIcon(IconStyles.SOLID, 'bread-slice'),
  BAR_GRILL: createIcon(IconStyles.SOLID, 'beer'),
  BBQ: createIcon(IconStyles.SOLID, 'fire'),
  BREAKFAST_FOOD: createIcon(IconStyles.SOLID, 'sun'),
  BRITISH: createIcon(IconStyles.SOLID, 'globe'),
  BRAZILIAN: createIcon(IconStyles.SOLID, 'globe'),
  BRUNCH: createIcon(IconStyles.SOLID, 'coffee'),
  BURGER: createIcon(IconStyles.SOLID, 'burger'),
  CHINESE: createIcon(IconStyles.SOLID, 'bowl-food'),
  ETHIOPIAN: createIcon(IconStyles.SOLID, 'globe'),
  FAST_FOOD: createIcon(IconStyles.SOLID, 'hamburger'),
  FRENCH: createIcon(IconStyles.SOLID, 'utensils'),
  GERMAN: createIcon(IconStyles.SOLID, 'beer'),
  GREEK: createIcon(IconStyles.SOLID, 'leaf'),
  INDIAN: createIcon(IconStyles.SOLID, 'fire'),
  ITALIAN: createIcon(IconStyles.SOLID, 'pizza-slice'),
  JAPANESE: createIcon(IconStyles.SOLID, 'fish'),
  KOREAN: createIcon(IconStyles.SOLID, 'bowl-food'),
  LEBANESE: createIcon(IconStyles.SOLID, 'leaf'),
  MEDITERRANEAN: createIcon(IconStyles.SOLID, 'leaf'),
  MEXICAN: createIcon(IconStyles.SOLID, 'fire'),
  MIDDLE_EASTERN: createIcon(IconStyles.SOLID, 'utensils'),
  PIZZA: createIcon(IconStyles.SOLID, 'pizza-slice'),
  SANDWICH: createIcon(IconStyles.SOLID, 'hamburger'),
  SEAFOOD: createIcon(IconStyles.SOLID, 'fish'),
  SPANISH: createIcon(IconStyles.SOLID, 'utensils'),
  STEAK: createIcon(IconStyles.SOLID, 'utensils'),
  STEAKHOUSE: createIcon(IconStyles.SOLID, 'utensils'),
  SUSHI: createIcon(IconStyles.SOLID, 'fish'),
  THAI: createIcon(IconStyles.SOLID, 'bowl-food'),
  TURKISH: createIcon(IconStyles.SOLID, 'utensils'),
  VIETNAMESE: createIcon(IconStyles.SOLID, 'bowl-food'),

  // Dietary Restrictions
  NO_RESTRICTIONS: createIcon(IconStyles.SOLID, 'check-circle'),
  VEGETARIAN: createIcon(IconStyles.SOLID, 'leaf'),
  VEGAN: createIcon(IconStyles.SOLID, 'seedling'),
  GLUTEN_FREE: createIcon(IconStyles.SOLID, 'ban'),
  HALAL: createIcon(IconStyles.SOLID, 'star'),
  KOSHER: createIcon(IconStyles.SOLID, 'star'),

  // Beverages
  WINE: createIcon(IconStyles.SOLID, 'wine-glass'),
  COCKTAILS: createIcon(IconStyles.SOLID, 'cocktail'),
  BEER: createIcon(IconStyles.SOLID, 'beer'),
  COFFEE_SERVICE: createIcon(IconStyles.SOLID, 'coffee'),

  // Amenities
  OUTDOOR_SEATING: createIcon(IconStyles.SOLID, 'sun'),
  RESERVATIONS: createIcon(IconStyles.SOLID, 'calendar'),
  LIVE_MUSIC: createIcon(IconStyles.SOLID, 'music'),
  GROUP_DINING: createIcon(IconStyles.SOLID, 'people-group'),
  FAMILY_FRIENDLY: createIcon(IconStyles.SOLID, 'family-pants'),
  DOG_FRIENDLY: createIcon(IconStyles.SOLID, 'dog-leashed'),
  SPORTS: createIcon(IconStyles.SOLID, 'tv'),
  TAKEOUT: createIcon(IconStyles.SOLID, 'shopping-bag'),
  DELIVERY: createIcon(IconStyles.SOLID, 'truck'),
  WIFI: createIcon(IconStyles.SOLID, 'wifi'),
  PARKING: createIcon(IconStyles.SOLID, 'parking'),

  // Accessibility
  WHEELCHAIR: createIcon(IconStyles.SOLID, 'wheelchair-move'),

  // Tab Navigation
  DISCOVER: createIcon(IconStyles.SOLID, 'compass'),
  FAVORITES: createIcon(IconStyles.REGULAR, 'heart'),
  PROFILE: createIcon(IconStyles.SOLID, 'user')
} as const

export default AppIcons