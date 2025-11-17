<script>
  import { states } from "../ha/connection";
  import { editMode, addLightCard } from "../../stores/dashboard";

  let selectedEntity = "";
  let selectedStyle = "large-toggle";

  $: lightEntities = Object.entries($states || {})
    .filter(([id, ent]) => id.startsWith("light."))
    .map(([id, ent]) => ({
      id,
      name: ent.attributes?.friendly_name || id
    }));

  function handleAdd() {
    if (!selectedEntity) return;
    addLightCard(selectedEntity, selectedStyle);
  }
</script>

<div class="toolbar">
  <button class:active={$editMode} on:click={() => editMode.set(!$editMode)}>
    {$editMode ? "Done editing" : "Edit dashboard"}
  </button>

  {#if $editMode}
    <div class="controls">
      <select bind:value={selectedEntity}>
        <option value="">Select a light…</option>
        {#each lightEntities as light}
          <option value={light.id}>{light.name}</option>
        {/each}
      </select>

      <select bind:value={selectedStyle}>
        <option value="large-toggle">Large toggle</option>
        <option value="compact">Compact</option>
        <option value="info">Info only</option>
      </select>

      <button on:click={handleAdd} disabled={!selectedEntity}>
        + Add light card
      </button>
    </div>
  {/if}
</div>

<style>
  .toolbar {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 1000;
    background: rgba(5, 5, 10, 0.95);
    border-radius: 999px;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(12px);
    color: #f5f5f5;
    font-size: 0.8rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  button {
    border-radius: 999px;
    border: none;
    padding: 4px 11px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.08);
    color: inherit;
    font-size: 0.78rem;
    white-space: nowrap;
  }

  button.active {
    background: linear-gradient(135deg, #ffde16, #ffb400);
    color: #222;
  }

  button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  select {
    background: rgba(20, 20, 26, 0.96);
    color: #f5f5f5;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    padding: 3px 10px;
    font-size: 0.78rem;
    outline: none;
  }
</style>
