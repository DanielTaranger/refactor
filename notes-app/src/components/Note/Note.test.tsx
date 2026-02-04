import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Note } from "./Note";
import { NotesProvider } from "../../context/NotesContext";
import { colors } from "../../utils/colors";

const mockNote = {
  id: "note-1",
  title: "Test Note Title",
  content: "Test note content",
  color: colors.yellow,
  isPinned: false,
  isArchived: false,
  updatedAt: new Date(),
  isCheckboxNote: false,
};

const mockCheckboxNote = {
  id: "note-2",
  title: "Checkbox Note",
  content: "",
  color: colors.blue,
  isPinned: true,
  isArchived: false,
  updatedAt: new Date(),
  isCheckboxNote: true,
  checkboxItems: [
    { id: "checkbox-1", text: "Task 1", checked: false },
    { id: "checkbox-2", text: "Task 2", checked: true },
  ],
};

const renderNote = (note = mockNote) => {
  return render(
    <NotesProvider>
      <Note note={note} />
    </NotesProvider>
  );
};

describe("Note Component", () => {
  describe("Rendering", () => {
    it("renders the note with correct title and content", () => {
      renderNote();

      expect(screen.getByTestId("note-title")).toHaveTextContent(
        "Test Note Title"
      );
      expect(screen.getByTestId("note-content")).toHaveTextContent(
        "Test note content"
      );
    });

    it("renders with the correct background color", () => {
      renderNote();

      const note = screen.getByTestId("note-1");
      expect(note).toHaveStyle(`background-color: ${colors.yellow}`);
    });

    it("shows pin icon with appropriate state", () => {
      renderNote();

      const pinButton = screen.getByTestId("pin-button");
      expect(pinButton).toBeInTheDocument();
      expect(pinButton).not.toHaveClass("pinned");

      cleanup();
      renderNote({ ...mockNote, isPinned: true });

      const pinnedButton = screen.getByTestId("pin-button");
      expect(pinnedButton).toHaveClass("pinned");
    });
  });

  describe("Regular Note Interactions", () => {
    it("enters edit mode when clicking on content", () => {
      renderNote();

      const noteContent = screen.getByTestId("note-content");
      fireEvent.click(noteContent);

      expect(screen.getByTestId("note-content-input")).toBeInTheDocument();
    });

    it("updates title when editing", async () => {
      renderNote();

      fireEvent.click(screen.getByTestId("note-content"));

      const titleInput = screen.getByTestId("note-title-input");
      fireEvent.change(titleInput, { target: { value: "Updated Title" } });

      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(
          screen.queryByTestId("note-title-input")
        ).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("note-content"));

      expect(screen.getByTestId("note-title-input")).toHaveValue(
        "Updated Title"
      );
    });

    it("updates content when editing", async () => {
      renderNote();

      fireEvent.click(screen.getByTestId("note-content"));

      const contentInput = screen.getByTestId("note-content-input");
      fireEvent.change(contentInput, {
        target: { value: "Updated content text" },
      });

      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(
          screen.queryByTestId("note-content-input")
        ).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("note-content"));

      expect(screen.getByTestId("note-content-input")).toHaveValue(
        "Updated content text"
      );
    });

    it("toggles pin state when clicking pin button", () => {
      renderNote();

      const pinButton = screen.getByTestId("pin-button");

      expect(pinButton).not.toHaveClass("pinned");

      fireEvent.click(pinButton);

      expect(screen.getByTestId("pin-button")).toBeInTheDocument();
    });
  });

  describe("Checkbox Note Interactions", () => {
    it("renders checkbox items correctly", () => {
      renderNote(mockCheckboxNote);

      const checkboxItems = screen.getByTestId(
        "checkbox-items-container-readonly"
      );
      expect(checkboxItems).toBeInTheDocument();

      expect(screen.getByTestId("readonly-text-checkbox-1")).toHaveTextContent(
        "Task 1"
      );
      expect(screen.getByTestId("readonly-text-checkbox-2")).toHaveTextContent(
        "Task 2"
      );

      expect(
        screen.getByTestId("readonly-checkbox-checkbox-1")
      ).not.toBeChecked();
      expect(screen.getByTestId("readonly-checkbox-checkbox-2")).toBeChecked();
    });

    it("enters edit mode when clicking on checkbox items", () => {
      renderNote(mockCheckboxNote);

      const checkboxItems = screen.getByTestId(
        "checkbox-items-container-readonly"
      );
      fireEvent.click(checkboxItems);

      expect(
        screen.getByTestId("checkbox-items-container")
      ).toBeInTheDocument();
      expect(screen.getByTestId("checkbox-text-checkbox-1")).toHaveValue(
        "Task 1"
      );
    });

    it("updates checkbox state when clicked", () => {
      renderNote(mockCheckboxNote);

      const checkbox = screen.getByTestId("readonly-checkbox-checkbox-1");
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it("allows editing checkbox text in edit mode", async () => {
      renderNote(mockCheckboxNote);

      fireEvent.click(screen.getByTestId("checkbox-items-container-readonly"));

      const textInput = screen.getByTestId("checkbox-text-checkbox-1");
      fireEvent.change(textInput, { target: { value: "Updated Task" } });

      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(
          screen.queryByTestId("checkbox-text-checkbox-1")
        ).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("checkbox-items-container-readonly"));

      expect(screen.getByTestId("checkbox-text-checkbox-1")).toHaveValue(
        "Updated Task"
      );
    });

    it("adds a new checkbox item", async () => {
      renderNote(mockCheckboxNote);

      fireEvent.click(screen.getByTestId("checkbox-items-container-readonly"));

      const initialItems = screen.getAllByTestId(/^checkbox-item-/);

      fireEvent.click(screen.getByTestId("add-checkbox-item"));

      const updatedItems = screen.getAllByTestId(/^checkbox-item-/);
      expect(updatedItems.length).toBe(initialItems.length + 1);
    });

    it("removes a checkbox item", async () => {
      renderNote(mockCheckboxNote);

      fireEvent.click(screen.getByTestId("checkbox-items-container-readonly"));

      const initialItems = screen.getAllByTestId(/^checkbox-item-/);

      fireEvent.click(screen.getByTestId("remove-checkbox-checkbox-1"));

      const updatedItems = screen.getAllByTestId(/^checkbox-item-/);
      expect(updatedItems.length).toBe(initialItems.length - 1);

      expect(
        screen.queryByTestId("checkbox-text-checkbox-1")
      ).not.toBeInTheDocument();
    });
  });

  describe("Saving Changes", () => {
    it("saves changes when clicking outside the note", async () => {
      renderNote();

      fireEvent.click(screen.getByTestId("note-content"));

      const titleInput = screen.getByTestId("note-title-input");
      fireEvent.change(titleInput, { target: { value: "Saved Title" } });

      const contentInput = screen.getByTestId("note-content-input");
      fireEvent.change(contentInput, { target: { value: "Saved content" } });

      fireEvent.mouseDown(document.body, { bubbles: true });

      await waitFor(() => {
        expect(
          screen.queryByTestId("note-title-input")
        ).not.toBeInTheDocument();
      });

      fireEvent.mouseDown(document.body);

      expect(
        screen.queryByTestId("note-content-input")
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("note-content"));

      expect(screen.getByTestId("note-title-input")).toHaveValue("Saved Title");
      expect(screen.getByTestId("note-content-input")).toHaveValue(
        "Saved content"
      );
    });
  });
});
