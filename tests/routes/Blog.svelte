<script lang="ts">
  import { Link } from "svelte5-router";
</script>

<div class="container">
  <h1>Blog Page</h1>

  <div class="blogPostList">
    <Link to="/blog/1">blog post 1</Link>
    <Link to="/blog/2">blog post 2</Link>
    <Link to="/blog/3">blog post 3</Link>
    <Link to="/blog/4">blog post 4</Link>
    <Link to="/blog/5">blog post 5</Link>
  </div>
</div>

<style>
  .blogPostList {
    display: flex;
    flex-direction: column;
  }
</style>
