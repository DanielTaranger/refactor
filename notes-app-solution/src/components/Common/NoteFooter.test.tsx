import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NoteFooter } from "./NoteFooter";
import { NoteProvider } from "../../context/NoteContext";
import { NotesProvider } from "../../context/NotesContext";
import { colors } from "../../utils/colors";

const mockDeleteNote = vi.fn();
const mockArchiveNote = vi.fn();
const mockUnarchiveNote = vi.fn();
const mockToggleColorPicker = vi.fn();
const mockHandleColorChange = vi.fn();
const mockToggleCheckboxMode = vi.fn();
const mockContextSubmit = vi.fn();
const mockContextCancel = vi.fn();

const mockNote = {
  id: "note-1",
  title: "Test Note Title",
  content: "Test note content",
  color: colors.yellow,
  isPinned: false,
  isArchived: false,
  updatedAt: new Date("2025-08-12T10:30:00"),
  isCheckboxNote: false,
};

const mockUseNoteImplementation = vi.fn();

vi.mock("../../context/NotesContext", () => ({
  NotesProvider: ({ children }: { children: React.ReactNode }) => children,
  useNotes: () => ({
    deleteNote: mockDeleteNote,
    archiveNote: mockArchiveNote,
    unarchiveNote: mockUnarchiveNote,
    notes: [],
  }),
}));

vi.mock("../../context/NoteContext", () => ({
  NoteProvider: ({ children }: { children: React.ReactNode }) => children,
  useNote: () => mockUseNoteImplementation(),
}));

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

const getDefaultNoteContextValue = (overrides = {}) => ({
  mode: "edit" as const,
  isExpanded: true,
  setIsExpanded: vi.fn(),
  title: "Test Title",
  content: "Test Content",
  handleTitleChange: vi.fn(),
  handleContentChange: vi.fn(),
  selectedColor: colors.yellow,
  showColorPicker: false,
  toggleColorPicker: mockToggleColorPicker,
  handleColorChange: mockHandleColorChange,
  checkboxItems: [],
  handleCheckboxChange: vi.fn(),
  handleCheckboxTextChange: vi.fn(),
  addCheckboxItem: vi.fn(),
  removeCheckboxItem: vi.fn(),
  lastAddedId: null,
  handleSubmit: mockContextSubmit,
  handleCancel: mockContextCancel,
  toggleCheckboxMode: mockToggleCheckboxMode,
  startEditing: vi.fn(),
  stopEditing: vi.fn(),
  saveNote: vi.fn(),
  isCheckboxNote: false,
  note: mockNote,
  ...overrides,
});

const renderNoteFooter = (props = {}) => {
  return render(
    <NotesProvider>
      <NoteProvider mode="edit" note={mockNote}>
        <NoteFooter {...props} />
      </NoteProvider>
    </NotesProvider>
  );
};

