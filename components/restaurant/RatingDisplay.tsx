// components/restaurant/RatingDisplay.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'

interface RatingDisplayProps {
  rating: number
  reviewCount?: number
  showReviewCount?: boolean
  size?: 'small' | 'medium' | 'large'
  color?: string
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  showReviewCount = true,
  size = 'medium',
  color,
}) => {
  const { theme } = useTheme()

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          starSize: 12,
          ratingFontSize: theme.typography.fontSize.caption,
          reviewFontSize: theme.typography.fontSize.caption,
          spacing: theme.spacing.xs,
        }
      case 'large':
        return {
          starSize: 20,
          ratingFontSize: theme.typography.fontSize.h2,
          reviewFontSize: theme.typography.fontSize.secondary,
          spacing: theme.spacing.sm,
        }
      default: // medium
        return {
          starSize: 16,
          ratingFontSize: theme.typography.fontSize.secondary,
          reviewFontSize: theme.typography.fontSize.caption,
          spacing: theme.spacing.sm,
        }
    }
  }

  const sizeConfig = getSizeConfig()
  const starColor = color || '#FFB800' // Gold color for stars

  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon
          key={`full-${i}`}
          name="star"
          type="font-awesome"
          size={sizeConfig.starSize}
          color={starColor}
          style={{ marginRight: 2 }}
        />
      )
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <Icon
          key="half"
          name="star-half-o"
          type="font-awesome"
          size={sizeConfig.starSize}
          color={starColor}
          style={{ marginRight: 2 }}
        />
      )
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon
          key={`empty-${i}`}
          name="star-o"
          type="font-awesome"
          size={sizeConfig.starSize}
          color={theme.colors.textMuted}
          style={{ marginRight: 2 }}
        />
      )
    }

    return stars
  }

  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    starsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: sizeConfig.spacing,
    },
    ratingText: {
      fontSize: sizeConfig.ratingFontSize,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginRight: sizeConfig.spacing,
    },
    reviewText: {
      fontSize: sizeConfig.reviewFontSize,
      color: theme.colors.textMuted,
    },
    noRatingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    noRatingText: {
      fontSize: sizeConfig.reviewFontSize,
      color: theme.colors.textMuted,
      fontStyle: 'italic',
    },
  })

  if (!rating || rating === 0) {
    return (
      <View style={styles.noRatingContainer}>
        <Icon
          name="star-o"
          type="font-awesome"
          size={sizeConfig.starSize}
          color={theme.colors.textMuted}
          style={{ marginRight: sizeConfig.spacing }}
        />
        <Text style={styles.noRatingText}>No ratings yet</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>

      {showReviewCount && reviewCount && reviewCount > 0 && (
        <Text style={styles.reviewText}>
          ({formatReviewCount(reviewCount)})
        </Text>
      )}
    </View>
  )
}

export default RatingDisplay