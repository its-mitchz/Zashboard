<script>
  import { editMode } from "../../stores/dashboard";

  export let id;
  export let x = 50;
  export let y = 50;
  export let width = 220;
  export let height = 120;
  export let onMove; // (id, x, y) => void

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function onPointerDown(event) {
    if (!$editMode) return;

    dragging = true;
    const rect = event.currentTarget.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  function onPointerMove(event) {
    if (!dragging) return;
    const newX = event.clientX - offsetX;
    const newY = event.clientY - offsetY;

    if (onMove) {
      onMove(id, newX, newY);
    }
  }

  function onPointerUp() {
    dragging = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }
</script>

<div
  class="card-wrapper"
  style={`left:${x}px; top:${y}px; width:${width}px; height:${height}px;`}
>
  <div class="card-handle" on:pointerdown|preventDefault={onPointerDown}>
    <slot name="header" />
    {#if $editMode}
      <span class="handle-hint">Drag</span>
    {/if}
  </div>

  <div class="card-content">
    <slot />
  </div>
</div>

<style>
  .card-wrapper {
    position: absolute;
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
    background: rgba(8, 8, 12, 0.96);
    color: #f5f5f5;
    overflow: hidden;
    user-select: none;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .card-handle {
    cursor: grab;
    padding: 6px 10px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.9;
    background: linear-gradient(90deg, rgba(255, 222, 22, 0.12), rgba(255, 255, 255, 0.02));
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .handle-hint {
    font-size: 0.65rem;
    opacity: 0.8;
  }

  .card-content {
    padding: 10px 12px;
  }
</style>
