import { useState, useCallback, useEffect } from "react";

interface UseEditNoteProps {
  initialTitle?: string;
  initialContent?: string;
  isEditable?: boolean;
}

export const useEditNote = ({
  initialTitle = "",
  initialContent = "",
  isEditable = false,
}: UseEditNoteProps = {}) => {
  const [isEditing, setIsEditing] = useState(isEditable);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const resetContent = useCallback(() => {
    setTitle("");
    setContent("");
    setIsEditing(false);
  }, []);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  return {
    isEditing,
    title,
    content,
    handleTitleChange,
    handleContentChange,
    resetContent,
    startEditing,
    stopEditing,
  };
};

interface useNotesLayout {
  isGridView: boolean;
  toggleView: () => void;
  isListView: boolean;
}

export const useNotesLayout = (): useNotesLayout => {
  const [isGridView, setIsGridView] = useState(true);
  const [isListView, setIsListView] = useState(false);

  const toggleView = () => {
    setIsGridView((prev) => !prev);
    setIsListView((prev) => !prev);
  };

  return { isGridView, isListView, toggleView };
};
