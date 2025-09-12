import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HomePage from "./page";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("HomePage", () => {
  it("redirects to /login when no access_token exists", async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/login");
    });
  });
});

