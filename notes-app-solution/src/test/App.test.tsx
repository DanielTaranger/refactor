import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../App";
import { initialNotes } from "../utils/initialNotes";
import { filterNotesBySearchQuery } from "../utils/noteUtils";

vi.mock("../../do-not-touch/CodeMetrics", () => ({
  CodeMetrics: () => <div data-testid="code-metrics">Code Metrics</div>,
}));

vi.mock("../utils/noteUtils", async () => {
  const actual = await vi.importActual("../utils/noteUtils");
  return {
    ...actual,
    filterNotesBySearchQuery: vi.fn(),
  };
});

describe("App Tests", () => {
  beforeEach(() => {
    vi.mocked(filterNotesBySearchQuery).mockImplementation((notes, query) => {
      if (!query) return notes;
      return notes.filter((note) =>
        note.title.toLowerCase().includes(query.toLowerCase())
      );
    });
  });

  it("should render the app with correct sections", () => {
    render(<App />);

    expect(screen.getByText("Notes App")).toBeInTheDocument();

    expect(screen.getByTestId("search-input")).toBeInTheDocument();

    expect(screen.getByTestId("create-note")).toBeInTheDocument();

    expect(screen.getByTestId("pinned-section")).toBeInTheDocument();
    expect(screen.getByTestId("unpinned-section")).toBeInTheDocument();
    expect(screen.getByTestId("archive-section")).toBeInTheDocument();
  });

  it("should filter notes based on search query", () => {
    render(<App />);

    const searchInput = screen.getByTestId("search-input");

    expect(filterNotesBySearchQuery).toHaveBeenCalledWith(initialNotes, "");

    fireEvent.change(searchInput, { target: { value: "Shopping" } });

    expect(filterNotesBySearchQuery).toHaveBeenCalledWith(
      initialNotes,
      "Shopping"
    );
  });

  it("should show no results message when search has no matches", () => {
    vi.mocked(filterNotesBySearchQuery).mockImplementation((notes, query) => {
      if (query === "nonexistent") return [];
      return notes;
    });

    render(<App />);

    const searchInput = screen.getByTestId("search-input");

    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(
      screen.getByText('No notes found matching "nonexistent"')
    ).toBeInTheDocument();
  });

  it("should clear search when clicking the clear button", () => {
    render(<App />);

    const searchInput = screen.getByTestId("search-input");

    fireEvent.change(searchInput, { target: { value: "Shopping" } });

    const clearButton = screen.getByTestId("clear-button");
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue("");

    expect(filterNotesBySearchQuery).toHaveBeenCalledWith(initialNotes, "");
  });
});
