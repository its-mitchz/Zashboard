<script>
  import { onMount } from "svelte";
  import Shell from "./lib/components/Shell.svelte";
  import PopupModal from "./lib/components/PopupModal.svelte";
  import LightsView from "./lib/views/LightsView.svelte";
  import SettingsView from "./lib/views/SettingsView.svelte";
  import { getDashboard } from "./lib/api/dashboard";
  import { connectionStatus, connectionError } from "./lib/ha/connection";

  let dashboard = null;
  let loading = true;
  let error = null;
  let activePopupId = null;

  $: views = dashboard?.views ?? [];
  $: popupView = views.find((v) => v.id === activePopupId);

  $: status = $connectionStatus;
  $: wsError = $connectionError;

  onMount(async () => {
    try {
      const dash = await getDashboard();
      dashboard = dash;

      if (!dash?.views?.length) {
        activePopupId = null;
      }
    } catch (e) {
      console.error(e);
      error = e?.message ?? String(e);
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="loading">Loading dashboard...</div>
{:else if error}
  <div class="error">Error: {error}</div>
{:else if views.length === 0}
  <div class="error">No views defined in dashboard.yaml</div>
{:else}
  <Shell
    {views}
    on:openView={(event) => (activePopupId = event.detail)}
  >
    {#if status !== "connected"}
      <div class="info">
        {#if status === "connecting"}
          Connecting to Home Assistant...
        {:else if status === "error"}
          Failed to connect to Home Assistant.<br />
          {#if wsError}{wsError}{/if}
        {:else}
          Waiting for Home Assistant connection...
        {/if}
      </div>
    {/if}

    {#if activePopupId && popupView}
      <PopupModal title={popupView.title} on:close={() => (activePopupId = null)}>
        {#if activePopupId === "lights"}
          <LightsView currentView={popupView} />
        {:else if activePopupId === "settings"}
          <SettingsView />
        {:else}
          <div class="placeholder-view">
            <p>View "{popupView.title}" is not implemented yet in the frontend.</p>
          </div>
        {/if}
      </PopupModal>
    {/if}
  </Shell>
{/if}

<style>
  .loading,
  .error {
    display: grid;
    place-items: center;
    height: 100vh;
    color: #f5f5f5;
    font-size: 1.1rem;
    background: radial-gradient(circle at top, #141422, #050509);
    text-align: center;
    padding: 1.5rem;
  }

  .info {
    position: absolute;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.75rem 1.25rem;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    color: #f5f5f5;
    font-size: 0.85rem;
    text-align: center;
    backdrop-filter: blur(10px);
    max-width: min(90%, 420px);
  }

  .placeholder-view {
    padding: 1rem;
  }
</style>
