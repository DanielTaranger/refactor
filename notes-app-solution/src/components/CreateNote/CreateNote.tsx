import "../Note/Note.css";
import { NoteFooter } from "../Common/NoteFooter";
import { useNotes } from "../../context/NotesContext";
import { NoteProvider, useNote } from "../../context/NoteContext";

export const CreateNote = () => {
  const { addNote } = useNotes();

  return (
    <NoteProvider mode="create" onAddNote={addNote}>
      <CreateNoteContent />
    </NoteProvider>
  );
};

const CreateNoteContent = () => {
  const {
    isExpanded,
    setIsExpanded,
    isCheckboxNote,
    title,
    content,
    handleTitleChange,
    handleContentChange,
    selectedColor,
    checkboxItems,
    handleCheckboxChange,
    handleCheckboxTextChange,
    addCheckboxItem,
    removeCheckboxItem,
    handleSubmit,
    handleCancel,
  } = useNote();

  return (
    <div
      className="note-card create-note"
      style={{ backgroundColor: selectedColor, marginBottom: "48px" }}
      data-testid="create-note"
    >
      {isExpanded && (
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="note-title-input"
          data-testid="create-note-title"
        />
      )}
      {!isCheckboxNote ? (
        <textarea
          placeholder="Take a note..."
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onClick={() => setIsExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="note-content-input"
          data-testid="create-note-content"
        />
      ) : (
        <div
          className="checkbox-items-container"
          onClick={() => setIsExpanded(true)}
        >
          {checkboxItems.map((item) => (
            <div key={item.id} className="checkbox-item-view">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) =>
                  handleCheckboxChange(item.id, e.target.checked)
                }
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) =>
                  handleCheckboxTextChange(item.id, e.target.value)
                }
                placeholder="List item"
                className={`checkbox-text-input ${
                  item.checked ? "checked-text" : ""
                }`}
              />
              <button
                className="remove-checkbox-item"
                onClick={() => removeCheckboxItem(item.id)}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="add-checkbox-item"
            data-testid="add-checkbox-item"
            onClick={addCheckboxItem}
          >
            + Add item
          </button>
        </div>
      )}
      {isExpanded && (
        <NoteFooter
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isCreateMode
        />
      )}
    </div>
  );
};
