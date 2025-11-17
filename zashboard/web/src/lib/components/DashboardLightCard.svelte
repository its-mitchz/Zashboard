<script>
  import { states, haCallService } from "../ha/connection";
  import { editMode, updateCard, removeCard } from "../../stores/dashboard";

  export let card;

  $: entity = $states?.[card.entity_id];
  $: isOn = entity?.state === "on";

  async function toggle() {
    if (!entity) return;
    const [domain] = card.entity_id.split(".", 1);
    const service = isOn ? "turn_off" : "turn_on";

    await haCallService(domain, service, {
      entity_id: card.entity_id
    });
  }

  function cycleStyle() {
    const styles = ["large-toggle", "compact", "info"];
    const idx = styles.indexOf(card.style || "large-toggle");
    const next = styles[(idx + 1) % styles.length];
    updateCard(card.id, { style: next });
  }

  function onRemove() {
    if (confirm("Remove this card?")) {
      removeCard(card.id);
    }
  }
</script>

<div class={`light-card light-card--${card.style || "large-toggle"} ${isOn ? "on" : "off"}`}>
  <div class="top-row">
    <div class="name">
      {entity?.attributes?.friendly_name ?? card.entity_id}
    </div>
    {#if $editMode}
      <div class="edit-tools">
        <button class="tiny" type="button" on:click|stopPropagation={cycleStyle} title="Cycle visual style">
          🎨
        </button>
        <button class="tiny" type="button" on:click|stopPropagation={onRemove} title="Remove card">
          ✕
        </button>
      </div>
    {/if}
  </div>

  {#if (card.style || "large-toggle") === "large-toggle"}
    <button class="big-toggle" type="button" on:click={toggle}>
      {isOn ? "ON" : "OFF"}
    </button>
  {:else if card.style === "compact"}
    <div class="compact-row">
      <button class="pill" type="button" on:click={toggle}>
        {isOn ? "Turn off" : "Turn on"}
      </button>
      <div class="state-text">
        {#if entity}
          {entity.state}
        {:else}
          unavailable
        {/if}
      </div>
    </div>
  {:else}
    <div class="info-row">
      <div class="state-dot {isOn ? 'state-dot--on' : ''}"></div>
      <span class="info-text">
        {#if entity}
          {entity.state}
        {:else}
          unavailable
        {/if}
      </span>
    </div>
  {/if}
</div>

<style>
  .light-card {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 12px;
    background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.95));
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
  }

  .light-card.on {
    box-shadow: 0 0 18px rgba(255, 223, 100, 0.35);
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    opacity: 0.9;
  }

  .edit-tools {
    display: flex;
    gap: 4px;
  }

  .tiny {
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: inherit;
    border-radius: 999px;
    padding: 2px 6px;
    cursor: pointer;
    font-size: 0.7rem;
  }

  .big-toggle {
    flex: 1;
    border-radius: 10px;
    border: none;
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    background: linear-gradient(135deg, #ffde16, #ffb400);
    color: #262626;
  }

  .light-card.off .big-toggle {
    background: linear-gradient(135deg, #2b2b2b, #151515);
    color: #f5f5f5;
  }

  .compact-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pill {
    border-radius: 999px;
    border: none;
    padding: 6px 12px;
    font-size: 0.8rem;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.08);
    color: inherit;
  }

  .state-text {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
  }

  .state-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #444;
  }

  .state-dot--on {
    background: #ffde16;
  }
</style>
