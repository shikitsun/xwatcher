// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./error-boundary";

function ErrTrigger({ run }: { run: boolean }) {
  if (run) throw new Error("error");
  return <p>recovered</p>;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("renders a readable fallback instead of a blank window", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrTrigger run />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("error");
  });

  it("renders children again after the retry button", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    const { rerender } = render(
      <ErrorBoundary>
        <ErrTrigger run />
      </ErrorBoundary>,
    );

    rerender(
      <ErrorBoundary>
        <ErrTrigger run={false} />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("recovered")).toBeInTheDocument();
  });
});
