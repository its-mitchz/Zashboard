<script>
  import { onMount } from "svelte";
  import Shell from "./lib/components/Shell.svelte";
  import LightsView from "./lib/views/LightsView.svelte";
  import SettingsView from "./lib/views/SettingsView.svelte";
  import { getDashboard } from "./lib/api/dashboard";
  import { connectionStatus, connectionError } from "./lib/ha/connection";

  let dashboard = null;
  let currentViewId = "lights";
  let loading = true;
  let error = null;

  $: views = dashboard?.views ?? [];
  $: currentView = views.find((v) => v.id === currentViewId);

  $: status = $connectionStatus;
  $: wsError = $connectionError;

  onMount(async () => {
    try {
      const dash = await getDashboard();
      dashboard = dash;

      if (dash?.views?.length) {
        const lightsView = dash.views.find((v) => v.id === "lights");
        currentViewId = lightsView ? "lights" : dash.views[0].id;
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
  <div class="loading">Loading dashboard…</div>
{:else if error}
  <div class="error">Error: {error}</div>
{:else if !currentView}
  <div class="error">No views defined in dashboard.yaml</div>
{:else}
  <Shell {views} bind:currentViewId>
    {#if status !== "connected"}
      <div class="info">
        {#if status === "connecting"}
          Connecting to Home Assistant…
        {:else if status === "error"}
          Failed to connect to Home Assistant.<br />
          {#if wsError}{wsError}{/if}
        {:else}
          Waiting for Home Assistant connection…
        {/if}
      </div>
    {/if}

    {#if currentViewId === "lights"}
      <LightsView {currentView} />
    {:else if currentViewId === "settings"}
      <SettingsView />
    {:else}
      <p style="padding: 1rem;">
        View "{currentView.title}" is not implemented yet in the frontend.
      </p>
    {/if}
  </Shell>
{/if}
