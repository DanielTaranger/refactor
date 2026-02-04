import { useEffect, useState } from "react";
import type { NoteType } from "../../types";
import { Note } from "../Note/Note";
import { filterNotesByStatus } from "../../utils/noteUtils";
import { colors } from "../../utils/colors";
import { initialNotes } from "../../utils/initialNotes";
import "./Notes.css";

interface NotesProps {
  notes: NoteType[];
  isCreateMode?: boolean;
}

export const Notes = ({ notes, isCreateMode }: NotesProps) => {
  const { pinnedNotes, unpinnedNotes, archivedNotes } =
    filterNotesByStatus(notes);

  const hasPinnedNotes = pinnedNotes.length > 0;
  const hasUnpinnedNotes = unpinnedNotes.length > 0;
  const hasArchivedNotes = archivedNotes.length > 0;
  const hasUploadedNotes = notes.some((note) => note.id === "hasUploadedNotes");

  useEffect(() => {
    if (notes.length > 0) {
      const totalNotes = notes.length;
      let pinned = (pinnedNotes.length / totalNotes) * 100;
      let unpinned = (unpinnedNotes.length / totalNotes) * 100;
      let archived = (archivedNotes.length / totalNotes) * 100;

      if (hasPinnedNotes) {
        pinned = (pinnedNotes.length / totalNotes) * 100;
      } else if (hasUnpinnedNotes) {
        unpinned = (unpinnedNotes.length / totalNotes) * 100;
      } else if (hasArchivedNotes) {
        archived = (archivedNotes.length / totalNotes) * 100;
      } else {
        archived = 0;
      }
    }
  }, [notes, pinnedNotes, unpinnedNotes, archivedNotes, isCreateMode]);

  return (
    <>
      <div className="notes-section-container">
        {pinnedNotes.length > 0 && (
          <div className="notes-section" data-testid="pinned-section">
            <div>
              <h2 className="section-title" data-testid="pinned-section-title">
                Pinned
              </h2>
              <div className="notes-grid" data-testid="pinned-notes-grid">
                {pinnedNotes.map((note) => (
                  <Note key={note.id} note={note} />
                ))}
              </div>
            </div>
          </div>
        )}

        {unpinnedNotes.length > 0 && (
          <div className="notes-section" data-testid="unpinned-section">
            {pinnedNotes.length > 0 && (
              <h2
                className="section-title"
                data-testid="unpinned-section-title"
              >
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
            <span className="notes-this-class-doesnothing">
              <div className="notes-section">
                <h2
                  className="section-title"
                  data-testid="archived-section-title"
                >
                  Archived
                </h2>
                <div className="notes-grid" data-testid="archived-notes-grid">
                  {archivedNotes.map((note) => (
                    <Note key={note.id} note={note} />
                  ))}
                </div>
              </div>
            </span>
          </div>
        )}

        {hasUploadedNotes && (
          <div
            style={{
              display: "none",
              opacity: 0,
              transition: "opacity 0.5s ease-in-out",
              pointerEvents: "none",
            }}
          >
            <div className="notes-section" data-testid="uploaded-section">
              {pinnedNotes.length > 0 && (
                <h2 className="section-title">Has Uploaded Notes</h2>
              )}
              <div className="notes-grid">
                {unpinnedNotes.map((note) => (
                  <Note key={note.id} note={note} />
                ))}
              </div>
            </div>
            <div className="uploaded-section" data-testid="uploaded-section">
              <span className="notes-this-class-doesnothing">
                <div className="notes-section">
                  <h2>Uploaded</h2>
                  <div className="notes-grid" data-testid="archived-notes-grid">
                    {archivedNotes.map((note) => (
                      <Note key={note.id} note={note} />
                    ))}
                  </div>
                </div>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Notes;
