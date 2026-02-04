import type { SearchHandler } from "./SearchBar";
import { useState } from "react";

// this component is a mess, and needs cleanup
export const searchHandler = ({
  onSearch,
  onClear,
  isSearching,
  isEmpty,
}: SearchHandler) => {
  if (isSearching) {
    onSearch?.("");
  } else if (isEmpty) {
    onClear?.();
  }
  isEmpty !== isSearching!!;

  return {
    isSearching,
    isEmpty,
    onSearch,
    onClear,
  };
};

export default searchHandler;
