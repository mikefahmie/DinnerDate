// theme/colors.ts
export const colors = {
  // Brand Colors
  prussianBlue: '#003049',    // Primary brand color - headers, key UI elements
  fireEngineRed: '#d62828',   // Negative actions, closed status
  orangeWheel: '#f77f00',     // Warning states, time-sensitive indicators
  xanthous: '#fcbf49',        // Secondary accents, highlights
  vanilla: '#eae2b7',         // Background, neutral elements
  green: '#21EB00',           // Positive actions, open status
  
  // Semantic Colors (mapped from brand colors)
  primary: '#003049',         // prussianBlue
  success: '#21EB00',         // green
  error: '#d62828',           // fireEngineRed
  warning: '#f77f00',         // orangeWheel
  accent: '#fcbf49',          // xanthous
  background: '#eae2b7',      // vanilla
  
  // Text Colors
  textPrimary: '#003049',     // Primary text (prussianBlue)
  textSecondary: '#003049CC', // Secondary text (prussianBlue with opacity)
  textOnPrimary: '#eae2b7',   // Text on primary background (vanilla)
  textOnDark: '#eae2b7',      // Text on dark backgrounds (vanilla)
  textMuted: '#00304980',     // Muted text (prussianBlue with low opacity)
  
  // Surface Colors
  surface: '#ffffff',         // Card backgrounds
  surfaceElevated: '#f8f8f8', // Elevated card backgrounds
  border: '#00304920',        // Border color (prussianBlue with low opacity)
  divider: '#00304915',       // Divider color (prussianBlue with very low opacity)
  
  // State Colors
  disabled: '#00304950',      // Disabled elements
  placeholder: '#00304960',   // Placeholder text
  overlay: '#00304940',       // Modal overlays
}