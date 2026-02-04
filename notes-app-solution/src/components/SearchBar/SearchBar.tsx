import { useState } from "react";
import "./SearchBar.css";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  onSearch,
  placeholder = "Search notes...",
}: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="search-bar" data-testid="search-bar">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className="search-input"
        data-testid="search-input"
      />
      {query && (
        <button
          className="clear-button"
          onClick={handleClear}
          data-testid="clear-button"
        >
          ✕
        </button>
      )}
    </div>
  );
};
