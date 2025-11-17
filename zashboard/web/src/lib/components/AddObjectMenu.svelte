<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";
  import type { DashboardRoom } from "../types/dashboard";

  export let open = false;
  export let rooms: DashboardRoom[] = [];
  export let activeRoomId: string | null = null;

  const dispatch = createEventDispatcher<{
    close: void;
    create: { roomId: string; type: "button" };
  }>();

  function close() {
    dispatch("close");
  }

  function handleOverlayClick(event: PointerEvent) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  function createButton(roomId: string) {
    dispatch("create", { roomId, type: "button" });
  }

  const hasIcon = (value?: string | null) => Boolean(value && value.includes(":"));
</script>

{#if open}
  <div class="add-overlay" role="presentation" on:pointerdown={handleOverlayClick}>
    <div class="panel">
      <header>
        <div>
          <h2>Add an object</h2>
          <p>Select the room where this object should appear.</p>
        </div>
        <button type="button" on:click={close}>x</button>
      </header>

      <div class="room-list">
        {#each rooms as room}
          <article class:selected={room.id === activeRoomId}>
            <div class="room-meta">
              <span class="icon">
                {#if hasIcon(room.icon)}
                  <Icon icon={room.icon} inline />
                {:else}
                  {room.icon ?? room.title.slice(0, 1)}
                {/if}
              </span>
              <div>
                <h3>{room.title}</h3>
                {#if room.description}
                  <small>{room.description}</small>
                {/if}
              </div>
            </div>
            <div class="object-choices">
              <button type="button" on:click={() => createButton(room.id)}>
                <strong>Button</strong>
                <span>Call a Home Assistant service</span>
              </button>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .add-overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.65);
    z-index: 1500;
    padding: 1rem;
  }

  .panel {
    width: min(960px, 100%);
    max-height: 90vh;
    overflow: hidden;
    border-radius: 24px;
    background: rgba(5, 5, 12, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
  }

  header {
    display: flex;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    align-items: center;
    gap: 1rem;
  }

  header h2 {
    margin: 0;
  }

  header p {
    margin: 0.4rem 0 0;
    opacity: 0.7;
  }

  header button {
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: inherit;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
  }

  .room-list {
    padding: 1.5rem;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  article {
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
  }

  article.selected {
    border-color: rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.05);
  }

  .room-meta {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    margin-bottom: 0.8rem;
  }

  .room-meta .icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.08);
    display: grid;
    place-items: center;
    font-size: 1.3rem;
  }

  .room-meta .icon :global(svg) {
    width: 1.3rem;
    height: 1.3rem;
  }

  .room-meta h3 {
    margin: 0;
  }

  .room-meta small {
    opacity: 0.6;
  }

  .object-choices button {
    width: 100%;
    border: none;
    border-radius: 16px;
    padding: 0.9rem;
    text-align: left;
    background: rgba(255, 255, 255, 0.07);
    color: inherit;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .object-choices strong {
    font-size: 1rem;
  }

  .object-choices span {
    font-size: 0.8rem;
    opacity: 0.7;
  }
</style>
