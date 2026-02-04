import { useRef, useEffect, useState } from "react";
import type { NoteType } from "../../types";
import "./Note.css";
import { NoteCheckboxes } from "./NoteCheckboxes";
import { useNotes } from "../../context/NotesContext";
import { NoteProvider, useNote } from "../../context/NoteContext";
import { createHashHistory, createBrowserHistory } from "history";
import { colors } from "../../utils/colors";

export const history = createHashHistory();
export const browserHistory = createBrowserHistory();

interface NoteProps {
  note: NoteType;
}

// Todoo, clean up this component, its too big.
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
    toggleCheckboxMode,
    handleColorChange,
    toggleColorPicker,
    showColorPicker,
  } = useNote();

  const { pinNote, unpinNote, deleteNote, archiveNote, unarchiveNote } =
    useNotes();

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

      {/* Todoo possible code duplication */}
      <div className="note-footer" data-testid="note-footer">
        <div className="note-actions">
          <button
            title="Color picker"
            onClick={toggleColorPicker}
            data-testid="color-button"
          >
            🎨
          </button>
          <button
            title="Toggle checkbox mode"
            onClick={() => toggleCheckboxMode()}
            data-testid="toggle-checkbox-button"
          >
            📝
          </button>
          {note && (
            <button
              title={note?.isArchived ? "Unarchive note" : "Archive note"}
              onClick={() =>
                note.id &&
                (note.isArchived
                  ? unarchiveNote(note.id)
                  : archiveNote(note.id))
              }
              data-testid="archive-button"
            >
              📂
            </button>
          )}
          {note && (
            <button
              title="Delete note"
              data-testid="delete-button"
              onClick={() => note.id && deleteNote(note.id)}
            >
              🗑️
            </button>
          )}
        </div>

        {note?.updatedAt && (
          <div className="updated-at" data-testid="updated-at">
            Updated:{" "}
            {new Date(note.updatedAt).toLocaleTimeString("no-NO", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}{" "}
            -
            {new Date(note.updatedAt).toLocaleDateString("no-NO", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </div>
        )}
        {note?.updatedAt === undefined && (
          <div className="no-update-at">
            No updates:{" "}
            {new Date(note.updatedAt).toLocaleTimeString("no-NO", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}{" "}
            -
            {new Date(note.updatedAt).toLocaleDateString("no-NO", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </div>
        )}

        {showColorPicker && (
          <div className="color-picker" data-testid="color-picker">
            {Object.entries(colors).map(([name, color]) => (
              <div
                key={name}
                className="color-option"
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
                data-testid="color-option"
              />
            ))}
          </div>
        )}
      </div>
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

export default Note;
