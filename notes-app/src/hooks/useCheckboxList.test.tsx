import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useCheckboxList } from "./useCheckboxList";

vi.mock("../utils/noteUtils", () => ({
  generateId: () => "test-id-" + Math.random().toString().substring(2, 6),
}));

describe("useCheckboxList Hook", () => {
  describe("Initialization", () => {
    it("should initialize with a default empty checkbox item when no items are provided", () => {
      const { result } = renderHook(() => useCheckboxList());

      expect(result.current.checkboxItems).toHaveLength(1);
      expect(result.current.checkboxItems[0].text).toBe("");
      expect(result.current.checkboxItems[0].checked).toBe(false);
      expect(result.current.checkboxItems[0].id).toBeDefined();
    });

    it("should initialize with provided items", () => {
      const initialItems = [
        { id: "item-1", text: "Item 1", checked: false },
        { id: "item-2", text: "Item 2", checked: true },
      ];

      const { result } = renderHook(() => useCheckboxList(initialItems));

      expect(result.current.checkboxItems).toHaveLength(2);
      expect(result.current.checkboxItems).toEqual(initialItems);
    });
  });

  describe("Checkbox Operations", () => {
    it("should update checkbox checked state when handleCheckboxChange is called", () => {
      const initialItems = [{ id: "item-1", text: "Item 1", checked: false }];

      const { result } = renderHook(() => useCheckboxList(initialItems));

      act(() => {
        result.current.handleCheckboxChange("item-1", true);
      });

      expect(result.current.checkboxItems[0].checked).toBe(true);
    });

    it("should update checkbox text when handleCheckboxTextChange is called", () => {
      const initialItems = [{ id: "item-1", text: "Item 1", checked: false }];

      const { result } = renderHook(() => useCheckboxList(initialItems));

      act(() => {
        result.current.handleCheckboxTextChange("item-1", "Updated Item 1");
      });

      expect(result.current.checkboxItems[0].text).toBe("Updated Item 1");
    });

    it("should add a new checkbox item when addCheckboxItem is called", () => {
      const { result } = renderHook(() => useCheckboxList());

      act(() => {
        result.current.addCheckboxItem();
      });

      expect(result.current.checkboxItems).toHaveLength(2);
      expect(result.current.lastAddedId).toBe(
        result.current.checkboxItems[1].id
      );
    });

    it("should remove a checkbox item when removeCheckboxItem is called", () => {
      const initialItems = [
        { id: "item-1", text: "Item 1", checked: false },
        { id: "item-2", text: "Item 2", checked: true },
      ];

      const { result } = renderHook(() => useCheckboxList(initialItems));

      act(() => {
        result.current.removeCheckboxItem("item-1");
      });

      expect(result.current.checkboxItems).toHaveLength(1);
      expect(result.current.checkboxItems[0].id).toBe("item-2");
    });

    it("should not remove the last checkbox item when only one item exists", () => {
      const initialItems = [{ id: "item-1", text: "Item 1", checked: false }];

      const { result } = renderHook(() => useCheckboxList(initialItems));

      act(() => {
        result.current.removeCheckboxItem("item-1");
      });

      expect(result.current.checkboxItems).toHaveLength(1);
    });

    it("should reset checkbox items when resetCheckboxItems is called", () => {
      const initialItems = [
        { id: "item-1", text: "Item 1", checked: false },
        { id: "item-2", text: "Item 2", checked: true },
      ];

      const { result } = renderHook(() => useCheckboxList(initialItems));

      act(() => {
        result.current.resetCheckboxItems();
      });

      expect(result.current.checkboxItems).toHaveLength(1);
      expect(result.current.checkboxItems[0].text).toBe("");
      expect(result.current.checkboxItems[0].checked).toBe(false);
      expect(result.current.lastAddedId).toBe(
        result.current.checkboxItems[0].id
      );
    });
  });
});
