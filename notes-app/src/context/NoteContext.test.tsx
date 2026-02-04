import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NoteProvider, useNote } from "./NoteContext";
import type { NoteType } from "../types";
import { colors } from "../utils/colors";

vi.mock("./NotesContext", () => ({
  useNotes: () => ({
    updateNote: mockUpdateNote,
  }),
  NotesProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockUpdateNote = vi.fn();
const mockOnAddNote = vi.fn();

const testNote: NoteType = {
  id: "test-1",
  title: "Test Note",
  content: "Test content",
  color: colors.yellow,
  isPinned: false,
  isArchived: false,
  updatedAt: new Date(),
  isCheckboxNote: false,
};

const testCheckboxNote: NoteType = {
  id: "test-2",
  title: "Checkbox Note",
  content: "",
  color: colors.blue,
  isPinned: false,
  isArchived: false,
  updatedAt: new Date(),
  isCheckboxNote: true,
  checkboxItems: [
    { id: "c1", text: "Task 1", checked: false },
    { id: "c2", text: "Task 2", checked: true },
  ],
};

const createWrapper = (props: any) => {
  return ({ children }: { children: React.ReactNode }) => (
    <NoteProvider {...props}>{children}</NoteProvider>
  );
};

describe("NoteContext", () => {
  beforeEach(() => {
    mockUpdateNote.mockClear();
    mockOnAddNote.mockClear();
  });

  describe("Create Mode", () => {
    it("should initialize with empty values in create mode", () => {
      const wrapper = createWrapper({
        mode: "create",
        onAddNote: mockOnAddNote,
      });
      const { result } = renderHook(() => useNote(), { wrapper });

      expect(result.current.mode).toBe("create");
      expect(result.current.title).toBe("");
      expect(result.current.content).toBe("");
      expect(result.current.isExpanded).toBe(false);
      expect(result.current.isCheckboxNote).toBe(false);
      expect(result.current.selectedColor).toBe(colors.default);
    });

    it("should call onAddNote when handleSubmit is called in create mode", () => {
      const wrapper = createWrapper({
        mode: "create",
        onAddNote: mockOnAddNote,
      });
      const { result } = renderHook(() => useNote(), { wrapper });
      act(() => {
        result.current.handleTitleChange("New Note");
        result.current.handleContentChange("New content");
      });

      act(() => {
        result.current.handleSubmit();
      });

      expect(mockOnAddNote).toHaveBeenCalledTimes(1);
      const newNote = mockOnAddNote.mock.calls[0][0];
      expect(newNote.title).toBe("New Note");
      expect(newNote.content).toBe("New content");
      expect(newNote.isCheckboxNote).toBe(false);
    });

    it("should reset form when handleCancel is called in create mode", () => {
      const wrapper = createWrapper({
        mode: "create",
        onAddNote: mockOnAddNote,
      });
      const { result } = renderHook(() => useNote(), { wrapper });

      act(() => {
        result.current.setIsExpanded(true);
        result.current.handleTitleChange("New Note");
        result.current.handleContentChange("New content");
      });

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.isExpanded).toBe(false);
      expect(result.current.title).toBe("");
      expect(result.current.content).toBe("");
    });

    it("should toggle checkbox mode", () => {
      const wrapper = createWrapper({
        mode: "create",
        onAddNote: mockOnAddNote,
      });
      const { result } = renderHook(() => useNote(), { wrapper });

      expect(result.current.isCheckboxNote).toBe(false);

      act(() => {
        result.current.toggleCheckboxMode();
      });

      expect(result.current.isCheckboxNote).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("should initialize with note values in edit mode", () => {
      const wrapper = createWrapper({ mode: "edit", note: testNote });
      const { result } = renderHook(() => useNote(), { wrapper });

      expect(result.current.mode).toBe("edit");
      expect(result.current.title).toBe(testNote.title);
      expect(result.current.content).toBe(testNote.content);
      expect(result.current.isExpanded).toBe(true);
      expect(result.current.isCheckboxNote).toBe(false);
      expect(result.current.selectedColor).toBe(testNote.color);
    });

    it("should initialize with checkbox note values in edit mode", () => {
      const wrapper = createWrapper({ mode: "edit", note: testCheckboxNote });
      const { result } = renderHook(() => useNote(), { wrapper });

      expect(result.current.isCheckboxNote).toBe(true);
      expect(result.current.checkboxItems).toEqual(
        testCheckboxNote.checkboxItems
      );
    });

    it("should call updateNote when saveNote is called in edit mode", () => {
      const wrapper = createWrapper({ mode: "edit", note: testNote });
      const { result } = renderHook(() => useNote(), { wrapper });

      act(() => {
        result.current.handleTitleChange("Updated Title");
      });

      act(() => {
        result.current.saveNote?.();
      });

      expect(mockUpdateNote).toHaveBeenCalled();
      expect(mockUpdateNote.mock.calls[0][0]).toBe(testNote.id);
      expect(mockUpdateNote.mock.calls[0][1].title).toBe("Updated Title");
    });
  });

  describe("Error Handling", () => {
    it("should throw error when useNote is used outside of NoteProvider", () => {
      const consoleSpy = vi.spyOn(console, "error");
      consoleSpy.mockImplementation(() => {});

      const renderUseNoteOutsideProvider = () => {
        renderHook(() => useNote());
      };

      expect(renderUseNoteOutsideProvider).toThrow(
        "useNote must be used within a NoteProvider"
      );

      consoleSpy.mockRestore();
    });
  });
});
