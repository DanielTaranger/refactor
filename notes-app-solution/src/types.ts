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