describe("NoteFooter Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNoteImplementation.mockReturnValue(getDefaultNoteContextValue());
  });

  describe("Rendering", () => {
    it("renders common buttons in both modes", () => {
      renderNoteFooter();

      expect(screen.getByTestId("color-button")).toBeInTheDocument();
      expect(screen.getByTestId("toggle-checkbox-button")).toBeInTheDocument();
    });

    it("renders edit mode buttons when not in create mode", () => {
      renderNoteFooter();

      expect(screen.getByTestId("archive-button")).toBeInTheDocument();
      expect(screen.getByTestId("delete-button")).toBeInTheDocument();
      expect(screen.queryByTestId("add-note-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("cancel-button")).not.toBeInTheDocument();
    });

    it("renders create mode buttons when in create mode", () => {
      renderNoteFooter({ isCreateMode: true });

      expect(screen.getByTestId("add-note-button")).toBeInTheDocument();
      expect(screen.getByTestId("cancel-button")).toBeInTheDocument();
      expect(screen.queryByTestId("archive-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
    });

    it("displays updated timestamp when not in create mode", () => {
      renderNoteFooter();

      const updatedAt = screen.getByTestId("updated-at");
      expect(updatedAt).toBeInTheDocument();
      expect(updatedAt).toHaveTextContent("Updated: 10:30 -12.08.2025");
    });

    it("doesn't display timestamp in create mode", () => {
      renderNoteFooter({ isCreateMode: true });

      expect(screen.queryByTestId("updated-at")).not.toBeInTheDocument();
    });
  });

  describe("Button Interactions", () => {
    it("calls color picker toggle when color button is clicked", () => {
      renderNoteFooter();

      fireEvent.click(screen.getByTestId("color-button"));
      expect(mockToggleColorPicker).toHaveBeenCalledTimes(1);
    });

    it("calls toggle checkbox mode when checkbox button is clicked", () => {
      renderNoteFooter();

      fireEvent.click(screen.getByTestId("toggle-checkbox-button"));
      expect(mockToggleCheckboxMode).toHaveBeenCalledTimes(1);
    });

    it("calls delete note when delete button is clicked", () => {
      renderNoteFooter();

      fireEvent.click(screen.getByTestId("delete-button"));
      expect(mockDeleteNote).toHaveBeenCalledTimes(1);
      expect(mockDeleteNote).toHaveBeenCalledWith("note-1");
    });

    it("calls archive note when archive button is clicked on non-archived note", () => {
      renderNoteFooter();

      fireEvent.click(screen.getByTestId("archive-button"));
      expect(mockArchiveNote).toHaveBeenCalledTimes(1);
      expect(mockArchiveNote).toHaveBeenCalledWith("note-1");
    });

    it("calls unarchive note when archive button is clicked on archived note", () => {
      const archivedNote = { ...mockNote, isArchived: true };
      mockUseNoteImplementation.mockReturnValue(
        getDefaultNoteContextValue({ note: archivedNote })
      );

      renderNoteFooter();

      fireEvent.click(screen.getByTestId("archive-button"));
      expect(mockUnarchiveNote).toHaveBeenCalledTimes(1);
      expect(mockUnarchiveNote).toHaveBeenCalledWith("note-1");
    });

    it("displays the correct archive icon notes", () => {
      renderNoteFooter();
      expect(screen.getByTestId("archive-button").textContent).toBe("📂");
    });

    it("calls provided submit function when Add button is clicked in create mode", () => {
      renderNoteFooter({ isCreateMode: true, onSubmit: mockOnSubmit });

      fireEvent.click(screen.getByTestId("add-note-button"));
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockContextSubmit).not.toHaveBeenCalled();
    });

    it("calls provided cancel function when Cancel button is clicked in create mode", () => {
      renderNoteFooter({ isCreateMode: true, onCancel: mockOnCancel });

      fireEvent.click(screen.getByTestId("cancel-button"));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockContextCancel).not.toHaveBeenCalled();
    });

    it("falls back to context submit/cancel when props not provided", () => {
      renderNoteFooter({ isCreateMode: true });

      fireEvent.click(screen.getByTestId("add-note-button"));
      expect(mockContextSubmit).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("cancel-button"));
      expect(mockContextCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("Color Picker", () => {
    it("displays color picker when showColorPicker is true", () => {
      mockUseNoteImplementation.mockReturnValue(
        getDefaultNoteContextValue({ showColorPicker: true })
      );

      renderNoteFooter();

      const colorPicker = screen.getByTestId("color-picker");
      expect(colorPicker).toBeInTheDocument();

      const colorOptions = screen.getAllByTestId("color-option");
      expect(colorOptions.length).toBe(Object.keys(colors).length);
    });

    it("calls handleColorChange when a color is selected", () => {
      mockUseNoteImplementation.mockReturnValue(
        getDefaultNoteContextValue({ showColorPicker: true })
      );

      renderNoteFooter();

      const colorOptions = screen.getAllByTestId("color-option");
      fireEvent.click(colorOptions[0]);

      expect(mockHandleColorChange).toHaveBeenCalledTimes(1);
      const firstColor = Object.values(colors)[0];
      expect(mockHandleColorChange).toHaveBeenCalledWith(firstColor);
    });
  });
});
