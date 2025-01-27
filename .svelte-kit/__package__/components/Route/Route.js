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
 * @param p Promuse
 * @returns an instance of an AsyncComponent
 */
export function dynamic(p) {
    const loader = function loaderComponent() {
        return p;
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
export function isAsync(fn) {
    if (!fn)
        return false;
    return "name" in fn.prototype && fn.prototype.name === "dynComponent";
}
