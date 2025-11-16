<script>
  import { createEventDispatcher } from "svelte";

  export let light;
  const dispatch = createEventDispatcher();

  $: isOn = light?.state === "on";

  function handleToggleClick(event) {
    event.stopPropagation();
    dispatch("toggle");
  }
</script>

<div class="light-card" class:on={isOn}>
  <div class="light-title">
    <div class="light-title-main">
      <span class="light-name">
        {light?.attributes?.friendly_name ?? light?.entity_id}
      </span>
      <span class="light-entity">{light?.entity_id}</span>
    </div>
    <div class="light-title-right">
      <span class="badge" class:state-on={isOn} class:state-off={!isOn}>
        {isOn ? "On" : "Off"}
      </span>
    </div>
  </div>

  <div class="light-actions">
    <button class="primary" type="button" on:click={handleToggleClick}>
      {isOn ? "Turn off" : "Turn on"}
    </button>
  </div>
</div>
