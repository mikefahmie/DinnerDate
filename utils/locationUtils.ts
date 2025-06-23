// utils/locationUtils.ts - Updated to use centralized market config
import { MarketConfig, MARKETS, Market } from '../config/markets'

// Re-export main functions for backward compatibility
export const normalizeLocationToMarket = (location: string): string => {
  return MarketConfig.normalizeToMarketName(location)
}

export const getDefaultMarket = (): string => {
  return MarketConfig.getDefaultMarket().name
}

export const getDisplayName = (marketName: string): string => {
  return MarketConfig.getDisplayName(marketName)
}

export const getShortName = (marketName: string): string => {
  return MarketConfig.getShortName(marketName)
}

// Re-export for convenience
export { MARKETS, MarketConfig, type Market } from '../config/markets'

// Legacy constant for backward compatibility (now references centralized config)
export const AVAILABLE_MARKETS = MARKETS.map(market => ({
  id: market.id,
  name: market.name,
  displayName: market.displayName,
  shortName: market.shortName,
  state: market.state,
  isActive: market.isActive,
}))

// Additional utility functions
export const getCurrentMarketConfig = (): Market => {
  return MarketConfig.getDefaultMarket()
}

export const isValidMarket = (marketName: string): boolean => {
  return MarketConfig.getMarketByName(marketName) !== undefined
}

export const getMarketDisplayInfo = (marketName: string) => {
  const market = MarketConfig.getMarketByName(marketName)
  return {
    displayName: market?.displayName || marketName,
    shortName: market?.shortName || marketName,
    state: market?.state || '',
    isActive: market?.isActive || false
  }
}