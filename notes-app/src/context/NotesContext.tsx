import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { NoteType } from "../types";
import { initialNotes } from "../utils/initialNotes";

interface NotesContextType {
  notes: NoteType[];
  addNote: (note: NoteType) => void;
  updateNote: (id: string, updates: Partial<NoteType>) => void;
  deleteNote: (id: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  pinNote: (id: string) => void;
  unpinNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<NoteType[]>(initialNotes);

  const addNote = (note: NoteType) => {
    setNotes((prevNotes) => [...prevNotes, note]);
  };

  const updateNote = (id: string, updates: Partial<NoteType>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  const archiveNote = (id: string) => {
    updateNote(id, { isArchived: true });
  };

  const unarchiveNote = (id: string) => {
    updateNote(id, { isArchived: false });
  };

  const pinNote = (id: string) => {
    updateNote(id, { isPinned: true });
  };

  const unpinNote = (id: string) => {
    updateNote(id, { isPinned: false });
  };

  const value = {
    notes,
    addNote,
    updateNote,
    deleteNote,
    archiveNote,
    unarchiveNote,
    pinNote,
    unpinNote,
  };

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};
