import type { Component, Snippet } from "svelte";
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
//# sourceMappingURL=Route.d.ts.map