<script>
  import { dynamic, Router, Link, Route } from "svelte5-router";
  import Home from "./routes/Home.svelte";
  import Blog from "./routes/Blog.svelte";
  import BlogPost from "./routes/BlogPost.svelte";

  const About = dynamic(import("./routes/About.svelte"));

  let url = $state("");
</script>

<Router {url}>
  <nav class="menu">
    <Link to="/">Home</Link>
    <Link to="/about">About</Link>
    <Link to="/blog">Blog</Link>
  </nav>
  <div>
    <Route path="/blog/:id" component={BlogPost} />
    <Route path="/blog" component={Blog} />
    <Route path="/about" component={About} />
    <Route path="/"><Home /></Route>
  </div>
</Router>

<style>
  nav {
    background-color: chocolate;
    padding: 1rem;
    a {
      background-color: black;
    }
  }
</style>
