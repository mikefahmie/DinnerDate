// components/filters/FilterModal.tsx
import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView 
} from 'react-native'
import { Button, Header, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'
import MealTypeStep from '../wizard/MealTypeStep'
import ServiceStyleStep from '../wizard/ServiceStyleStep'
import TimingStep from '../wizard/TimingStep'
import BudgetStep from '../wizard/BudgetStep'
import DietaryStep from '../wizard/DietaryStep'
import FeaturesStep from '../wizard/FeaturesStep'

interface FilterModalProps {
  visible: boolean
  filters: WizardState
  onFiltersUpdate: (filters: WizardState) => void
  onClose: () => void
}

type FilterSection = 'meal' | 'service' | 'timing' | 'budget' | 'dietary' | 'features'

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  onFiltersUpdate,
  onClose,
}) => {
  const { theme } = useTheme()
  const [activeSection, setActiveSection] = useState<FilterSection>('meal')
  const [tempFilters, setTempFilters] = useState<WizardState>(filters)

  const updateTempFilters = (updates: Partial<WizardState>) => {
    setTempFilters(prev => ({ ...prev, ...updates }))
  }

  const handleApply = () => {
    onFiltersUpdate(tempFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: WizardState = {
      location: filters.location, // Keep location
      mealTypes: [],
      serviceStyles: [],
      timing: 'now',
      budget: [1, 4],
      dietary: [],
      features: [],
    }
    setTempFilters(resetFilters)
  }

  const handleClose = () => {
    setTempFilters(filters) // Reset to original filters
    onClose()
  }

  const getSectionIcon = (section: FilterSection): string => {
    const icons = {
      meal: 'cutlery',
      service: 'shopping-bag',
      timing: 'clock-o',
      budget: 'dollar',
      dietary: 'leaf',
      features: 'star',
    }
    return icons[section]
  }

  const getSectionTitle = (section: FilterSection): string => {
    const titles = {
      meal: 'Meal Type',
      service: 'Service Style',
      timing: 'Timing',
      budget: 'Budget',
      dietary: 'Dietary',
      features: 'Features',
    }
    return titles[section]
  }

  const getSectionCount = (section: FilterSection): number => {
    switch (section) {
      case 'meal':
        return tempFilters.mealTypes?.length || 0
      case 'service':
        return tempFilters.serviceStyles?.length || 0
      case 'timing':
        return tempFilters.timing === 'now' ? 0 : 1
      case 'budget':
        return (tempFilters.budget?.[0] !== 1 || tempFilters.budget?.[1] !== 4) ? 1 : 0
      case 'dietary':
        return tempFilters.dietary?.filter(d => d !== 'none').length || 0
      case 'features':
        return tempFilters.features?.length || 0
      default:
        return 0
    }
  }

  const renderSectionButton = (section: FilterSection) => {
    const isActive = activeSection === section
    const count = getSectionCount(section)
    
    return (
      <TouchableOpacity
        key={section}
        style={[
          styles.sectionButton,
          isActive && styles.activeSectionButton,
        ]}
        onPress={() => setActiveSection(section)}
      >
        <View style={styles.sectionButtonContent}>
          <Icon
            name={getSectionIcon(section)}
            type="font-awesome"
            size={16}
            color={isActive ? theme.colors.textOnPrimary : theme.colors.textPrimary}
          />
          <Text
            style={[
              styles.sectionButtonText,
              isActive && styles.activeSectionButtonText,
            ]}
          >
            {getSectionTitle(section)}
          </Text>
        </View>
        
        {count > 0 && (
          <View style={[
            styles.sectionBadge,
            isActive && styles.activeSectionBadge,
          ]}>
            <Text style={[
              styles.sectionBadgeText,
              isActive && styles.activeSectionBadgeText,
            ]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const renderActiveSection = () => {
    const commonProps = {
      wizardState: tempFilters,
      updateWizardState: updateTempFilters,
      onNext: () => {}, // Not used in modal context
    }

    switch (activeSection) {
      case 'meal':
        return <MealTypeStep {...commonProps} />
      case 'service':
        return <ServiceStyleStep {...commonProps} />
      case 'timing':
        return <TimingStep {...commonProps} />
      case 'budget':
        return <BudgetStep {...commonProps} />
      case 'dietary':
        return <DietaryStep {...commonProps} />
      case 'features':
        return <FeaturesStep {...commonProps} />
      default:
        return null
    }
  }

  const getTotalFilterCount = () => {
    return Object.values({
      meal: getSectionCount('meal'),
      service: getSectionCount('service'),
      timing: getSectionCount('timing'),
      budget: getSectionCount('budget'),
      dietary: getSectionCount('dietary'),
      features: getSectionCount('features'),
    }).reduce((sum, count) => sum + count, 0)
  }

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebar: {
      width: 120,
      backgroundColor: theme.colors.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colors.divider,
    },
    sidebarContent: {
      padding: theme.spacing.sm,
    },
    sectionButton: {
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
      position: 'relative',
    },
    activeSectionButton: {
      backgroundColor: theme.colors.primary,
    },
    sectionButtonContent: {
      alignItems: 'center',
    },
    sectionButtonText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
      fontWeight: '500',
    },
    activeSectionButtonText: {
      color: theme.colors.textOnPrimary,
    },
    sectionBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: theme.colors.error,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeSectionBadge: {
      backgroundColor: theme.colors.textOnPrimary,
    },
    sectionBadgeText: {
      fontSize: 10,
      color: theme.colors.textOnPrimary,
      fontWeight: '600',
    },
    activeSectionBadgeText: {
      color: theme.colors.primary,
    },
    mainContent: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    sectionHeader: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    sectionContent: {
      flex: 1,
    },
    footerContainer: {
      flexDirection: 'row',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    resetButton: {
      flex: 1,
      marginRight: theme.spacing.sm,
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
    },
    resetButtonTitle: {
      color: theme.colors.textPrimary,
    },
    applyButton: {
      flex: 2,
      marginLeft: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
    },
    applyButtonTitle: {
      color: theme.colors.textOnPrimary,
    },
    filterSummary: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    summaryText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  })

  const totalFilters = getTotalFilterCount()

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Header
          centerComponent={{
            text: 'Edit Filters',
            style: {
              color: theme.colors.textOnPrimary,
              fontSize: theme.typography.fontSize.h2,
              fontWeight: '600',
            },
          }}
          rightComponent={{
            icon: 'times',
            type: 'font-awesome',
            color: theme.colors.textOnPrimary,
            onPress: handleClose,
          }}
          backgroundColor={theme.colors.primary}
        />

        {totalFilters > 0 && (
          <View style={styles.filterSummary}>
            <Text style={styles.summaryText}>
              {totalFilters} filter{totalFilters !== 1 ? 's' : ''} applied
            </Text>
          </View>
        )}

        <View style={styles.contentContainer}>
          <View style={styles.sidebar}>
            <ScrollView style={styles.sidebarContent}>
              {(['meal', 'service', 'timing', 'budget', 'dietary', 'features'] as FilterSection[]).map(renderSectionButton)}
            </ScrollView>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {getSectionTitle(activeSection)}
              </Text>
            </View>

            <ScrollView style={styles.sectionContent}>
              {renderActiveSection()}
            </ScrollView>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Button
            title="Reset All"
            onPress={handleReset}
            buttonStyle={styles.resetButton}
            titleStyle={styles.resetButtonTitle}
          />
          <Button
            title={`Apply Filters${totalFilters > 0 ? ` (${totalFilters})` : ''}`}
            onPress={handleApply}
            buttonStyle={styles.applyButton}
            titleStyle={styles.applyButtonTitle}
          />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default FilterModal