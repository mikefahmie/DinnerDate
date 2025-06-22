// components/filters/FilterModal.tsx - Updated to match new wizard structure
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
import BudgetStep from '../wizard/BudgetStep'
import CuisineStep from '../wizard/CuisineStep'
import DietaryStep from '../wizard/DietaryStep'
import FeaturesStep from '../wizard/FeaturesStep'

interface FilterModalProps {
  visible: boolean
  filters: WizardState
  onFiltersUpdate: (filters: WizardState) => void
  onClose: () => void
}

type FilterSection = 'meal' | 'budget' | 'cuisine' | 'dietary' | 'features'

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
      budget: [],
      cuisineTypes: [],
      dietary: [],
      features: [],
    }
    setTempFilters(resetFilters)
  }

  const handleClose = () => {
    setTempFilters(filters) // Reset to original filters
    onClose()
  }

  // Check if we should show cuisine step based on meal types
  const shouldShowCuisineStep = (): boolean => {
    const mealTypes = tempFilters.mealTypes
    return !(mealTypes.includes('breakfast') || 
             mealTypes.includes('coffee') || 
             mealTypes.includes('dessert'))
  }

  const getSectionIcon = (section: FilterSection): string => {
    const icons = {
      meal: 'cutlery',
      budget: 'dollar',
      cuisine: 'globe',
      dietary: 'leaf',
      features: 'star',
    }
    return icons[section]
  }

  const getSectionTitle = (section: FilterSection): string => {
    const titles = {
      meal: 'Meal Type',
      budget: 'Budget',
      cuisine: 'Cuisine',
      dietary: 'Dietary',
      features: 'Features',
    }
    return titles[section]
  }

  const getSectionCount = (section: FilterSection): number => {
    switch (section) {
      case 'meal':
        return tempFilters.mealTypes?.length || 0
      case 'budget':
        return tempFilters.budget?.length || 0
      case 'cuisine':
        return tempFilters.cuisineTypes?.length || 0
      case 'dietary':
        return tempFilters.dietary?.length || 0
      case 'features':
        return tempFilters.features?.length || 0
      default:
        return 0
    }
  }

  const getAvailableSections = (): FilterSection[] => {
    const baseSections: FilterSection[] = ['meal', 'budget', 'dietary', 'features']
    
    // Only show cuisine if appropriate meal types are selected
    if (shouldShowCuisineStep()) {
      return ['meal', 'budget', 'cuisine', 'dietary', 'features']
    }
    
    return baseSections
  }

  const renderSectionButton = (section: FilterSection) => {
    const isActive = activeSection === section
    const count = getSectionCount(section)
    
    return (
      <TouchableOpacity
        key={section}
        style={[
          styles.sectionButton,
          isActive && styles.activeSectionButton
        ]}
        onPress={() => setActiveSection(section)}
      >
        <View style={styles.sectionButtonContent}>
          <Icon
            name={getSectionIcon(section)}
            type="font-awesome"
            size={16}
            color={isActive ? theme.colors.textOnPrimary : theme.colors.textPrimary}
            style={styles.sectionIcon}
          />
          <Text style={[
            styles.sectionTitle,
            isActive && styles.activeSectionTitle
          ]}>
            {getSectionTitle(section)}
          </Text>
          {count > 0 && (
            <View style={[
              styles.countBadge,
              isActive && styles.activeCountBadge
            ]}>
              <Text style={[
                styles.countText,
                isActive && styles.activeCountText
              ]}>
                {count}
              </Text>
            </View>
          )}
        </View>
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
      case 'budget':
        return <BudgetStep {...commonProps} />
      case 'cuisine':
        return <CuisineStep {...commonProps} />
      case 'dietary':
        return <DietaryStep {...commonProps} />
      case 'features':
        return <FeaturesStep {...commonProps} />
      default:
        return <MealTypeStep {...commonProps} />
    }
  }

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '90%',
      minHeight: '70%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    sectionsContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    sectionButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeSectionButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    sectionButtonContent: {
      alignItems: 'center',
      position: 'relative',
    },
    sectionIcon: {
      marginBottom: theme.spacing.xs,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.caption,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    activeSectionTitle: {
      color: theme.colors.textOnPrimary,
    },
    countBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.error,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    activeCountBadge: {
      backgroundColor: theme.colors.background,
    },
    countText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.textOnPrimary,
    },
    activeCountText: {
      color: theme.colors.primary,
    },
    content: {
      flex: 1,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      gap: theme.spacing.md,
    },
    resetButton: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
    },
    resetButtonTitle: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    applyButton: {
      flex: 2,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
    },
    applyButtonTitle: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
  })

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Restaurants</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Icon
                name="x"
                type="feather"
                size={24}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sectionsContainer}
          >
            {getAvailableSections().map(renderSectionButton)}
          </ScrollView>

          <View style={styles.content}>
            {renderActiveSection()}
          </View>

          <View style={styles.footer}>
            <Button
              title="Reset"
              buttonStyle={styles.resetButton}
              titleStyle={styles.resetButtonTitle}
              onPress={handleReset}
            />
            <Button
              title="Apply Filters"
              buttonStyle={styles.applyButton}
              titleStyle={styles.applyButtonTitle}
              onPress={handleApply}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

export default FilterModal