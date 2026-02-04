import { useState } from "react";

interface NoteHeaderProps {
  title: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const NoteHeader = ({ title, onEdit, onDelete }: NoteHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    if (title) {
      onEdit();
    }
  };
  const handleDelete = () => {
    onDelete();
    setIsEditing(false);
  };

  const handleSave = (): void => {
    setIsEditing(false);
  };

  return (
    <div className="note-header">
      <h2 className="note-title">{title}</h2>
      <div className="note-actions">
        {isEditing && <button onClick={handleSave}>Save</button>}
        <button onClick={handleEdit}>Edit</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};
