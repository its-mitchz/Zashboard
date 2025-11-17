<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";
  import type { DashboardRoom, DashboardSidebar } from "../types/dashboard";
  import RoomTabs from "./RoomTabs.svelte";

  export let rooms: DashboardRoom[] = [];
  export let sidebar: DashboardSidebar = { title: "Zashboard" };
  export let activeRoomId: string | null = null;
  export let editMode = false;
  export let connectionState: "idle" | "connecting" | "connected" | "disconnected" | "error" =
    "idle";
  export let connectionMessage = "";

  const dispatch = createEventDispatcher();

  const hasIcon = (value?: string | null) => Boolean(value && value.includes(":"));

  function selectRoom(id: string) {
    dispatch("selectRoom", id);
  }
</script>

<div class="shell">
  <aside class="sidebar">
    <div class="brand">
      <div class="logo">{sidebar.logo ?? "Z"}</div>
      <div>
        <h1>{sidebar.title}</h1>
        {#if sidebar.subtitle}
          <p>{sidebar.subtitle}</p>
        {/if}
      </div>
    </div>

    <nav>
      {#each rooms as room}
        <button
          type="button"
          class:selected={room.id === activeRoomId}
          on:click={() => selectRoom(room.id)}
        >
          <span class="icon">
            {#if hasIcon(room.icon)}
              <Icon icon={room.icon} inline />
            {:else}
              {room.icon ?? room.title.slice(0, 1)}
            {/if}
          </span>
          <span class="label">{room.title}</span>
        </button>
      {/each}
    </nav>
  </aside>

  <section class="main">
    <header class="main-header">
      <RoomTabs {rooms} {activeRoomId} on:select={(event) => selectRoom(event.detail)} />
      <div class="actions">
        <button
          type="button"
          class:active={editMode}
          on:click={() => dispatch("toggleEdit")}
        >
          {editMode ? "Done editing" : "Edit dashboard"}
        </button>
        <button type="button" class="primary" on:click={() => dispatch("addObject")}>
          + Add object
        </button>
      </div>
    </header>

    {#if connectionState !== "connected"}
      <div class="connection-banner">
        <strong>Status:</strong>
        <span class="state">{connectionState}</span>
        {#if connectionMessage}
          <span class="message">{connectionMessage}</span>
        {/if}
      </div>
    {/if}

    <div class="content">
      <slot />
    </div>
  </section>
</div>

<style>
  .shell {
    display: grid;
    grid-template-columns: 280px 1fr;
    min-height: 100vh;
    background: #05050b;
    color: #f5f5f5;
  }

  .sidebar {
    padding: 1.5rem;
    background: radial-gradient(circle at top, #0f0f1a, #030308);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .logo {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.08);
    display: grid;
    place-items: center;
    font-size: 1.8rem;
    font-weight: 700;
  }

  .brand h1 {
    margin: 0;
    font-size: 1.6rem;
    letter-spacing: 0.08em;
  }

  .brand p {
    margin: 0.2rem 0 0;
    opacity: 0.7;
    font-size: 0.85rem;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  nav button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: transparent;
    border: none;
    color: inherit;
    padding: 0.6rem 0.75rem;
    border-radius: 12px;
    cursor: pointer;
    opacity: 0.7;
    transition: background 0.2s ease, opacity 0.2s ease;
    text-align: left;
  }

  nav button:hover,
  nav button.selected {
    background: rgba(255, 255, 255, 0.08);
    opacity: 1;
  }

  .icon {
    font-size: 1.2rem;
    width: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .icon :global(svg) {
    width: 1.2rem;
    height: 1.2rem;
  }

  .main {
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .main-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .actions {
    display: flex;
    gap: 0.6rem;
  }

  .actions button {
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: inherit;
    padding: 0.45rem 1.2rem;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .actions button.active {
    background: linear-gradient(135deg, #ffe359, #ffb347);
    color: #27271f;
    border-color: transparent;
  }

  .actions button.primary {
    background: rgba(255, 255, 255, 0.12);
  }

  .connection-banner {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .connection-banner .state {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .connection-banner .message {
    opacity: 0.7;
  }

  .content {
    flex: 1;
    border-radius: 28px;
    background: radial-gradient(circle at top, #111122, #05050b);
    padding: 1.5rem;
    position: relative;
    min-height: 500px;
    overflow: hidden;
  }
</style>
