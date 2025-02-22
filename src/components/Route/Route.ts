import type { Component, Snippet } from "svelte";

type AsyncSvelteComponent = () => Promise<{
  default: Component;
}>;

export type RouteProps = {
  path?: string;
  component?: Component<any, Record<string, any>>; //| AsyncSvelteComponent;
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
