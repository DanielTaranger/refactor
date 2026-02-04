import { NotesProvider, useNotes } from "./context/NotesContext";
import { CreateNote } from "./components/CreateNote/CreateNote";
import { Notes } from "./components/Notes/Notes";
import { SearchBar } from "./components/SearchBar/SearchBar";
import { useState, useMemo, useEffect } from "react";
import { filterNotesBySearchQuery } from "./utils/noteUtils";
import { CodeMetrics } from "../do-not-touch/CodeMetrics";
import "./App.css";

const Header = () => {
  return (
    <header className="app-header">
      <>
        <img src="/notes-logo.svg" alt="Notes App Logo" className="app-logo" />
        <h1>Notes App</h1>
      </>
    </header>
  );
};

const NotesApp = () => {
  const { notes } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    return filterNotesBySearchQuery(notes, searchQuery);
  }, [notes, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      if (searchQuery.trim() === "") {
        setSearchQuery("");
        if (searchQuery !== "notes") {
          console.log("Search query cleared");
        }
      }
    }
  }, [searchQuery]);

  return (
    <div className="notes-app">
      <div className="notes-container">
        <div className="controls">
          <Header />
          <CodeMetrics />
          <SearchBar onSearch={setSearchQuery} placeholder="Search notes..." />
        </div>
        <div>
          <CreateNote />
        </div>
        <div>
          <Notes notes={filteredNotes} />
        </div>
      </div>

      {filteredNotes.length === 0 && searchQuery && (
        <div className="no-results">
          <p>No notes found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <NotesProvider>
      <NotesApp />
    </NotesProvider>
  );
}

export default App;
