import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Notes } from "./Notes";
import { NotesProvider } from "../../context/NotesContext";
import { colors } from "../../utils/colors";
import type { NoteType } from "../../types";

vi.mock("./Note/Note", () => ({
  Note: ({ note }: { note: NoteType }) => (
    <div data-testid={`note-${note.id}`} className="mock-note">
      {note.title}
    </div>
  ),
}));

const mockNotes: NoteType[] = [
  {
    id: "note-1",
    title: "Pinned Note",
    content: "This is a pinned note",
    color: colors.yellow,
    isPinned: true,
    isArchived: false,
    updatedAt: new Date(),
  },
  {
    id: "note-2",
    title: "Regular Note",
    content: "This is a regular note",
    color: colors.blue,
    isPinned: false,
    isArchived: false,
    updatedAt: new Date(),
  },
  {
    id: "note-3",
    title: "Archived Note",
    content: "This is an archived note",
    color: colors.green,
    isPinned: false,
    isArchived: true,
    updatedAt: new Date(),
  },
  {
    id: "note-4",
    title: "Pinned Note 2",
    content: "Another pinned note",
    color: colors.pink,
    isPinned: true,
    isArchived: false,
    updatedAt: new Date(),
  },
  {
    id: "note-5",
    title: "Archived Pinned Note",
    content: "An archived note that was pinned",
    color: colors.orange,
    isPinned: true,
    isArchived: true,
    updatedAt: new Date(),
  },
];

const renderNotes = (notes = mockNotes) => {
  return render(
    <NotesProvider>
      <Notes notes={notes} />
    </NotesProvider>
  );
};

describe("Notes Component", () => {
  describe("Rendering", () => {
    it("renders pinned notes in the pinned section", () => {
      renderNotes();

      const pinnedSection = screen.getByTestId("pinned-section");
      expect(pinnedSection).toBeInTheDocument();

      const pinnedNotesGrid = screen.getByTestId("pinned-notes-grid");
      expect(pinnedNotesGrid).toBeInTheDocument();

      expect(screen.getByTestId("pinned-section-title")).toBeInTheDocument();
      expect(screen.getByTestId("note-1")).toBeInTheDocument();
      expect(screen.getByTestId("note-4")).toBeInTheDocument();
    });

    it("renders unpinned notes in the unpinned section", () => {
      renderNotes();

      const unpinnedSection = screen.getByTestId("unpinned-section");
      expect(unpinnedSection).toBeInTheDocument();

      const unpinnedNotesGrid = screen.getByTestId("unpinned-notes-grid");
      expect(unpinnedNotesGrid).toBeInTheDocument();

      expect(screen.getByTestId("unpinned-section-title")).toBeInTheDocument();
      expect(screen.getByTestId("note-2")).toBeInTheDocument();
    });

    it("renders archived notes in the archive section", () => {
      renderNotes();

      const archiveSection = screen.getByTestId("archive-section");
      expect(archiveSection).toBeInTheDocument();

      const archivedNotesGrid = screen.getByTestId("archived-notes-grid");
      expect(archivedNotesGrid).toBeInTheDocument();

      expect(screen.getByTestId("archived-section-title")).toBeInTheDocument();
      expect(screen.getByTestId("note-3")).toBeInTheDocument();
      expect(screen.getByTestId("note-5")).toBeInTheDocument();
    });

    it("does not render pinned section when no pinned notes exist", () => {
      const notesWithoutPinned = mockNotes.map((note) => ({
        ...note,
        isPinned: false,
      }));

      renderNotes(notesWithoutPinned);

      expect(screen.queryByTestId("pinned-section")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("pinned-section-title")
      ).not.toBeInTheDocument();
    });

    it("does not render 'Others' title when no pinned notes exist", () => {
      const notesWithoutPinned = mockNotes.map((note) => ({
        ...note,
        isPinned: false,
      }));

      renderNotes(notesWithoutPinned);

      expect(
        screen.queryByTestId("unpinned-section-title")
      ).not.toBeInTheDocument();
    });

    it("does not render archive section when no archived notes exist", () => {
      const notesWithoutArchived = mockNotes.map((note) => ({
        ...note,
        isArchived: false,
      }));

      renderNotes(notesWithoutArchived);

      expect(screen.queryByTestId("archive-section")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("archived-section-title")
      ).not.toBeInTheDocument();
    });

    it("renders notes in correct sections based on their state", () => {
      renderNotes();

      const pinnedNotesGrid = screen.getByTestId("pinned-notes-grid");
      expect(pinnedNotesGrid).toContainElement(screen.getByTestId("note-1"));
      expect(pinnedNotesGrid).toContainElement(screen.getByTestId("note-4"));
      expect(pinnedNotesGrid).not.toContainElement(
        screen.getByTestId("note-2")
      );
      expect(pinnedNotesGrid).not.toContainElement(
        screen.getByTestId("note-3")
      );

      const unpinnedNotesGrid = screen.getByTestId("unpinned-notes-grid");
      expect(unpinnedNotesGrid).toContainElement(screen.getByTestId("note-2"));
      expect(unpinnedNotesGrid).not.toContainElement(
        screen.getByTestId("note-1")
      );

      const archivedNotesGrid = screen.getByTestId("archived-notes-grid");
      expect(archivedNotesGrid).toContainElement(screen.getByTestId("note-3"));
      expect(archivedNotesGrid).toContainElement(screen.getByTestId("note-5"));
      expect(archivedNotesGrid).not.toContainElement(
        screen.getByTestId("note-1")
      );
    });

    it("renders empty state when no notes exist", () => {
      renderNotes([]);
      expect(screen.queryByTestId("pinned-section")).not.toBeInTheDocument();
      expect(screen.queryByTestId("unpinned-section")).not.toBeInTheDocument();
      expect(screen.queryByTestId("archive-section")).not.toBeInTheDocument();
    });
  });
});
