// theme/typography.ts - Fixed with proper React Native fontWeight types
export const typography = {
  // Font Families
  fontFamily: {
    primary: 'System', // Will use system font stack
  },
  
  // Font Sizes
  fontSize: {
    h1: 24,          // Logo, main headers
    h2: 20,          // Restaurant names
    h3: 18,          // Section headers
    body: 16,        // Body text
    secondary: 14,   // Metadata, status
    caption: 12,     // Minimum text size
  },
  
  // Font Weights - Using React Native compatible values
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
}

// Export specific type for fontWeight
export type FontWeight = typeof typography.fontWeight[keyof typeof typography.fontWeight]