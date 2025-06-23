// config/markets.ts - Fixed export conflict
export interface Market {
  id: string
  name: string                    // Database value (what gets stored)
  displayName: string            // User-facing display name
  shortName: string             // Abbreviated version
  state: string
  counties?: string[]           // Counties covered by this market
  cities: string[]              // All cities/areas included
  isActive: boolean
  launchDate?: string
  timezone: string
  coordinates?: {
    lat: number
    lng: number
    radius?: number             // Search radius in miles
  }
}

// Central market configuration - single source of truth
export const MARKETS: Market[] = [
  {
    id: 'ann-arbor-ypsilanti',
    name: 'Ann Arbor/Ypsilanti',           // Database value
    displayName: 'Ann Arbor & Ypsilanti', // User display
    shortName: 'Ann Arbor',               // Short display
    state: 'Michigan',
    counties: ['Washtenaw County'],
    cities: ['Ann Arbor', 'Ypsilanti', 'Saline', 'Chelsea', 'Dexter'],
    isActive: true,
    launchDate: '2025-01-01',
    timezone: 'America/Detroit',
    coordinates: {
      lat: 42.2808,
      lng: -83.7430,
      radius: 15
    }
  },
  // Future markets (examples)
  {
    id: 'detroit-metro',
    name: 'Detroit Metro',
    displayName: 'Detroit Metropolitan Area',
    shortName: 'Detroit',
    state: 'Michigan',
    counties: ['Wayne County', 'Oakland County', 'Macomb County'],
    cities: ['Detroit', 'Warren', 'Sterling Heights', 'Troy', 'Westland'],
    isActive: false, // Not launched yet
    launchDate: '2025-09-01',
    timezone: 'America/Detroit',
    coordinates: {
      lat: 42.3314,
      lng: -83.0458,
      radius: 25
    }
  },
  {
    id: 'grand-rapids',
    name: 'Grand Rapids',
    displayName: 'Grand Rapids Area',
    shortName: 'Grand Rapids',
    state: 'Michigan',
    counties: ['Kent County'],
    cities: ['Grand Rapids', 'Wyoming', 'Kentwood', 'Walker'],
    isActive: false,
    launchDate: '2025-12-01',
    timezone: 'America/Detroit',
    coordinates: {
      lat: 42.9634,
      lng: -85.6681,
      radius: 20
    }
  }
]

// Market utilities
export class MarketConfig {
  // Get default/primary market
  static getDefaultMarket(): Market {
    return MARKETS.find(market => market.isActive) || MARKETS[0]
  }

  // Get all active markets
  static getActiveMarkets(): Market[] {
    return MARKETS.filter(market => market.isActive)
  }

  // Get all markets (including inactive)
  static getAllMarkets(): Market[] {
    return MARKETS
  }

  // Find market by database name
  static getMarketByName(name: string): Market | undefined {
    return MARKETS.find(market => market.name === name)
  }

  // Find market by ID
  static getMarketById(id: string): Market | undefined {
    return MARKETS.find(market => market.id === id)
  }

  // Get market database value from any input format
  static normalizeToMarketName(input: string): string {
    // Direct match first
    const directMatch = MARKETS.find(market => market.name === input)
    if (directMatch) return directMatch.name

    // Check display names, short names, and cities
    const inputLower = input.toLowerCase()
    
    for (const market of MARKETS) {
      // Check display name
      if (market.displayName.toLowerCase() === inputLower) {
        return market.name
      }
      
      // Check short name
      if (market.shortName.toLowerCase() === inputLower) {
        return market.name
      }
      
      // Check if input matches any city in the market
      const cityMatch = market.cities.some(city => 
        city.toLowerCase() === inputLower ||
        city.toLowerCase().includes(inputLower) ||
        inputLower.includes(city.toLowerCase())
      )
      
      if (cityMatch) {
        return market.name
      }
    }

    // Legacy mappings for backward compatibility
    const legacyMappings: Record<string, string> = {
      'ann arbor, mi': 'Ann Arbor/Ypsilanti',
      'ann arbor': 'Ann Arbor/Ypsilanti',
      'ypsilanti, mi': 'Ann Arbor/Ypsilanti',
      'ypsilanti': 'Ann Arbor/Ypsilanti',
      'a2': 'Ann Arbor/Ypsilanti',
      'ypsi': 'Ann Arbor/Ypsilanti'
    }

    return legacyMappings[inputLower] || input
  }

  // Get user-friendly display name from database value
  static getDisplayName(marketName: string): string {
    const market = this.getMarketByName(marketName)
    return market?.displayName || marketName
  }

  // Get short display name from database value
  static getShortName(marketName: string): string {
    const market = this.getMarketByName(marketName)
    return market?.shortName || marketName
  }

  // Check if a market is active
  static isMarketActive(marketName: string): boolean {
    const market = this.getMarketByName(marketName)
    return market?.isActive || false
  }

  // Get markets for dropdown/selection UI
  static getMarketsForUI(): Array<{ label: string; value: string; isActive: boolean }> {
    return MARKETS.map(market => ({
      label: market.displayName,
      value: market.name,
      isActive: market.isActive
    }))
  }

  // Get coming soon markets
  static getComingSoonMarkets(): Market[] {
    return MARKETS.filter(market => !market.isActive)
  }
}

// Export for easy access
export const getDefaultMarket = () => MarketConfig.getDefaultMarket().name
export const getActiveMarkets = () => MarketConfig.getActiveMarkets()
export const normalizeLocationToMarket = (location: string) => MarketConfig.normalizeToMarketName(location)