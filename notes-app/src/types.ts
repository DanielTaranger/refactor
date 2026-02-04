export interface CheckboxItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface NoteType {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  updatedAt: Date;
  checkboxItems?: CheckboxItem[];
  isCheckboxNote?: boolean;
}

export interface NoteList {
  notes: NoteType[];
  addNote: (note: NoteType) => void;
  removeListNote: (id: string) => void;
  updateListNote: (id: string, updatedNote: Partial<NoteType>) => void;
  setIsCheckListbox: (isCheckbox: boolean) => void;
  isCheckbox?: boolean;
}
