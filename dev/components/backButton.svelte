<script lang="ts">
  import {useHistory} from "svelte5-router";
  const history = useHistory();

  const handleClick = () => {
    window.history.back();
    history.back();
  }

</script>
<button>back</button>
