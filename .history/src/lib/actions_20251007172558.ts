import { navigate } from "./history.js";
import { hostMatches, shouldNavigate } from "./utils.js";

/**
 * A link action that can be added to <a href=""> tags rather
 * than using the <Link> component.
 *
 * Example:
 * ```html
 * <a href="/post/{postId}" use:link>{post.title}</a>
 * ```
 */
export const link = (node: HTMLElement) => {
  const onClick = (event: MouseEvent) => {
    const anchor = event.currentTarget;
    if (anchor instanceof HTMLAnchorElement) {
      if (
        (anchor.target === "" || anchor.target === "_self") &&
        hostMatches(anchor) &&
        shouldNavigate(event)
      ) {
        event.preventDefault();
        navigate(anchor.pathname + anchor.search, {
          replace: anchor.hasAttribute("replace"),
          preserveScroll: anchor.hasAttribute("preserveScroll"),
        });
      }
    }
  };

  node.addEventListener("click", onClick);

  return {
    destroy() {
      node.removeEventListener("click", onClick);
    },
  };
};
/**
 * An action to be added at a root element of your application to
 * capture all relative links and push them onto the history stack.
 *
 * Example:
 * ```html
 * <div use:links>
 *   <Router>
 *     <Route path="/" component={Home} />
 *     <Route path="/p/:projectId/:docId?" component={ProjectScreen} />
 *     {#each projects as project}
 *       <a href="/p/{project.id}">{project.title}</a>
 *     {/each}
 *   </Router>
 * </div>
 * ```
 */
export const links = (node: HTMLElement) => {
  const findClosest = (tagName: string, el: HTMLElement) => {
    while (el && el.tagName !== tagName && el.parentElement)
      el = el.parentElement;
    return el;
  };

  const onClick = (event: MouseEvent) => {
    if (event.target instanceof HTMLElement) {
      const anchor = findClosest("A", event.target);
      if (anchor instanceof HTMLAnchorElement) {
        if (
          anchor &&
          (anchor.target === "" || anchor.target === "_self") &&
          hostMatches(anchor) &&
          shouldNavigate(event) &&
          !anchor.hasAttribute("noroute")
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, {
            replace: anchor.hasAttribute("replace"),
            preserveScroll: anchor.hasAttribute("preserveScroll"),
          });
        }
      }
    }
  };

  node.addEventListener("click", onClick);

  return {
    destroy() {
      node.removeEventListener("click", onClick);
    },
  };
};
