import { SvelteComponent, SvelteComponentTyped } from "svelte";

type RouteProps = {
    path?: string;
    component?: typeof SvelteComponent;
    [additionalProp: string]: unknown;
};

type RouteSlots = {
    default: {
        location: RouteLocation;
        params: RouteParams;
    };
};

type RouteLocation = {
    pathname: string;
    search: string;
    hash?: string;
    state: {
        [k in string | number]: unknown;
    };
};

type RouteParams = {
    [param: string]: string;
};

export class Route extends SvelteComponentTyped<
    RouteProps,
    Record<string, any>,
    RouteSlots
> {}
