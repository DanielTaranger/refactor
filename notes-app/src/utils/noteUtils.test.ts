import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  searchNotes,
  filterNotesBySearchQuery,
  generateId,
  filterNotesByStatus,
} from "./noteUtils";
import type { NoteType } from "../types";

describe("Note Utilities", () => {
  const mockNotes: NoteType[] = [
    {
      id: "1",
      title: "Shopping List",
      content: "",
      color: "#ffff00",
      isPinned: true,
      isArchived: false,
      updatedAt: new Date(),
      isCheckboxNote: true,
      checkboxItems: [
        { id: "c1", text: "Milk", checked: false },
        { id: "c2", text: "Bread", checked: true },
      ],
    },
    {
      id: "2",
      title: "Meeting Notes",
      content: "Discuss project timeline",
      color: "#00ff00",
      isPinned: false,
      isArchived: false,
      updatedAt: new Date(),
    },
    {
      id: "3",
      title: "Workout Plan",
      content: "Running and squats",
      color: "#ffa500",
      isPinned: false,
      isArchived: true,
      updatedAt: new Date(),
    },
  ];

  describe("searchNotes", () => {
    it("should return all notes when search query is empty", () => {
      const result = searchNotes(mockNotes, "");
      expect(result).toEqual(mockNotes);
    });

    it("should filter notes by title match", () => {
      const result = searchNotes(mockNotes, "shopping");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should filter notes by content match", () => {
      const result = searchNotes(mockNotes, "project");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should filter notes by checkbox item text match", () => {
      const result = searchNotes(mockNotes, "bread");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should handle case-insensitive searches", () => {
      const result = searchNotes(mockNotes, "MEETING");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should return empty array when no matches are found", () => {
      const result = searchNotes(mockNotes, "nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("filterNotesBySearchQuery", () => {
    it("should return all notes when search query is empty", () => {
      const result = filterNotesBySearchQuery(mockNotes, "");
      expect(result).toEqual(mockNotes);
    });

    it("should filter notes by search query", () => {
      const result = filterNotesBySearchQuery(mockNotes, "workout");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("3");
    });
  });

  describe("generateId", () => {
    const originalDateNow = Date.now;
    const mockTimestamp = 1629123456789;

    beforeEach(() => {
      Date.now = vi.fn(() => mockTimestamp);
    });

    afterEach(() => {
      Date.now = originalDateNow;
    });

    it("should generate a string ID that includes the timestamp", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.startsWith(mockTimestamp.toString())).toBe(true);
    });

    it("should generate unique IDs on consecutive calls", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("filterNotesByStatus", () => {
    it("should correctly categorize notes by status", () => {
      const result = filterNotesByStatus(mockNotes);

      expect(result.pinnedNotes).toHaveLength(1);
      expect(result.pinnedNotes[0].id).toBe("1");

      expect(result.unpinnedNotes).toHaveLength(1);
      expect(result.unpinnedNotes[0].id).toBe("2");

      expect(result.archivedNotes).toHaveLength(1);
      expect(result.archivedNotes[0].id).toBe("3");
    });

    it("should handle empty notes array", () => {
      const result = filterNotesByStatus([]);

      expect(result.pinnedNotes).toHaveLength(0);
      expect(result.unpinnedNotes).toHaveLength(0);
      expect(result.archivedNotes).toHaveLength(0);
    });
  });
});
