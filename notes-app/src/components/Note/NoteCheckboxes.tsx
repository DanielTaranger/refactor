import { useEffect, useRef } from "react";
import type { CheckboxItem } from "../../types";

interface NoteCheckboxesProps {
  items: CheckboxItem[];
  isEditing: boolean;
  onCheckboxChange: (id: string, checked: boolean) => void;
  onCheckboxTextChange: (id: string, text: string) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: () => void;
  lastAddedId?: string | null;
}

export const NoteCheckboxes = ({
  items,
  isEditing,
  onCheckboxChange,
  onCheckboxTextChange,
  onRemoveItem,
  onAddItem,
  lastAddedId,
}: NoteCheckboxesProps) => {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (lastAddedId && inputRefs.current.has(lastAddedId)) {
      const inputToFocus = inputRefs.current.get(lastAddedId);
      if (inputToFocus) {
        inputToFocus.focus();
      }
    } else if (
      items.length === 1 &&
      items[0].text === "" &&
      inputRefs.current.has(items[0].id)
    ) {
      const inputToFocus = inputRefs.current.get(items[0].id);
      if (inputToFocus) {
        inputToFocus.focus();
      }
    }
  }, [lastAddedId]);

  useEffect(() => {
    if (isEditing) {
      inputRefs.current.forEach((input) => {
        input.readOnly = false;
      });
    } else {
      inputRefs.current.forEach((input) => {
        input.readOnly = true;
      });
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div
        className="checkbox-items-container"
        data-testid="checkbox-items-container"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="checkbox-item-view"
            data-testid={`checkbox-item-${item.id}`}
          >
            <input
              type="checkbox"
              checked={item.checked}
              data-testid={`checkbox-${item.id}`}
              onChange={(e) => onCheckboxChange(item.id, e.target.checked)}
            />
            <input
              type="text"
              value={item.text}
              onChange={(e) => onCheckboxTextChange(item.id, e.target.value)}
              placeholder="List item"
              className={`checkbox-text-input ${
                item.checked ? "checked-text" : ""
              }`}
              data-testid={`checkbox-text-${item.id}`}
              ref={(el) => {
                if (el) {
                  inputRefs.current.set(item.id, el);
                }
              }}
              onFocus={(e) => {
                e.currentTarget.dataset.focused = "true";
              }}
              onBlur={(e) => {
                delete e.currentTarget.dataset.focused;
              }}
            />
            <button
              title="remove checkbox"
              className="remove-checkbox-item"
              data-testid={`remove-checkbox-${item.id}`}
              onClick={() => onRemoveItem(item.id)}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          className="add-checkbox-item"
          data-testid="add-checkbox-item"
          onClick={onAddItem}
        >
          + Add item
        </button>
      </div>
    );
  }

  return (
    <div
      className="checkbox-items-container"
      data-testid="checkbox-items-container-readonly"
    >
      {items?.map((item) => (
        <div
          key={item.id}
          className="checkbox-item-view"
          data-testid={`readonly-checkbox-item-${item.id}`}
        >
          <input
            type="checkbox"
            checked={item.checked}
            data-testid={`readonly-checkbox-${item.id}`}
            onChange={(e) => onCheckboxChange(item.id, e.target.checked)}
          />
          <span
            className={item.checked ? "checked-text" : ""}
            data-testid={`readonly-text-${item.id}`}
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
};
