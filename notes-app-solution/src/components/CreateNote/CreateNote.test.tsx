import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateNote } from "./CreateNote";
import { NotesProvider } from "../../context/NotesContext";

vi.mock("../../context/NotesContext", async () => {
  const actual = await vi.importActual("../../context/NotesContext");
  return {
    ...actual,
    useNotes: () => ({
      addNote: mockAddNote,
      notes: [],
    }),
  };
});

const mockAddNote = vi.fn();

const renderCreateNote = () => {
  return render(
    <NotesProvider>
      <CreateNote />
    </NotesProvider>
  );
};

describe("CreateNote Component", () => {
  beforeEach(() => {
    mockAddNote.mockClear();
  });

  describe("Rendering", () => {
    it("renders the create note component with placeholder", () => {
      renderCreateNote();

      expect(screen.getByTestId("create-note-content")).toBeInTheDocument();
    });

    it("does not show title input initially", () => {
      renderCreateNote();

      expect(screen.queryByTestId("create-note-title")).not.toBeInTheDocument();
    });

    it("expands when clicking on the note content area", () => {
      renderCreateNote();

      const noteContent = screen.getByTestId("create-note-content");
      fireEvent.click(noteContent);

      expect(screen.getByTestId("create-note-title")).toBeInTheDocument();
      expect(screen.getByTestId("note-footer")).toBeInTheDocument();
    });
  });

  describe("Note Creation", () => {
    it("allows entering title and content", () => {
      renderCreateNote();

      const noteContent = screen.getByTestId("create-note-content");
      fireEvent.click(noteContent);

      const titleInput = screen.getByTestId("create-note-title");
      fireEvent.change(titleInput, { target: { value: "New Note Title" } });

      fireEvent.change(noteContent, {
        target: { value: "This is my new note content" },
      });

      expect(titleInput).toHaveValue("New Note Title");
      expect(noteContent).toHaveValue("This is my new note content");
    });

    it("submits the note when clicking the save button", async () => {
      renderCreateNote();

      const noteContent = screen.getByTestId("create-note-content");
      fireEvent.click(noteContent);

      const titleInput = screen.getByTestId("create-note-title");
      fireEvent.change(titleInput, { target: { value: "Test Note" } });
      fireEvent.change(noteContent, { target: { value: "Test content" } });

      const addButton = screen.getByTestId("add-note-button");
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockAddNote).toHaveBeenCalledTimes(1);
        expect(mockAddNote).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Test Note",
            content: "Test content",
            isCheckboxNote: false,
          })
        );
      });
    });

    it("submits when pressing Enter in the title input", async () => {
      renderCreateNote();

      const noteContent = screen.getByTestId("create-note-content");
      fireEvent.click(noteContent);

      const titleInput = screen.getByTestId("create-note-title");
      fireEvent.change(titleInput, { target: { value: "Enter Key Test" } });
      fireEvent.change(noteContent, {
        target: { value: "Testing enter key submission" },
      });

      fireEvent.keyDown(titleInput, { key: "Enter", code: "Enter" });

      await waitFor(() => {
        expect(mockAddNote).toHaveBeenCalledTimes(1);
        expect(mockAddNote).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Enter Key Test",
            content: "Testing enter key submission",
          })
        );
      });
    });

    it("submits when pressing Enter in the content textarea", async () => {
      renderCreateNote();

      const noteContent = screen.getByTestId("create-note-content");
      fireEvent.click(noteContent);

      fireEvent.change(noteContent, { target: { value: "Submit with Enter" } });

      fireEvent.keyDown(noteContent, {
        key: "Enter",
        code: "Enter",
        shiftKey: false,
      });

      await waitFor(() => {
        expect(mockAddNote).toHaveBeenCalledTimes(1);
        expect(mockAddNote).toHaveBeenCalledWith(
          expect.objectContaining({
            content: "Submit with Enter",
          })
        );
      });
    });

    it("doesn't submit when pressing Shift+Enter in the content textarea", () => {
      renderCreateNote();

      const noteContent = screen.getByTestId("create-note-content");
      fireEvent.click(noteContent);

      fireEvent.change(noteContent, {
        target: { value: "Don't submit with Shift+Enter" },
      });

      fireEvent.keyDown(noteContent, {
        key: "Enter",
        code: "Enter",
        shiftKey: true,
      });

      expect(mockAddNote).not.toHaveBeenCalled();
    });
  });

  describe("Checkbox Note Features", () => {
    it("allows adding checkbox items", async () => {
      renderCreateNote();

      const noteContent = screen.getByTestId("create-note-content");
      fireEvent.click(noteContent);

      const checkboxToggle = screen.getByTestId("toggle-checkbox-button");
      fireEvent.click(checkboxToggle);

      const addItemButton = screen.getByTestId("add-checkbox-item");
      expect(addItemButton).toBeInTheDocument();

      const initialCheckboxCount =
        screen.getAllByPlaceholderText("List item").length;

      fireEvent.click(addItemButton);

      const checkboxInputs = screen.getAllByPlaceholderText("List item");
      expect(checkboxInputs.length).toBe(initialCheckboxCount + 1);

      fireEvent.change(checkboxInputs[checkboxInputs.length - 1], {
        target: { value: "Task 1" },
      });

      fireEvent.click(addItemButton);

      const updatedCheckboxInputs = screen.getAllByPlaceholderText("List item");
      expect(updatedCheckboxInputs.length).toBe(initialCheckboxCount + 2);

      const addButton = screen.getByTestId("add-note-button");
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockAddNote).toHaveBeenCalledWith(
          expect.objectContaining({
            isCheckboxNote: true,
            checkboxItems: [expect.objectContaining({ text: "Task 1" })],
          })
        );
      });
    });

    it("allows checking and unchecking items", () => {
      renderCreateNote();

      const noteContent = screen.getByTestId("create-note-content");
      fireEvent.click(noteContent);

      const checkboxToggle = screen.getByTestId("toggle-checkbox-button");
      fireEvent.click(checkboxToggle);

      const addItemButton = screen.getByTestId("add-checkbox-item");
      fireEvent.click(addItemButton);

      const checkboxes = screen.getAllByRole("checkbox");
      const checkbox = checkboxes[checkboxes.length - 1];

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("allows removing checkbox items", () => {
      renderCreateNote();

      const noteContent = screen.getByTestId("create-note-content");
      fireEvent.click(noteContent);

      const checkboxToggle = screen.getByTestId("toggle-checkbox-button");
      fireEvent.click(checkboxToggle);

      const initialItemCount =
        screen.getAllByPlaceholderText("List item").length;

      const addItemButton = screen.getByTestId("add-checkbox-item");
      fireEvent.click(addItemButton);
      fireEvent.click(addItemButton);

      expect(screen.getAllByPlaceholderText("List item").length).toBe(
        initialItemCount + 2
      );

      const removeButtons = screen.getAllByText("✕");
      fireEvent.click(removeButtons[0]);

      expect(screen.getAllByPlaceholderText("List item").length).toBe(
        initialItemCount + 1
      );
    });
  });

  describe("Cancellation", () => {
    it("collapses the note when cancel button is clicked", () => {
      renderCreateNote();

      const noteContent = screen.getByTestId("create-note-content");
      fireEvent.click(noteContent);

      expect(screen.getByTestId("create-note-title")).toBeInTheDocument();

      const cancelButton = screen.getByTestId("cancel-button");
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId("create-note-title")).not.toBeInTheDocument();

      expect(screen.getByTestId("create-note-content")).toHaveValue("");
    });
  });
});

describe("CreateNote Color Picker Integration Test", () => {
  it("should change the note color when selecting from color picker", () => {
    render(
      <NotesProvider>
        <CreateNote />
      </NotesProvider>
    );

    const noteTextarea = screen.getByTestId("create-note-content");
    fireEvent.click(noteTextarea);

    const footer = screen.getByTestId("note-footer");
    expect(footer).toBeInTheDocument();

    const colorButton = screen.getByTestId("color-button");
    fireEvent.click(colorButton);

    const colorPicker = screen.getByTestId("color-picker");
    expect(colorPicker).toBeInTheDocument();

    const colorOptions = screen.getAllByTestId("color-option");
    expect(colorOptions.length).toBeGreaterThan(0);

    const firstColorOption = colorOptions[0];
    const bgColor = (firstColorOption as HTMLElement).style.backgroundColor;

    fireEvent.click(firstColorOption);

    const noteCard = screen.getByTestId("create-note");
    expect(noteCard).toHaveStyle(`background-color: ${bgColor}`);
  });
});
