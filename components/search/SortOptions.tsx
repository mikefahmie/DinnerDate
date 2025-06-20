// components/search/SortOptions.tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'

export type SortOption = 'distance' | 'rating' | 'price' | 'openNow'

interface SortOptionsProps {
  selectedSort: SortOption
  onSortChange: (sort: SortOption) => void
  style?: any
}

interface SortOptionConfig {
  id: SortOption
  label: string
  icon: string
  description: string
}

const SORT_OPTIONS: SortOptionConfig[] = [
  {
    id: 'distance',
    label: 'Distance',
    icon: 'map-marker',
    description: 'Closest to you first',
  },
  {
    id: 'rating',
    label: 'Rating',
    icon: 'star',
    description: 'Highest rated first',
  },
  {
    id: 'price',
    label: 'Price',
    icon: 'dollar',
    description: 'Lowest price first',
  },
  {
    id: 'openNow',
    label: 'Open Now',
    icon: 'clock-o',
    description: 'Currently open restaurants',
  },
]

const SortOptions: React.FC<SortOptionsProps> = ({
  selectedSort,
  onSortChange,
  style,
}) => {
  const { theme } = useTheme()
  const [modalVisible, setModalVisible] = useState(false)

  const selectedOption = SORT_OPTIONS.find(option => option.id === selectedSort)

  const handleSortSelect = (sortOption: SortOption) => {
    onSortChange(sortOption)
    setModalVisible(false)
  }

  const renderSortOption = (option: SortOptionConfig) => {
    const isSelected = selectedSort === option.id
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.modalOption,
          isSelected && styles.selectedModalOption,
        ]}
        onPress={() => handleSortSelect(option.id)}
        activeOpacity={0.7}
      >
        <View style={styles.modalOptionContent}>
          <View style={[
            styles.modalOptionIcon,
            isSelected && styles.selectedModalOptionIcon,
          ]}>
            <Icon
              name={option.icon}
              type="font-awesome"
              size={18}
              color={isSelected ? theme.colors.textOnPrimary : theme.colors.textPrimary}
            />
          </View>
          
          <View style={styles.modalOptionText}>
            <Text style={[
              styles.modalOptionLabel,
              isSelected && styles.selectedModalOptionLabel,
            ]}>
              {option.label}
            </Text>
            <Text style={[
              styles.modalOptionDescription,
              isSelected && styles.selectedModalOptionDescription,
            ]}>
              {option.description}
            </Text>
          </View>
        </View>
        
        {isSelected && (
          <Icon
            name="check"
            type="font-awesome"
            size={16}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>
    )
  }

  const styles = StyleSheet.create({
    container: {
      ...style,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    sortButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    sortIcon: {
      marginRight: theme.spacing.sm,
    },
    sortLabel: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.xs,
    },
    sortValue: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      flex: 1,
    },
    dropdownIcon: {
      marginLeft: theme.spacing.sm,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '60%',
    },
    modalHeader: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    modalBody: {
      padding: theme.spacing.md,
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xs,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    selectedModalOption: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
    },
    modalOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    modalOptionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedModalOptionIcon: {
      backgroundColor: theme.colors.primary,
    },
    modalOptionText: {
      flex: 1,
    },
    modalOptionLabel: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedModalOptionLabel: {
      color: theme.colors.primary,
    },
    modalOptionDescription: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
    },
    selectedModalOptionDescription: {
      color: theme.colors.textSecondary,
    },
  })

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.sortButtonContent}>
          <Icon
            name="sort-amount-desc"
            type="font-awesome"
            size={14}
            color={theme.colors.textSecondary}
            style={styles.sortIcon}
          />
          <Text style={styles.sortLabel}>Sort by:</Text>
          <Text style={styles.sortValue}>
            {selectedOption?.label || 'Distance'}
          </Text>
        </View>
        
        <Icon
          name="chevron-down"
          type="font-awesome"
          size={12}
          color={theme.colors.textMuted}
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Options</Text>
            </View>
            
            <View style={styles.modalBody}>
              {SORT_OPTIONS.map(renderSortOption)}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default SortOptions