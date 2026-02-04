import { useRef, useEffect, useState } from "react";
import type { NoteType } from "../../types";
import "./Note.css";
import { NoteFooter } from "../Common/NoteFooter";
import { NoteCheckboxes } from "./NoteCheckboxes";
import { useNotes } from "../../context/NotesContext";
import { NoteProvider, useNote } from "../../context/NoteContext";

interface NoteProps {
  note: NoteType;
}

const NoteContent = () => {
  const noteRef = useRef<HTMLDivElement>(null);
  const {
    title,
    content,
    handleTitleChange,
    handleContentChange,
    startEditing,
    stopEditing,
    saveNote,
    checkboxItems,
    handleCheckboxChange,
    handleCheckboxTextChange,
    addCheckboxItem,
    removeCheckboxItem,
    lastAddedId,
    note,
  } = useNote();

  const { pinNote, unpinNote } = useNotes();

  const [isEditing, setIsEditing] = useState(false);

  const handleStartEditing = () => {
    startEditing?.();
    setIsEditing(true);
  };

  const handleStopEditing = () => {
    stopEditing?.();
    setIsEditing(false);
  };
  const togglePin = () => {
    if (note) {
      note.isPinned ? unpinNote(note.id) : pinNote(note.id);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditing &&
        noteRef.current &&
        !noteRef.current.contains(event.target as Node) &&
        saveNote
      ) {
        saveNote();
        handleStopEditing();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, saveNote]);

  if (!note) return null;

  return (
    <div
      ref={noteRef}
      className="note-card"
      data-testid={note.id}
      style={{ backgroundColor: note.color }}
    >
      <div className="note-header" data-testid="note-header">
        <div className="note-header-content">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Title"
              className="note-title-input"
              data-testid="note-title-input"
            />
          ) : (
            <h3 className="note-title" data-testid="note-title">
              {note.title}
            </h3>
          )}
        </div>
        <button
          title={note.isPinned ? "Unpin note" : "Pin note"}
          className={`pin-button ${note.isPinned ? "pinned" : ""}`}
          data-testid="pin-button"
          onClick={togglePin}
        >
          📌
        </button>
      </div>

      {isEditing ? (
        <>
          {note.isCheckboxNote ? (
            <NoteCheckboxes
              isEditing={true}
              items={checkboxItems}
              onCheckboxChange={handleCheckboxChange}
              onCheckboxTextChange={handleCheckboxTextChange}
              onRemoveItem={removeCheckboxItem}
              onAddItem={addCheckboxItem}
              lastAddedId={lastAddedId}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Take a note..."
              className="note-content-input"
              data-testid="note-content-input"
            />
          )}
        </>
      ) : (
        <div
          className={note.isCheckboxNote ? "checkbox-note" : ""}
          onClick={handleStartEditing}
          data-testid="note-content"
        >
          {note.isCheckboxNote ? (
            <NoteCheckboxes
              isEditing={false}
              items={note.checkboxItems || []}
              onCheckboxChange={handleCheckboxChange}
              onCheckboxTextChange={handleCheckboxTextChange}
              onRemoveItem={removeCheckboxItem}
              onAddItem={addCheckboxItem}
              lastAddedId={lastAddedId}
            />
          ) : (
            <div className="note-content">{note.content}</div>
          )}
        </div>
      )}
      <NoteFooter />
    </div>
  );
};

export const Note = ({ note }: NoteProps) => {
  return (
    <NoteProvider mode="edit" note={note}>
      <NoteContent />
    </NoteProvider>
  );
};
