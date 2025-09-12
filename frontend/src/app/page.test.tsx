import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
import { redirect } from "next/navigation";
import HomePage from "./page";

describe("HomePage", () => {
  it("redirects to /login", () => {
    HomePage();
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});

