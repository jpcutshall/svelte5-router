/// <reference lib="dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// actions.ts imports navigate from "./history.js"
vi.mock("./history.js", () => ({
  navigate: vi.fn(),
}));

import { link, links } from "./actions";
import { navigate } from "./history.js";

function clickLeft(node: Element) {
  const ev = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    button: 0,
    // explicitly no modifiers
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
  });

  node.dispatchEvent(ev);
  return ev;
}

describe("actions.link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    // vitest.config.ts sets jsdom url to https://example.com/
    // so global `location.host` is "example.com" and hostMatches() works
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("intercepts same-origin clicks and calls navigate", () => {
    const a = document.createElement("a");
    a.href = "https://example.com/path?x=1";
    document.body.appendChild(a);

    const action = link(a);

    const ev = clickLeft(a);

    expect(ev.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledWith("/path?x=1", {
      replace: false,
      preserveScroll: false,
    });

    action.destroy();
  });

  it("respects replace and preserveScroll attributes", () => {
    const a = document.createElement("a");
    a.href = "https://example.com/r";
    a.setAttribute("replace", "");
    a.setAttribute("preserveScroll", "");
    document.body.appendChild(a);

    const action = link(a);

    const ev = clickLeft(a);

    expect(ev.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledWith("/r", {
      replace: true,
      preserveScroll: true,
    });

    action.destroy();
  });
});

describe("actions.links", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("intercepts clicks on descendant anchors", () => {
    const root = document.createElement("div");
    const a = document.createElement("a");
    a.href = "https://example.com/nested";
    root.appendChild(a);
    document.body.appendChild(root);

    const action = links(root);

    const ev = clickLeft(a);

    expect(ev.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledWith("/nested", {
      replace: false,
      preserveScroll: false,
    });

    action.destroy();
  });

  it("does not intercept anchors with noroute", () => {
    const root = document.createElement("div");
    const a = document.createElement("a");
    a.href = "https://example.com/native";
    a.setAttribute("noroute", "");
    root.appendChild(a);
    document.body.appendChild(root);

    const action = links(root);

    const ev = clickLeft(a);

    expect(ev.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();

    action.destroy();
  });
});
