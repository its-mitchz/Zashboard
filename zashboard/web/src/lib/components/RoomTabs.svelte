<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { DashboardRoom } from "../types/dashboard";

  export let rooms: DashboardRoom[] = [];
  export let activeRoomId: string | null = null;

  const dispatch = createEventDispatcher<{ select: string }>();

  function select(id: string) {
    dispatch("select", id);
  }
</script>

<div class="room-tabs">
  {#each rooms as room}
    <button
      type="button"
      class:selected={room.id === activeRoomId}
      on:click={() => select(room.id)}
    >
      <span class="title">{room.title}</span>
      {#if room.description}
        <small>{room.description}</small>
      {/if}
    </button>
  {/each}
</div>

<style>
  .room-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  button {
    border: none;
    border-radius: 18px;
    padding: 0.65rem 1rem;
    background: rgba(255, 255, 255, 0.08);
    color: inherit;
    cursor: pointer;
    min-width: 140px;
    text-align: left;
    transition: background 0.2s ease, transform 0.2s ease;
  }

  button.selected {
    background: rgba(255, 255, 255, 0.18);
    transform: translateY(-2px);
  }

  .title {
    display: block;
    font-weight: 600;
    font-size: 0.9rem;
  }

  small {
    display: block;
    font-size: 0.7rem;
    opacity: 0.7;
  }
</style>
