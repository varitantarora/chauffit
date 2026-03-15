// Brand and status colors shared across light and dark themes
export const BrandColors = {
  primary: "#D9D1C6",      // Pastel Gray - premium feel
  secondary: "#BD8C5E",    // Deer - warm accent
  burgundy: "#720C17",     // Icons and app bar
  success: "#10B981",      // Green confirmations
  danger: "#EF4444",       // Red SOS/emergency
  warning: "#F59E0B",      // Caution states
  info: "#3B82F6",         // Blue informational
  white: "#FFFFFF",
  black: "#000000",
};

export const LightColors = {
  ...BrandColors,
  infoAccent: "#BD8C5E",   // Brand-aligned info accent (light mode)
  textPrimary: "#000000",  // Black primary text
  textSecondary: "#314B4C",// Dark slate gray
  background: "#FFFFFF",   // Pure white
  altBackground: "#F5F5F0",// Slightly warm off-white (screens with bottom sheets)
  surface: "#F9F9F9",      // Light gray surface
  card: "#FFFFFF",         // Card background
  border: "#E5E5E5",       // Light border
  divider: "#E8E0D5",      // Warm divider
  placeholder: "#9CA3AF",  // Gray-400 for placeholder/hint text
  disabled: "#9CA3AF",     // Disabled state
  overlay: "rgba(0,0,0,0.5)",
};

export const DarkColors = {
  ...BrandColors,
  infoAccent: "#BD8C5E",   // Brand-aligned info accent (dark mode)
  textPrimary: "#D9D1C6",  // Pastel gray text
  textSecondary: "#999999",// Mid-gray secondary
  background: "#1A1A1A",   // Deep near-black
  altBackground: "#1A1A1A",// Same deep background
  surface: "#2C2C2C",      // Lighter dark gray
  card: "#2C2C2C",         // Card background
  border: "#4A4A4A",       // Darker gray borders
  divider: "#4A4A4A",      // Warm divider
  placeholder: "#6B7280",  // Slightly lighter placeholder in dark
  disabled: "#6B7280",     // Disabled state
  overlay: "rgba(0,0,0,0.7)",
};

export const useThemeColors = (isDark: boolean) => {
  return isDark ? DarkColors : LightColors;
};
