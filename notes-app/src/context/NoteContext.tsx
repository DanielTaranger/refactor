import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { NoteType, CheckboxItem } from "../types";
import { colors } from "../utils/colors";
import { useColorPicker } from "../hooks/useColorPicker";
import { useCheckboxList } from "../hooks/useCheckboxList";
import { useEditNote } from "../hooks/useEditNote";
import { useNotes } from "./NotesContext";
import { generateId } from "../utils/noteUtils";

type NoteMode = "create" | "edit";

interface NoteContextProps {
  mode: NoteMode;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  isCheckboxNote: boolean;
  title: string;
  content: string;
  handleTitleChange: (value: string) => void;
  handleContentChange: (value: string) => void;
  selectedColor: string;
  showColorPicker: boolean;
  toggleColorPicker: () => void;
  handleColorChange: (color: string) => void;
  checkboxItems: CheckboxItem[];
  handleCheckboxChange: (id: string, checked: boolean) => void;
  handleCheckboxTextChange: (id: string, text: string) => void;
  addCheckboxItem: () => void;
  removeCheckboxItem: (id: string) => void;
  lastAddedId: string | null;
  handleSubmit: () => void;
  handleCancel: () => void;
  toggleCheckboxMode: () => void;
  startEditing?: () => void;
  stopEditing?: () => void;
  saveNote?: () => void;
  note?: NoteType;
}

const NoteContext = createContext<NoteContextProps | null>(null);

export const useNote = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNote must be used within a NoteProvider");
  }
  return context;
};

interface NoteProviderProps {
  children: ReactNode;
  mode: NoteMode;
  note?: NoteType;
  onAddNote?: (note: NoteType) => void;
}

export const NoteProvider = ({
  children,
  mode,
  note,
  onAddNote,
}: NoteProviderProps) => {
  const { updateNote } = useNotes();
  const isEditMode = mode === "edit";
  const [isExpanded, setIsExpanded] = useState(isEditMode);
  const [isCheckboxNote, setIsCheckboxNote] = useState(
    isEditMode && note?.isCheckboxNote ? true : false
  );

  const {
    title,
    content,
    handleTitleChange,
    handleContentChange,
    resetContent,
    startEditing,
    stopEditing,
  } = useEditNote({
    initialTitle: note?.title ?? "",
    initialContent: note?.content ?? "",
    isEditable: false,
  });

  const {
    selectedColor,
    showColorPicker,
    handleColorChange: handleColorChangeInternal,
    toggleColorPicker: toggleColorPickerInternal,
  } = useColorPicker(
    isEditMode ? note?.color || colors.default : colors.default
  );

  const {
    checkboxItems,
    handleCheckboxChange,
    handleCheckboxTextChange,
    addCheckboxItem,
    removeCheckboxItem,
    resetCheckboxItems,
    setCheckboxItems,
    lastAddedId,
  } = useCheckboxList(note?.checkboxItems ?? []);

  useEffect(() => {
    if (isEditMode && note) {
      setCheckboxItems(note.checkboxItems || []);
    }
  }, [mode, note, setCheckboxItems]);

  const handleColorChange = (color: string) => {
    if (isEditMode && note) {
      updateNote(note.id, { color });
      toggleColorPickerInternal();
    } else {
      handleColorChangeInternal(color);
    }
  };

  const toggleColorPicker = () => {
    toggleColorPickerInternal();
  };

  const handleSubmit = () => {
    if (mode === "create" && onAddNote) {
      if (
        title.trim() === "" &&
        content.trim() === "" &&
        (!isCheckboxNote ||
          checkboxItems.every((item) => item.text.trim() === ""))
      ) {
        return;
      }

      onAddNote({
        id: Date.now().toString(),
        updatedAt: new Date(),
        title,
        content,
        color: selectedColor,
        isPinned: false,
        isArchived: false,
        isCheckboxNote,
        checkboxItems: isCheckboxNote
          ? checkboxItems.filter((item) => item.text.trim() !== "")
          : undefined,
      });

      resetContent();
      resetCheckboxItems();
      setIsExpanded(false);
      handleColorChangeInternal(colors.default);
      setIsCheckboxNote(false);
    }
  };

  const handleCancel = () => {
    if (mode === "create") {
      setIsExpanded(false);
      resetContent();
      resetCheckboxItems();
      setIsCheckboxNote(false);
      handleColorChangeInternal(colors.default);
    } else if (isEditMode) {
      stopEditing();
    }
  };

  const saveNote = () => {
    if (isEditMode && note) {
      updateNote(note.id, {
        title,
        content,
        checkboxItems,
      });
      stopEditing();
    }
  };

  const toggleCheckboxMode = () => {
    if (mode === "create") {
      const newIsCheckboxNote = !isCheckboxNote;
      setIsCheckboxNote(newIsCheckboxNote);
      if (newIsCheckboxNote) {
        resetCheckboxItems();
        addCheckboxItem();
      }
    } else if (isEditMode && note) {
      const newIsCheckboxNote = !note.isCheckboxNote;
      let update: Partial<NoteType> = {
        isCheckboxNote: newIsCheckboxNote,
      };

      if (
        newIsCheckboxNote &&
        (!note.checkboxItems || note.checkboxItems.length === 0)
      ) {
        if (note.content.trim()) {
          const lines = note.content.split("\n").filter((line) => line.trim());
          const items = lines.map((line) => ({
            id: generateId(),
            text: line,
            checked: false,
          }));
          update.checkboxItems = items;
        } else {
          update.checkboxItems = [
            { id: generateId(), text: "", checked: false },
          ];
        }
      }
      updateNote(note.id, update);
      if (newIsCheckboxNote) {
        setTimeout(startEditing, 100);
      }
    }
  };

  return (
    <NoteContext.Provider
      value={{
        mode,
        isExpanded,
        setIsExpanded,
        isCheckboxNote,
        title,
        content,
        handleTitleChange,
        handleContentChange,
        selectedColor,
        showColorPicker,
        toggleColorPicker,
        handleColorChange,
        checkboxItems,
        handleCheckboxChange,
        handleCheckboxTextChange,
        addCheckboxItem,
        removeCheckboxItem,
        lastAddedId,
        handleSubmit,
        handleCancel,
        toggleCheckboxMode,
        note,
        ...(isEditMode && {
          startEditing,
          stopEditing,
          saveNote,
        }),
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
