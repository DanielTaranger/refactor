import type { NoteType } from "../types";

export const searchNotes = (notes: NoteType[], query: string): NoteType[] => {
  const searchTerm = query.toLowerCase().trim();
  if (searchTerm === "") {
    return notes;
  }
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      (note.checkboxItems &&
        note.checkboxItems.some((item) =>
          item.text.toLowerCase().includes(searchTerm)
        ))
  );
};

export const filterNotesBySearchQuery = (
  notes: NoteType[],
  searchQuery: string
): NoteType[] => {
  let result = notes;

  if (searchQuery) {
    result = searchNotes(result, searchQuery);
  }

  return result;
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const filterNotesByStatus = (notes: NoteType[]) => {
  const pinnedNotes = notes.filter((note) => !note.isArchived && note.isPinned);
  const unpinnedNotes = notes.filter(
    (note) => !note.isArchived && !note.isPinned
  );
  const archivedNotes = notes.filter((note) => note.isArchived);

  return {
    pinnedNotes,
    unpinnedNotes,
    archivedNotes,
  };
};
