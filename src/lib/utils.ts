/**
 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
 * https://github.com/reach/router/blob/master/LICENSE
 */

import type { RouteConfig } from "./RouterContext";

const PARAM = /^:(.+)/;
const SEGMENT_POINTS = 4;
const STATIC_POINTS = 3;
const DYNAMIC_POINTS = 2;
const SPLAT_PENALTY = 1;
const ROOT_POINTS = 1;

/**
 * Split up the URI into segments delimited by `/`
 * Strip starting/ending `/`
 */
const segmentize = (uri: string) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
/**
 * Strip `str` of potential start and end `/`
 */
const stripSlashes = (string: string) => string.replace(/(^\/+|\/+$)/g, "");
/**
 * Score a route depending on how its individual segments look
 */
const rankRoute = (route: RouteConfig, index: number) => {
  const score = route.default
    ? 0
    : segmentize(route.path).reduce((score, segment) => {
        score += SEGMENT_POINTS;

        if (segment === "") {
          score += ROOT_POINTS;
        } else if (PARAM.test(segment)) {
          score += DYNAMIC_POINTS;
        } else if (segment[0] === "*") {
          score -= SEGMENT_POINTS + SPLAT_PENALTY;
        } else {
          score += STATIC_POINTS;
        }

        return score;
      }, 0);

  return { route, score, index };
};
/**
 * Give a score to all routes and sort them on that
 * If two routes have the exact same score, we go by index instead
 */
const rankRoutes = (routes: RouteConfig[]) =>
  routes
    .map(rankRoute)
    .sort((a, b) =>
      a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
    );
/**
 * Ranks and picks the best route to match. Each segment gets the highest
 * amount of points, then the type of segment gets an additional amount of
 * points where
 *
 *  static > dynamic > splat > root
 *
 * This way we don't have to worry about the order of our routes, let the
 * computers do it.
 *
 * A route looks like this
 *
 *  { path, default, value }
 *
 * And a returned match looks like:
 *
 *  { route, params, uri }
 *
 */
const pick = (routes: RouteConfig[], uri: string) => {
  let match;
  let default_;

  const [uriPathname] = uri.split("?");
  const uriSegments = segmentize(uriPathname);
  const isRootUri = uriSegments[0] === "";
  const ranked = rankRoutes(routes);

  for (let i = 0, l = ranked.length; i < l; i++) {
    const route = ranked[i].route;
    let missed = false;

    if (route.default) {
      default_ = {
        route,
        params: {},
        uri,
      };
      continue;
    }

    const routeSegments = segmentize(route.path);
    const params: Record<string, string> = {};
    const max = Math.max(uriSegments.length, routeSegments.length);
    let index = 0;

    for (; index < max; index++) {
      const routeSegment = routeSegments[index];
      const uriSegment = uriSegments[index];

      if (routeSegment && routeSegment[0] === "*") {
        // Hit a splat, just grab the rest, and return a match
        // uri:   /files/documents/work
        // route: /files/* or /files/*splatname
        const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

        params[splatName] = uriSegments
          .slice(index)
          .map(decodeURIComponent)
          .join("/");
        break;
      }

      if (typeof uriSegment === "undefined") {
        // URI is shorter than the route, no match
        // uri:   /users
        // route: /users/:userId
        missed = true;
        break;
      }

      const dynamicMatch = PARAM.exec(routeSegment);

      if (dynamicMatch && !isRootUri) {
        const value = decodeURIComponent(uriSegment);
        params[dynamicMatch[1]] = value;
      } else if (routeSegment !== uriSegment) {
        // Current segments don't match, not dynamic, not splat, so no match
        // uri:   /users/123/settings
        // route: /users/:id/profile
        missed = true;
        break;
      }
    }

    if (!missed) {
      match = {
        route,
        params,
        uri: "/" + uriSegments.slice(0, index).join("/"),
      };
      break;
    }
  }

  return match || default_ || null;
};
/**
 * Add the query to the pathname if a query is given
 */
const addQuery = (pathname: string, query: string) =>
  pathname + (query ? `?${query}` : "");
/**
 * Resolve URIs as though every path is a directory, no files. Relative URIs
 * in the browser can feel awkward because not only can you be "in a directory",
 * you can be "at a file", too. For example:
 *
 *  browserSpecResolve('foo', '/bar/') => /bar/foo
 *  browserSpecResolve('foo', '/bar') => /foo
 *
 * But on the command line of a file system, it's not as complicated. You can't
 * `cd` from a file, only directories. This way, links have to know less about
 * their current path. To go deeper you can do this:
 *
 *  <Link to="deeper"/>
 *  // instead of
 *  <Link to=`{${props.uri}/deeper}`/>
 *
 * Just like `cd`, if you want to go deeper from the command line, you do this:
 *
 *  cd deeper
 *  # not
 *  cd $(pwd)/deeper
 *
 * By treating every path as a directory, linking to relative paths should
 * require less contextual information and (fingers crossed) be more intuitive.
 */
const resolve = (to: string, base: string) => {
  // /foo/bar, /baz/qux => /foo/bar
  if (to.startsWith("/")) return to;

  const [toPathname, toQuery] = to.split("?");
  const [basePathname] = base.split("?");
  const toSegments = segmentize(toPathname);
  const baseSegments = segmentize(basePathname);

  // ?a=b, /users?b=c => /users?a=b
  if (toSegments[0] === "") return addQuery(basePathname, toQuery);

  // profile, /users/789 => /users/789/profile

  if (!toSegments[0].startsWith(".")) {
    const pathname = baseSegments.concat(toSegments).join("/");
    return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
  }

  // ./       , /users/123 => /users/123
  // ../      , /users/123 => /users
  // ../..    , /users/123 => /
  // ../../one, /a/b/c/d   => /a/b/one
  // .././one , /a/b/c/d   => /a/b/c/one
  const allSegments = baseSegments.concat(toSegments);
  const segments: string[] = [];

  allSegments.forEach((segment) => {
    if (segment === "..") segments.pop();
    else if (segment !== ".") segments.push(segment);
  });

  return addQuery("/" + segments.join("/"), toQuery);
};
/**
 * Combines the `basepath` and the `path` into one path.
 */
const combinePaths = (basepath: string, path: string) =>
  `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
/**
 * Decides whether a given `event` should result in a navigation or not.
 * @param {object} event
 */
const shouldNavigate = (event: MouseEvent) =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

// svelte seems to kill anchor.host value in ie11, so fall back to checking href
const hostMatches = (anchor: HTMLAnchorElement) => {
  const host = location.host;
  return (
    anchor.host === host ||
    anchor.href.indexOf(`https://${host}`) === 0 ||
    anchor.href.indexOf(`http://${host}`) === 0
  );
};

const canUseDOM = () =>
  typeof window !== "undefined" && "document" in window && "location" in window;

export {
  stripSlashes,
  pick,
  resolve,
  combinePaths,
  shouldNavigate,
  hostMatches,
  canUseDOM,
};
