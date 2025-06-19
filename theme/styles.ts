    // theme/styles.ts - Fixed common style patterns with proper types
    import { StyleSheet } from 'react-native'
    import { theme } from './index'

    export const commonStyles = StyleSheet.create({
    // Layout
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    
    content: {
        flex: 1,
        padding: theme.spacing.screenPadding,
    },
    
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    
    // Cards
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.cardPadding,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.medium,
    },
    
    cardElevated: {
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.cardPadding,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.large,
    },
    
    // Headers
    header: {
        height: theme.spacing.headerHeight,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.header,
    },
    
    headerTitle: {
        fontSize: theme.typography.fontSize.h1,
        fontWeight: '700', // Fixed: Using string literal instead of theme value
        color: theme.colors.textOnPrimary,
    },
    
    // Typography
    h1: {
        fontSize: theme.typography.fontSize.h1,
        fontWeight: '700', // Fixed: Using string literal
        color: theme.colors.textPrimary,
        lineHeight: theme.typography.fontSize.h1 * theme.typography.lineHeight.tight,
    },
    
    h2: {
        fontSize: theme.typography.fontSize.h2,
        fontWeight: '600', // Fixed: Using string literal
        color: theme.colors.textPrimary,
        lineHeight: theme.typography.fontSize.h2 * theme.typography.lineHeight.tight,
    },
    
    h3: {
        fontSize: theme.typography.fontSize.h3,
        fontWeight: '600', // Fixed: Using string literal
        color: theme.colors.textPrimary,
        lineHeight: theme.typography.fontSize.h3 * theme.typography.lineHeight.normal,
    },
    
    bodyText: {
        fontSize: theme.typography.fontSize.body,
        fontWeight: '400', // Fixed: Using string literal
        color: theme.colors.textPrimary,
        lineHeight: theme.typography.fontSize.body * theme.typography.lineHeight.normal,
    },
    
    secondaryText: {
        fontSize: theme.typography.fontSize.secondary,
        fontWeight: '400', // Fixed: Using string literal
        color: theme.colors.textSecondary,
        lineHeight: theme.typography.fontSize.secondary * theme.typography.lineHeight.normal,
    },
    
    captionText: {
        fontSize: theme.typography.fontSize.caption,
        fontWeight: '400', // Fixed: Using string literal
        color: theme.colors.textMuted,
        lineHeight: theme.typography.fontSize.caption * theme.typography.lineHeight.normal,
    },
    
    // Buttons
    buttonPrimary: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        height: theme.spacing.buttonHeight,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        ...theme.shadows.small,
    },
    
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.primary,
        borderWidth: 2,
        borderRadius: theme.borderRadius.md,
        height: theme.spacing.buttonHeight,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    
    buttonSuccess: {
        backgroundColor: theme.colors.success,
        borderRadius: theme.borderRadius.md,
        height: theme.spacing.buttonHeight,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        ...theme.shadows.small,
    },
    
    buttonError: {
        backgroundColor: theme.colors.error,
        borderRadius: theme.borderRadius.md,
        height: theme.spacing.buttonHeight,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        ...theme.shadows.small,
    },
    
    buttonWarning: {
        backgroundColor: theme.colors.warning,
        borderRadius: theme.borderRadius.md,
        height: theme.spacing.buttonHeight,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        ...theme.shadows.small,
    },
    
    buttonText: {
        fontSize: theme.typography.fontSize.body,
        fontWeight: '600', // Fixed: Using string literal
        color: theme.colors.textOnPrimary,
    },
    
    buttonTextSecondary: {
        fontSize: theme.typography.fontSize.body,
        fontWeight: '600', // Fixed: Using string literal
        color: theme.colors.primary,
    },
    
    // Inputs
    input: {
        height: theme.spacing.inputHeight,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        fontSize: theme.typography.fontSize.body,
        color: theme.colors.textPrimary,
        backgroundColor: theme.colors.surface,
    },
    
    inputFocused: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    
    inputError: {
        borderColor: theme.colors.error,
        borderWidth: 2,
    },
    
    // Dividers
    divider: {
        height: 1,
        backgroundColor: theme.colors.divider,
        marginVertical: theme.spacing.lg,
    },
    
    dividerThick: {
        height: 2,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.xl,
    },
    
    // Utility
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    rowSpaceBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    
    column: {
        flexDirection: 'column',
    },
    
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Spacing utilities
    marginVerticalSm: { marginVertical: theme.spacing.sm },
    marginVerticalMd: { marginVertical: theme.spacing.md },
    marginVerticalLg: { marginVertical: theme.spacing.lg },
    marginVerticalXl: { marginVertical: theme.spacing.xl },
    
    marginHorizontalSm: { marginHorizontal: theme.spacing.sm },
    marginHorizontalMd: { marginHorizontal: theme.spacing.md },
    marginHorizontalLg: { marginHorizontal: theme.spacing.lg },
    marginHorizontalXl: { marginHorizontal: theme.spacing.xl },
    
    paddingVerticalSm: { paddingVertical: theme.spacing.sm },
    paddingVerticalMd: { paddingVertical: theme.spacing.md },
    paddingVerticalLg: { paddingVertical: theme.spacing.lg },
    paddingVerticalXl: { paddingVertical: theme.spacing.xl },
    
    paddingHorizontalSm: { paddingHorizontal: theme.spacing.sm },
    paddingHorizontalMd: { paddingHorizontal: theme.spacing.md },
    paddingHorizontalLg: { paddingHorizontal: theme.spacing.lg },
    paddingHorizontalXl: { paddingHorizontal: theme.spacing.xl },
    })