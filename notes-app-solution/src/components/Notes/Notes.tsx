import type { NoteType } from "../../types";
import { Note } from "../Note/Note";
import { filterNotesByStatus } from "../../utils/noteUtils";
import "./Notes.css";

interface NotesProps {
  notes: NoteType[];
}

export const Notes = ({ notes }: NotesProps) => {
  const { pinnedNotes, unpinnedNotes, archivedNotes } =
    filterNotesByStatus(notes);

  return (
    <>
      {pinnedNotes.length > 0 && (
        <div className="notes-section" data-testid="pinned-section">
          <h2 className="section-title" data-testid="pinned-section-title">
            Pinned
          </h2>
          <div className="notes-grid" data-testid="pinned-notes-grid">
            {pinnedNotes.map((note) => (
              <Note key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}

      {unpinnedNotes.length > 0 && (
        <div className="notes-section" data-testid="unpinned-section">
          {pinnedNotes.length > 0 && (
            <h2 className="section-title" data-testid="unpinned-section-title">
              Others
            </h2>
          )}
          <div className="notes-grid" data-testid="unpinned-notes-grid">
            {unpinnedNotes.map((note) => (
              <Note key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}
      {archivedNotes.length > 0 && (
        <div className="archive-section" data-testid="archive-section">
          <div className="notes-section">
            <h2 className="section-title" data-testid="archived-section-title">
              Archived
            </h2>
            <div className="notes-grid" data-testid="archived-notes-grid">
              {archivedNotes.map((note) => (
                <Note key={note.id} note={note} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
