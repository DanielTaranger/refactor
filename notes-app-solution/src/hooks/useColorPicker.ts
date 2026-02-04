import { useState } from "react";

export const useColorPicker = (initialColor: string) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(initialColor);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  const toggleColorPicker = () => setShowColorPicker(!showColorPicker);

  return {
    showColorPicker,
    selectedColor,
    handleColorChange,
    toggleColorPicker,
  };
};
