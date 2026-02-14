import { describe, it, expect } from "vitest";
import { dynamic, isAsync } from "./Route";

describe("Route.dynamic + Route.isAsync", () => {
  it("wraps a promise as an async component loader", async () => {
    const p = Promise.resolve({ default: () => null });
    const loader = dynamic(p);

    expect(typeof loader).toBe("function");
    expect(isAsync(loader as any)).toBe(true);

    const mod = await loader();
    expect(mod).toHaveProperty("default");
  });

  it("returns false for non dynamic functions", () => {
    const regular = () => null;
    expect(isAsync(regular as any)).toBe(false);
  });
});
