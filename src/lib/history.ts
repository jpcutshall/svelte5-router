/**
 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
 * https://github.com/reach/router/blob/master/LICENSE
 */
import { canUseDOM } from "./utils";

export type HistoryListener = (event: {
  location: ReturnType<typeof getLocation>;
  action: string;
  preserveScroll?: boolean;
}) => void;

const getLocation = (
  source: typeof window
): Location & { state: any; key: string } => {
  return {
    ...source.location,
    state: source.history.state,
    key: (source.history.state && source.history.state.key) || "initial",
  };
};

type Listener = (params: {
  location: ReturnType<typeof getLocation>;
  action: "POP" | "PUSH";
  preserveScroll?: boolean;
}) => void;

type StackItem = { pathname: string; search: string };

const createHistory = (
  source: typeof window
): {
  readonly location: ReturnType<typeof getLocation>;
  listen: (listener: Listener) => () => void;
  navigate: (
    to: string,
    options?: {
      replace?: boolean;
      state?: {
        [k in string | number]: unknown;
      };
      preserveScroll?: boolean;
      blurActiveElement?: boolean;
    }
  ) => void;
} => {
  const listeners: Listener[] = [];
  let location = getLocation(source);

  return {
    get location() {
      return location;
    },

    listen(listener: Listener) {
      listeners.push(listener);

      const popstateListener = () => {
        location = getLocation(source);
        listener({ location, action: "POP" });
      };

      source.addEventListener("popstate", popstateListener);

      return () => {
        source.removeEventListener("popstate", popstateListener);
        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);
      };
    },

    navigate(to, options) {
      let {
        state = {},
        replace = false,
        preserveScroll = false,
        blurActiveElement = false,
      } = options ?? {};
      state = { ...state, key: Date.now() + "" };
      // try...catch iOS Safari limits to 100 pushState calls
      try {
        if (replace) source.history.replaceState(state, "", to);
        else source.history.pushState(state, "", to);
      } catch (e) {
        (source.location as Location)[replace ? "replace" : "assign"](to);
      }
      location = getLocation(source);
      listeners.forEach((listener) =>
        listener({ location, action: "PUSH", preserveScroll })
      );
      if (blurActiveElement && document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
    },
  };
};
// Stores history entries in memory for testing or other platforms like Native
const createMemorySource = (
  initialPathname = "/"
): {
  readonly location: StackItem;
  // These functions seem to have no implimentation
  addEventListener: typeof window.addEventListener;
  removeEventListener: typeof window.removeEventListener;
  history: {
    readonly entries: StackItem[];
    readonly index: number;
    readonly state: any;
    pushState: (state: any, _: unknown, uri: string) => void;
    replaceState: (state: any, _: unknown, uri: string) => void;
  };
} => {
  let index = 0;
  const stack = [{ pathname: initialPathname, search: "" }];
  const states: Record<string, unknown>[] = [];

  return {
    get location() {
      return stack[index];
    },
    addEventListener() {},
    removeEventListener() {},
    history: {
      get entries() {
        return stack;
      },
      get index() {
        return index;
      },
      get state() {
        return states[index];
      },
      pushState(state: Record<string, unknown>, _: unknown, uri: string) {
        const [pathname, search = ""] = uri.split("?");
        index++;
        stack.push({ pathname, search });
        states.push(state);
      },
      replaceState(state: Record<string, unknown>, _: unknown, uri: string) {
        const [pathname, search = ""] = uri.split("?");
        stack[index] = { pathname, search };
        states[index] = state;
      },
    },
  };
};
// Global history uses window.history as the source if available,
// otherwise a memory history
const globalHistory = createHistory(
  canUseDOM() ? window : (createMemorySource() as unknown as typeof window)
);
const { navigate, listen } = globalHistory;

export { globalHistory, navigate, listen, createHistory, createMemorySource };
