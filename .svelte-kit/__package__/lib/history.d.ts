export type HistoryListener = (event: {
    location: ReturnType<typeof getLocation>;
    action: string;
    preserveScroll?: boolean;
}) => void;
declare const getLocation: (source: typeof window) => Location & {
    state: any;
    key: string;
};
type Listener = (params: {
    location: ReturnType<typeof getLocation>;
    action: "POP" | "PUSH";
    preserveScroll?: boolean;
}) => void;
type StackItem = {
    pathname: string;
    search: string;
};
declare const createHistory: (source: typeof window) => {
    readonly location: ReturnType<typeof getLocation>;
    listen: (listener: Listener) => () => void;
    navigate: (to: string, options?: {
        replace?: boolean;
        state?: { [k in string | number]: unknown; };
        preserveScroll?: boolean;
        blurActiveElement?: boolean;
    }) => void;
};
declare const createMemorySource: (initialPathname?: string) => {
    readonly location: StackItem;
    addEventListener: typeof window.addEventListener;
    removeEventListener: typeof window.removeEventListener;
    history: {
        readonly entries: StackItem[];
        readonly index: number;
        readonly state: any;
        pushState: (state: any, _: unknown, uri: string) => void;
        replaceState: (state: any, _: unknown, uri: string) => void;
    };
};
declare const globalHistory: {
    readonly location: ReturnType<typeof getLocation>;
    listen: (listener: Listener) => () => void;
    navigate: (to: string, options?: {
        replace?: boolean;
        state?: { [k in string | number]: unknown; };
        preserveScroll?: boolean;
        blurActiveElement?: boolean;
    }) => void;
};
declare const navigate: (to: string, options?: {
    replace?: boolean;
    state?: { [k in string | number]: unknown; };
    preserveScroll?: boolean;
    blurActiveElement?: boolean;
}) => void, listen: (listener: Listener) => () => void;
export { globalHistory, navigate, listen, createHistory, createMemorySource };
//# sourceMappingURL=history.d.ts.map