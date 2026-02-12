export const LightColors = {
  primary: "#D9D1C6",        // Pastel Gray - premium feel
  secondary: "#BD8C5E",      // Deer - warm accent
  burgundy: "#720C17",       // Icons and app bar
  success: "#10B981",        // Green confirmations
  danger: "#EF4444",         // Red SOS/emergency
  info: "#BD8C5E",           // Informational accents aligned to brand
  warning: "#F59E0B",        // Caution states
  textPrimary: "#000000",    // Black primary text
  textSecondary: "#314B4C",  // Dark slate gray
  background: "#FFFFFF",     // Pure white
  surface: "#F9F9F9",        // Light gray surface
  border: "#E5E5E5",         // Light border
};

export const DarkColors = {
  primary: "#D9D1C6",        // Maintained for contrast
  secondary: "#BD8C5E",      // Maintained for warmth
  burgundy: "#720C17",       // Maintained brand color
  success: "#10B981",        // Green confirmations
  danger: "#EF4444",         // Red SOS/emergency
  info: "#BD8C5E",           // Informational accents aligned to brand
  warning: "#F59E0B",        // Caution states
  textPrimary: "#D9D1C6",    // Pastel gray text
  textSecondary: "#999999",  // Mid-gray secondary
  background: "#1A1A1A",     // Deep near-black
  surface: "#2C2C2C",        // Lighter dark gray
  border: "#4A4A4A",         // Darker gray borders
};

export const useThemeColors = (isDark: boolean) => {
  return isDark ? DarkColors : LightColors;
};
