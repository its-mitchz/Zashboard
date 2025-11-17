<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { DashboardButtonObject } from "../types/dashboard";
  import { states } from "../ha/connection";
  import { haCallService } from "../ha/connection";

  export let object: DashboardButtonObject;
  export let editMode = false;

  const dispatch = createEventDispatcher<{ edit: void }>();

  $: entity = object.entity ? $states?.[object.entity] : null;
  $: isOn = entity?.state === "on";

  function handleClick() {
    if (editMode) {
      dispatch("edit");
      return;
    }
    if (!object.service) return;
    const [domain, service] = object.service.split(".");
    if (!domain || !service) return;
    haCallService(domain, service, { entity_id: object.entity });
  }
</script>

<div
  class={`button-card ${isOn ? "active" : ""} ${editMode ? "editing" : ""}`}
  style={`--button-color: ${object.color || "#ffde16"}`}
>
  <button type="button" on:click={handleClick}>
    <div class="top-row">
      <span class="icon">{object.icon ?? "BTN"}</span>
      <span class="name">{object.name}</span>
    </div>
    {#if object.showInfo}
      <div class="info">
        <span class="state">
          {#if entity}
            {entity.state}
          {:else if object.state}
            {object.state}
          {:else}
            unavailable
          {/if}
        </span>
        {#if object.service}
          <small>{object.service}</small>
        {/if}
      </div>
    {/if}
  </button>
</div>

<style>
  .button-card {
    width: 100%;
    height: 100%;
    border-radius: 18px;
    padding: 0.2rem;
    background: rgba(255, 255, 255, 0.04);
    box-sizing: border-box;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .button-card.active {
    box-shadow: 0 0 25px rgba(255, 227, 89, 0.4);
  }

  button {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    border: none;
    background: radial-gradient(circle at top, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0.65));
    color: inherit;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: left;
    cursor: pointer;
  }

  .editing button {
    cursor: pointer;
    outline: 1px dashed rgba(255, 255, 255, 0.4);
  }

  .editing button:hover {
    outline-color: var(--button-color);
  }

  .top-row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 0.95rem;
  }

  .icon {
    font-size: 1.7rem;
  }

  .name {
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .info small {
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.6;
  }
</style>
