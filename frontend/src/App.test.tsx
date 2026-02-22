import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { App } from "./App";
import "./i18n";

describe("App", () => {
  it("renders the home page with title", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("ICARUS").length).toBeGreaterThan(0);
  });
});
