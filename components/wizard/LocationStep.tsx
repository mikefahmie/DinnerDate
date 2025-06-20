// components/wizard/LocationStep.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'

interface LocationStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

// Available markets - currently just Ann Arbor, but structured for expansion
const AVAILABLE_MARKETS = [
  {
    id: 'ann-arbor',
    name: 'Ann Arbor, MI',
    displayName: 'Ann Arbor',
    state: 'Michigan',
    isActive: true,
  },
  // Future markets would be added here
]

const LocationStep: React.FC<LocationStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()
  const [selectedMarket, setSelectedMarket] = useState(wizardState.location)

  // Auto-select Ann Arbor as default since it's the only option
  useEffect(() => {
    if (!selectedMarket) {
      const defaultMarket = AVAILABLE_MARKETS.find(market => market.isActive)?.name || 'Ann Arbor, MI'
      setSelectedMarket(defaultMarket)
      updateWizardState({ location: defaultMarket })
    }
  }, [])

  const handleMarketSelect = (marketName: string) => {
    setSelectedMarket(marketName)
    updateWizardState({ location: marketName })
  }

  const handleContinue = () => {
    if (selectedMarket) {
      onNext()
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacing.lg,
    },
    content: {
      flex: 1,
      justifyContent: 'space-between',
    },
    selectionArea: {
      flex: 1,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: theme.typography.fontSize.body * 1.4,
    },
    marketContainer: {
      marginBottom: theme.spacing.lg,
    },
    marketCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedMarketCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    marketHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    marketInfo: {
      flex: 1,
    },
    marketName: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedMarketName: {
      color: theme.colors.primary,
    },
    marketState: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    checkIcon: {
      marginLeft: theme.spacing.md,
    },
    expansionMessage: {
      backgroundColor: theme.colors.accent + '20', // 20% opacity
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    expansionText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    comingSoonText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
      fontStyle: 'italic',
    },
    futureMarkets: {
      marginTop: theme.spacing.md,
    },
    futureMarketsList: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.caption * 1.4,
    },
    buttonContainer: {
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
    },
    continueButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    continueButtonText: {
      fontSize: theme.typography.fontSize.button,
      fontWeight: '600',
      color: theme.colors.white,
    },
    continueButtonTextDisabled: {
      color: theme.colors.textSecondary,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.selectionArea}>
          <Text style={styles.subtitle}>
            Let's start by choosing your location for the best restaurant recommendations.
          </Text>

          <View style={styles.marketContainer}>
            {AVAILABLE_MARKETS.map((market) => (
              <TouchableOpacity
                key={market.id}
                style={[
                  styles.marketCard,
                  selectedMarket === market.name && styles.selectedMarketCard,
                ]}
                onPress={() => handleMarketSelect(market.name)}
                activeOpacity={0.7}
              >
                <View style={styles.marketHeader}>
                  <View style={styles.marketInfo}>
                    <Text style={[
                      styles.marketName,
                      selectedMarket === market.name && styles.selectedMarketName,
                    ]}>
                      {market.displayName}
                    </Text>
                    <Text style={styles.marketState}>
                      {market.state}
                    </Text>
                  </View>
                  
                  {selectedMarket === market.name && (
                    <View style={styles.checkIcon}>
                      <Icon
                        name="check-circle"
                        type="feather"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.expansionMessage}>
            <Text style={styles.expansionText}>
              Currently serving Ann Arbor
            </Text>
            <Text style={styles.comingSoonText}>
              More cities coming soon!
            </Text>
            
            <View style={styles.futureMarkets}>
              <Text style={styles.futureMarketsList}>
                Detroit • Grand Rapids • East Lansing • Kalamazoo{'\n'}
                Chicago • Columbus • Madison
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedMarket}
            buttonStyle={[
              styles.continueButton,
              !selectedMarket && styles.continueButtonDisabled,
            ]}
            titleStyle={[
              styles.continueButtonText,
              !selectedMarket && styles.continueButtonTextDisabled,
            ]}
          />
        </View>
      </View>
    </View>
  )
}

export default LocationStep