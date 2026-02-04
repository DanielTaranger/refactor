import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useColorPicker } from "./useColorPicker";

describe("useColorPicker Hook", () => {
  describe("Initialization", () => {
    it("should initialize with the provided initial color", () => {
      const initialColor = "#ff0000";
      const { result } = renderHook(() => useColorPicker(initialColor));

      expect(result.current.selectedColor).toBe(initialColor);
      expect(result.current.showColorPicker).toBe(false);
    });
  });

  describe("Color Picker Visibility", () => {
    it("should toggle color picker visibility when toggleColorPicker is called", () => {
      const { result } = renderHook(() => useColorPicker("#ffffff"));

      expect(result.current.showColorPicker).toBe(false);

      act(() => {
        result.current.toggleColorPicker();
      });

      expect(result.current.showColorPicker).toBe(true);

      act(() => {
        result.current.toggleColorPicker();
      });

      expect(result.current.showColorPicker).toBe(false);
    });
  });

  describe("Color Selection", () => {
    it("should update selectedColor and hide color picker when handleColorChange is called", () => {
      const initialColor = "#ffffff";
      const newColor = "#00ff00";
      const { result } = renderHook(() => useColorPicker(initialColor));

      act(() => {
        result.current.toggleColorPicker();
      });

      expect(result.current.showColorPicker).toBe(true);

      act(() => {
        result.current.handleColorChange(newColor);
      });

      expect(result.current.selectedColor).toBe(newColor);
      expect(result.current.showColorPicker).toBe(false);
    });
  });
});
