import type { Component, Snippet } from "svelte";

export type AsyncComponent = () => Promise<{
  default: Component<any, Record<string, unknown>>;
}>;

/**
 * Receives a dynamic import to load  a component asynchronously
 * @example
 * ```svelte
 * <script lang="ts">
 * const AboutRoute = dynamic(import("./routes/About.svelte"));
 * </script>
 *
 * <Router>
 *   <Route path="/about" component={AboutRoute} />
 * </Router>
 * ```
 * @param p an instance of Promise
 * @returns an instance of an AsyncComponent
 */
export function dynamic(p: Promise<unknown>): AsyncComponent {
  const loader = function loaderComponent() {
    return p as Promise<{ default: Component<any, Record<string, unknown>> }>;
  };
  loader.prototype.name = "dynComponent";
  return loader;
}

/**
 * From Svelte 5 on, components are functions, so this is guard function
 * that guarantees it's an dynamic component rather than a regular one.
 * @param fn component
 * @returns
 */
export function isAsync(fn: Function | undefined): fn is AsyncComponent {
  if (!fn) return false;
  return "name" in fn.prototype && fn.prototype.name === "dynComponent";
}

export type RouteProps = {
  path?: string;
  component?: Component<any, Record<string, any>>;
  children?: Snippet<[RouteParams]>;
  [additionalProp: string]: unknown;
};

export type RouteSlots = {
  default: {
    location: RouteLocation;
    params: RouteParams;
  };
};

export type RouteLocation = {
  pathname: string;
  search: string;
  hash?: string;
  state: {
    [k in string | number]: unknown;
  };
};

export type RouteParams = {
  [param: string]: string;
};
