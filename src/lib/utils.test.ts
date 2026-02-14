import { describe, it, expect } from "vitest";
import { pick, resolve, combinePaths, stripSlashes } from "./utils";
import type { RouteConfig } from "./RouterContext";

describe("utils.stripSlashes", () => {
  it("removes leading and trailing slashes", () => {
    expect(stripSlashes("/a/b/")).toBe("a/b");
    expect(stripSlashes("///a///")).toBe("a");
    expect(stripSlashes("/")).toBe("");
  });
});

describe("utils.combinePaths", () => {
  it("combines basepath + path and always ends with a trailing slash", () => {
    expect(combinePaths("/app", "/")).toBe("app/"); // basepath only
    expect(combinePaths("/app", "/users")).toBe("app/users/");
    expect(combinePaths("/app/", "/users/")).toBe("app/users/");
  });
});

describe("utils.resolve", () => {
  it("returns absolute paths as is", () => {
    expect(resolve("/a/b", "/anything")).toBe("/a/b");
  });

  it("resolves simple relative segments against a base path (treated as directory)", () => {
    expect(resolve("profile", "/users/123")).toBe("/users/123/profile");
  });

  it("supports dot segments", () => {
    expect(resolve("./", "/users/123")).toBe("/users/123");
    expect(resolve("../", "/users/123")).toBe("/users");
    expect(resolve("../../one", "/a/b/c/d")).toBe("/a/b/one");
  });

  it("preserves query strings on 'to'", () => {
    expect(resolve("profile?x=1", "/users/123")).toBe("/users/123/profile?x=1");
    expect(resolve("?a=b", "/users?c=d")).toBe("/users?a=b");
  });
});

describe("utils.pick", () => {
  const r = (path: string, def = false): RouteConfig => ({ path, default: def });

  it("matches static routes", () => {
    const routes = [r("/about"), r("/"), r("/blog")];
    const match = pick(routes, "/about");
    expect(match?.route.path).toBe("/about");
    expect(match?.params).toEqual({});
    expect(match?.uri).toBe("/about");
  });

  it("matches dynamic params", () => {
    const routes = [r("/blog/:id"), r("/blog")];
    const match = pick(routes, "/blog/123");
    expect(match?.route.path).toBe("/blog/:id");
    expect(match?.params).toEqual({ id: "123" });
    expect(match?.uri).toBe("/blog/123");
  });

  it("matches splat params", () => {
    const routes = [r("/files/*rest")];
    const match = pick(routes, "/files/a/b/c");
    expect(match?.params).toEqual({ rest: "a/b/c" });
    expect(match?.uri).toBe("/files/a/b/c");
  });

  it("falls back to default route when no match", () => {
    const routes = [r("/a"), r("/b"), r("", true)];
    const match = pick(routes, "/nope");
    expect(match?.route.default).toBe(true);
  });

  it("ignores query string for path matching", () => {
    const routes = [r("/blog/:id")];
    const match = pick(routes, "/blog/42?x=1");
    expect(match?.params).toEqual({ id: "42" });
  });
});
