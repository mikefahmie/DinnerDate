// components/wizard/LocationStep.tsx - Fixed to use compact header and safe area
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'
import { MarketConfig, Market } from '../../config/markets'

interface LocationStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

const LocationStep: React.FC<LocationStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()
  const [selectedMarket, setSelectedMarket] = useState(wizardState.location)

  // Get markets for display
  const activeMarkets = MarketConfig.getActiveMarkets()
  const comingSoonMarkets = MarketConfig.getComingSoonMarkets()

  // Auto-select default market if none selected
  useEffect(() => {
    if (!selectedMarket && activeMarkets.length > 0) {
      const defaultMarket = MarketConfig.getDefaultMarket()
      setSelectedMarket(defaultMarket.name)
      updateWizardState({ location: defaultMarket.name })
    }
  }, [selectedMarket, activeMarkets, updateWizardState])

  const handleMarketSelect = (market: Market) => {
    if (!market.isActive) return // Prevent selection of inactive markets
    
    setSelectedMarket(market.name)
    updateWizardState({ location: market.name })
  }

  const handleContinue = () => {
    if (selectedMarket) {
      onNext()
    }
  }

  const renderMarketCard = (market: Market, isComingSoon: boolean = false) => (
    <TouchableOpacity
      key={market.id}
      style={[
        styles.marketCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: selectedMarket === market.name ? theme.colors.primary : theme.colors.border,
          borderWidth: selectedMarket === market.name ? 2 : 1,
          opacity: isComingSoon ? 0.6 : 1,
        },
      ]}
      onPress={() => !isComingSoon && handleMarketSelect(market)}
      disabled={isComingSoon}
    >
      <View style={styles.marketInfo}>
        <Text style={[styles.marketName, { color: theme.colors.textPrimary }]}>
          {market.displayName}
        </Text>
        <Text style={[styles.marketState, { color: theme.colors.textSecondary }]}>
          {market.state}
        </Text>
        {market.cities && market.cities.length > 0 && (
          <Text style={[styles.marketCities, { color: theme.colors.textMuted }]}>
            {market.cities.slice(0, 3).join(', ')}
            {market.cities.length > 3 && ` +${market.cities.length - 3} more`}
          </Text>
        )}
      </View>
      
      <View style={styles.marketStatus}>
        {isComingSoon ? (
          <View style={[styles.comingSoonBadge, { backgroundColor: theme.colors.accent }]}>
            <Text style={[styles.comingSoonText, { color: theme.colors.textOnDark }]}>
              Coming Soon
            </Text>
          </View>
        ) : selectedMarket === market.name ? (
          <Icon name="check-circle" size={24} color={theme.colors.primary} />
        ) : (
          <Icon name="radio-button-unchecked" size={24} color={theme.colors.border} />
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Compact header - much smaller */}
      <View style={styles.header}>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Select your area to find restaurants near you
        </Text>
      </View>

      <ScrollView style={styles.marketsList} showsVerticalScrollIndicator={false}>
        {/* Active Markets */}
        <View style={styles.marketsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Available Now
          </Text>
          {activeMarkets.map(market => renderMarketCard(market, false))}
        </View>

        {/* Coming Soon Markets */}
        {comingSoonMarkets.length > 0 && (
          <View style={styles.marketsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Coming Soon
            </Text>
            {comingSoonMarkets.slice(0, 3).map(market => renderMarketCard(market, true))}
          </View>
        )}

        {/* Request New Market */}
        <TouchableOpacity
          style={[styles.requestCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => {
            // Handle request new market - could open modal, email, etc.
            console.log('Request new market')
          }}
        >
          <Icon name="add-location" size={24} color={theme.colors.primary} />
          <Text style={[styles.requestText, { color: theme.colors.textPrimary }]}>
            Don't see your city? Request it here
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Use original footer but with proper safe area padding */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedMarket}
          buttonStyle={[
            styles.continueButton,
            { backgroundColor: selectedMarket ? theme.colors.primary : theme.colors.disabled }
          ]}
          titleStyle={{
            color: selectedMarket ? theme.colors.textOnPrimary : theme.colors.textMuted
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 1, // Even smaller
    marginBottom: 12, // Even smaller  
    alignItems: 'center',
  },
  // Remove the large title - WizardContainer already shows it
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  marketsList: {
    flex: 1,
  },
  marketsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  marketCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  marketInfo: {
    flex: 1,
  },
  marketName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  marketState: {
    fontSize: 14,
    marginBottom: 4,
  },
  marketCities: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  marketStatus: {
    alignItems: 'center',
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requestCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  requestText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    paddingVertical: 20,
    paddingBottom: 120, // Much more padding for tabs + safe area
  },
  continueButton: {
    paddingVertical: 4,
    borderRadius: 12,
  },
})

export default LocationStep