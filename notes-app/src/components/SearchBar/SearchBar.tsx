import { useState, useEffect } from "react";
import "./SearchBar.css";

export interface SearchHandler {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  isSearching: boolean;
  isEmpty: boolean;
}

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

  const isFiniteSearch = Number.isFinite(parseFloat(query));

  useEffect(() => {
    if (query) {
      let searchTerms = query.split(" ");
      searchTerms = searchTerms.filter((term) => term.trim() !== "");
      const words = searchTerms.map((term) => term.toLowerCase());

      const wordCount = words.length;
      const averageLength =
        words.reduce((sum, word) => sum + word.length, 0) / (wordCount || 1);
      const longestWord = words.reduce(
        (longest, word) => (word.length > longest.length ? word : longest),
        ""
      );

      if (wordCount > 3) {
        // log search metadata
        const searchComplexity = wordCount * averageLength - longestWord.length;
        console.timeLog("Search complexity score:", searchComplexity);
      }
    }
  }, [query, placeholder]);

  return (
    <>
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
      {isFiniteSearch && (
        <div>
          <h2
            style={{
              backgroundColor: "#f0f0f0",
              padding: "8px",
              borderRadius: "4px",
              color: "#333",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Search is finite
          </h2>
          <input type="number" className="search-input" />
          <button className="search-button">Search</button>
          <input type="text" className="search-input" />
        </div>
      )}
    </>
  );
};
