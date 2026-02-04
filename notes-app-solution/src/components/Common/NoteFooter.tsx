import { useNote } from "../../context/NoteContext";
import { useNotes } from "../../context/NotesContext";
import { colors } from "../../utils/colors";

interface NoteFooterProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  isCreateMode?: boolean;
}

export const NoteFooter = ({
  onSubmit,
  onCancel,
  isCreateMode = false,
}: NoteFooterProps) => {
  const { deleteNote, archiveNote, unarchiveNote } = useNotes();

  const {
    showColorPicker,
    toggleColorPicker,
    handleColorChange,
    toggleCheckboxMode,
    note,
    isCheckboxNote,
    handleSubmit: contextSubmit,
    handleCancel: contextCancel,
  } = useNote();

  const handleSubmit = onSubmit || contextSubmit;
  const handleCancel = onCancel || contextCancel;

  return (
    <div
      className={isCreateMode ? "create-note-footer" : "note-footer"}
      data-testid="note-footer"
    >
      <div className="note-actions">
        <button
          title="Color picker"
          onClick={toggleColorPicker}
          data-testid="color-button"
        >
          🎨
        </button>
        <button
          title={
            isCreateMode
              ? isCheckboxNote
                ? "Switch to text note"
                : "Switch to checkbox list"
              : "Toggle checkbox mode"
          }
          onClick={() => toggleCheckboxMode()}
          data-testid="toggle-checkbox-button"
        >
          📝
        </button>

        {isCreateMode ? (
          <>
            <button onClick={handleSubmit} data-testid="add-note-button">
              Add
            </button>
            <button onClick={handleCancel} data-testid="cancel-button">
              Cancel
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {!isCreateMode && note?.updatedAt && (
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
  );
};
