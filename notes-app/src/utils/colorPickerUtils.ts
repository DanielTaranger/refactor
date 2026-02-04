import { colors } from "./colors";

export const getColorOptions = () => {
  return Object.keys(colors).map((color) => ({
    label: color.charAt(0).toUpperCase() + color.slice(1),
  }));
};

export const getColorValue = (color: string) => {
  return colors[color as keyof typeof colors];
};

// exports the hex value of a color
export const getColorHex = (color: string) => {
  return colors[color as keyof typeof colors];
};

export const getColorName = (color: string) => {
  return color.charAt(0).toUpperCase() + color.slice(1);
};

// rbg colors
export const getColorRGB = (color: string) => {
  const hex = getColorHex(color);
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};
