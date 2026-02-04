import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useEditNote } from "./useEditNote";

describe("useEditNote Hook", () => {
  describe("Initialization", () => {
    it("should initialize with default values when no props are provided", () => {
      const { result } = renderHook(() => useEditNote());

      expect(result.current.title).toBe("");
      expect(result.current.content).toBe("");
      expect(result.current.isEditing).toBe(false);
    });

    it("should initialize with provided values", () => {
      const initialValues = {
        initialTitle: "Test Title",
        initialContent: "Test Content",
        isEditable: true,
      };

      const { result } = renderHook(() => useEditNote(initialValues));

      expect(result.current.title).toBe("Test Title");
      expect(result.current.content).toBe("Test Content");
      expect(result.current.isEditing).toBe(true);
    });
  });

  describe("State Updates", () => {
    it("should update title when handleTitleChange is called", () => {
      const { result } = renderHook(() => useEditNote());

      act(() => {
        result.current.handleTitleChange("New Title");
      });

      expect(result.current.title).toBe("New Title");
    });

    it("should update content when handleContentChange is called", () => {
      const { result } = renderHook(() => useEditNote());

      act(() => {
        result.current.handleContentChange("New Content");
      });

      expect(result.current.content).toBe("New Content");
    });

    it("should reset content when resetContent is called", () => {
      const initialValues = {
        initialTitle: "Test Title",
        initialContent: "Test Content",
        isEditable: true,
      };

      const { result } = renderHook(() => useEditNote(initialValues));

      act(() => {
        result.current.resetContent();
      });

      expect(result.current.title).toBe("");
      expect(result.current.content).toBe("");
      expect(result.current.isEditing).toBe(false);
    });

    it("should set isEditing to true when startEditing is called", () => {
      const { result } = renderHook(() => useEditNote());

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);
    });

    it("should set isEditing to false when stopEditing is called", () => {
      const initialValues = {
        isEditable: true,
      };

      const { result } = renderHook(() => useEditNote(initialValues));

      act(() => {
        result.current.stopEditing();
      });

      expect(result.current.isEditing).toBe(false);
    });
  });

  describe("Effect Behavior", () => {
    it("should update state when initialTitle and initialContent props change", () => {
      const initialValues = {
        initialTitle: "Initial Title",
        initialContent: "Initial Content",
      };

      const { result, rerender } = renderHook((props) => useEditNote(props), {
        initialProps: initialValues,
      });

      rerender({
        initialTitle: "Updated Title",
        initialContent: "Updated Content",
      });

      expect(result.current.title).toBe("Updated Title");
      expect(result.current.content).toBe("Updated Content");
    });
  });
});
