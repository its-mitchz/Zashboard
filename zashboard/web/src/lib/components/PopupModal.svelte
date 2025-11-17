<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  export let title = "";

  const dispatch = createEventDispatcher<{ close: void }>();
  let modalRef: HTMLDivElement | null = null;

  function close() {
    dispatch("close");
  }

  function onOverlayClick(event: PointerEvent) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      close();
    }
  }

  onMount(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  });
</script>

<div class="overlay" role="presentation" on:pointerdown={onOverlayClick}>
  <div class="modal" bind:this={modalRef} role="dialog" aria-modal="true" aria-label={title}>
    <header class="modal-header">
      <div class="title-block">
        <small>Dashboard popup</small>
        <h2>{title}</h2>
      </div>
      <button type="button" class="close" on:click={close} title="Close popup">
        x
      </button>
    </header>
    <div class="modal-body">
      <slot />
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(5, 5, 10, 0.65);
    display: grid;
    place-items: center;
    z-index: 2000;
    backdrop-filter: blur(8px);
    padding: 1rem;
  }

  .modal {
    width: min(100%, 960px);
    max-height: 85vh;
    overflow: hidden;
    border-radius: 24px;
    background: rgba(7, 7, 14, 0.95);
    color: #f5f5f5;
    box-shadow: 0 35px 80px rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 1.5rem 1rem;
    gap: 1rem;
  }

  .title-block small {
    font-size: 0.75rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .title-block h2 {
    margin: 0.25rem 0 0;
    font-size: 1.35rem;
    font-weight: 600;
  }

  .close {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: inherit;
    font-size: 1.4rem;
    cursor: pointer;
  }

  .modal-body {
    padding: 0 1.5rem 1.5rem;
    overflow: auto;
  }
</style>
