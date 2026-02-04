import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotesProvider, useNotes } from "./NotesContext";
import { initialNotes } from "../utils/initialNotes";
import type { NoteType } from "../types";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotesProvider>{children}</NotesProvider>
);

describe("NotesContext", () => {
  describe("NotesProvider", () => {
    it("should initialize with initial notes", () => {
      const { result } = renderHook(() => useNotes(), { wrapper });

      expect(result.current.notes).toEqual(initialNotes);
    });
  });

  describe("useNotes Hook", () => {
    it("should add a new note", () => {
      const { result } = renderHook(() => useNotes(), { wrapper });
      const initialNotesCount = result.current.notes.length;

      const newNote: NoteType = {
        id: "test-note",
        title: "Test Note",
        content: "Test content",
        color: "#ffffff",
        isPinned: false,
        isArchived: false,
        updatedAt: new Date(),
      };

      act(() => {
        result.current.addNote(newNote);
      });

      expect(result.current.notes.length).toBe(initialNotesCount + 1);
      expect(result.current.notes[result.current.notes.length - 1]).toEqual(
        newNote
      );
    });

    it("should update an existing note", () => {
      const { result } = renderHook(() => useNotes(), { wrapper });
      const noteToUpdate = result.current.notes[0];
      const updates = {
        title: "Updated Title",
        content: "Updated Content",
      };

      act(() => {
        result.current.updateNote(noteToUpdate.id, updates);
      });

      const updatedNote = result.current.notes.find(
        (note) => note.id === noteToUpdate.id
      );
      expect(updatedNote?.title).toBe("Updated Title");
      expect(updatedNote?.content).toBe("Updated Content");
    });

    it("should delete a note", () => {
      const { result } = renderHook(() => useNotes(), { wrapper });
      const initialNotesCount = result.current.notes.length;
      const noteToDelete = result.current.notes[0];

      act(() => {
        result.current.deleteNote(noteToDelete.id);
      });

      expect(result.current.notes.length).toBe(initialNotesCount - 1);
      expect(
        result.current.notes.find((note) => note.id === noteToDelete.id)
      ).toBeUndefined();
    });

    it("should archive a note", () => {
      const { result } = renderHook(() => useNotes(), { wrapper });
      const noteToArchive = result.current.notes.find(
        (note) => !note.isArchived
      );

      if (noteToArchive) {
        act(() => {
          result.current.archiveNote(noteToArchive.id);
        });

        const archivedNote = result.current.notes.find(
          (note) => note.id === noteToArchive.id
        );
        expect(archivedNote?.isArchived).toBe(true);
      }
    });

    it("should unarchive a note", () => {
      const { result } = renderHook(() => useNotes(), { wrapper });
      const noteToUnarchive = result.current.notes.find(
        (note) => note.isArchived
      );

      if (noteToUnarchive) {
        act(() => {
          result.current.unarchiveNote(noteToUnarchive.id);
        });

        const unarchivedNote = result.current.notes.find(
          (note) => note.id === noteToUnarchive.id
        );
        expect(unarchivedNote?.isArchived).toBe(false);
      }
    });

    it("should pin a note", () => {
      const { result } = renderHook(() => useNotes(), { wrapper });
      const noteToPin = result.current.notes.find((note) => !note.isPinned);

      if (noteToPin) {
        act(() => {
          result.current.pinNote(noteToPin.id);
        });

        const pinnedNote = result.current.notes.find(
          (note) => note.id === noteToPin.id
        );
        expect(pinnedNote?.isPinned).toBe(true);
      }
    });

    it("should unpin a note", () => {
      const { result } = renderHook(() => useNotes(), { wrapper });
      const noteToUnpin = result.current.notes.find((note) => note.isPinned);

      if (noteToUnpin) {
        act(() => {
          result.current.unpinNote(noteToUnpin.id);
        });

        const unpinnedNote = result.current.notes.find(
          (note) => note.id === noteToUnpin.id
        );
        expect(unpinnedNote?.isPinned).toBe(false);
      }
    });
  });

  describe("Error Handling", () => {
    it("should throw error when useNotes is used outside of NotesProvider", () => {
      const consoleSpy = vi.spyOn(console, "error");
      consoleSpy.mockImplementation(() => {});

      const renderUseNotesOutsideProvider = () => {
        renderHook(() => useNotes());
      };

      expect(renderUseNotesOutsideProvider).toThrow(
        "useNotes must be used within a NotesProvider"
      );

      consoleSpy.mockRestore();
    });
  });
});
