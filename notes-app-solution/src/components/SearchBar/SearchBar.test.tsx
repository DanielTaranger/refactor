import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("renders with default placeholder", () => {
    render(<SearchBar onSearch={() => {}} />);
    const input = screen.getByTestId("search-input");
    expect(input).toHaveAttribute("placeholder", "Search notes...");
  });

  it("calls onSearch when text is entered", () => {
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByTestId("search-input");

    fireEvent.change(input, { target: { value: "test" } });

    expect(onSearch).toHaveBeenCalledWith("test");
  });

  it("shows clear button only when there is text", () => {
    render(<SearchBar onSearch={() => {}} />);

    expect(screen.queryByTestId("clear-button")).not.toBeInTheDocument();

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "test" } });

    expect(screen.getByTestId("clear-button")).toBeInTheDocument();
  });

  it("clears input when clear button is clicked", () => {
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByTestId("search-input");

    fireEvent.change(input, { target: { value: "test" } });

    const clearButton = screen.getByTestId("clear-button");
    fireEvent.click(clearButton);

    expect(input).toHaveValue("");
    expect(onSearch).toHaveBeenCalledWith("");
  });
});
