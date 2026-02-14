import { describe, it, expect, vi } from "vitest";
import { createHistory, createMemorySource } from "./history";

describe("history.createMemorySource + createHistory", () => {
  it("navigates with PUSH and notifies listeners", () => {
    const source = createMemorySource("/");
    const history = createHistory(source as any);

    const listener = vi.fn();
    const unsubscribe = history.listen(listener);

    history.navigate("/a?x=1");

    expect(history.location.pathname).toBe("/a");
    expect(history.location.search).toBe("?x=1");
    expect(listener).toHaveBeenCalledTimes(1);

    const call = listener.mock.calls[0][0];
    expect(call.action).toBe("PUSH");
    expect(call.location.pathname).toBe("/a");

    unsubscribe();
  });

  it("navigates with replace", () => {
    const source = createMemorySource("/");
    const history = createHistory(source as any);

    history.navigate("/first");
    history.navigate("/second", { replace: true });

    // for memory source: last entry replaced at current index
    expect((source as any).history.entries.length).toBe(2);
    expect(history.location.pathname).toBe("/second");
  });

  it("passes preserveScroll through listener payload", () => {
    const source = createMemorySource("/");
    const history = createHistory(source as any);

    const listener = vi.fn();
    history.listen(listener);

    history.navigate("/scroll", { preserveScroll: true });

    const call = listener.mock.calls[0][0];
    expect(call.preserveScroll).toBe(true);
  });
});
