import { useState, useCallback } from "react";
import type { CheckboxItem } from "../types";
import { generateId } from "../utils/noteUtils";

export const useCheckboxList = (initialItems: CheckboxItem[] = []) => {
  const [checkboxItems, setCheckboxItems] = useState<CheckboxItem[]>(
    initialItems.length > 0
      ? initialItems
      : [{ id: generateId(), text: "", checked: false }]
  );
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const handleCheckboxChange = useCallback((id: string, checked: boolean) => {
    setCheckboxItems((items) =>
      items.map((item) => (item.id === id ? { ...item, checked } : item))
    );
  }, []);

  const handleCheckboxTextChange = useCallback((id: string, text: string) => {
    setCheckboxItems((items) =>
      items.map((item) => (item.id === id ? { ...item, text } : item))
    );
  }, []);

  const addCheckboxItem = useCallback(() => {
    const newItem = {
      id: generateId(),
      text: "",
      checked: false,
    };
    setCheckboxItems((items) => [...items, newItem]);
    setLastAddedId(newItem.id);
    return newItem.id;
  }, []);

  const removeCheckboxItem = useCallback((id: string) => {
    setCheckboxItems((items) => {
      if (items.length <= 1) return items;
      return items.filter((item) => item.id !== id);
    });
    setLastAddedId(null);
  }, []);

  const resetCheckboxItems = useCallback(() => {
    const newId = generateId();
    setCheckboxItems([{ id: newId, text: "", checked: false }]);
    setLastAddedId(newId);
  }, []);

  return {
    checkboxItems,
    setCheckboxItems,
    handleCheckboxChange,
    handleCheckboxTextChange,
    addCheckboxItem,
    removeCheckboxItem,
    resetCheckboxItems,
    lastAddedId,
  };
};
