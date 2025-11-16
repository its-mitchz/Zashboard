<script>
  export let views = [];
  export let currentViewId;
</script>

<div class="shell">
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-circle">Y</div>
      <div class="title-block">
        <div class="title">YAML Dashboard</div>
        <div class="subtitle">Svelte + HA Websocket</div>
      </div>
    </div>

    <nav class="nav">
      {#each views as v}
        <button
          type="button"
          class:selected={v.id === currentViewId}
          on:click={() => (currentViewId = v.id)}
        >
          <span class="icon">
            {#if v.icon}
              {v.icon}
            {:else}
              🧩
            {/if}
          </span>
          <span class="label">{v.title}</span>
        </button>
      {/each}
    </nav>
  </aside>

  <main class="main">
    <slot />
  </main>
</div>
