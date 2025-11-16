<script>
  import { derived } from "svelte/store";
  import LightCard from "../components/LightCard.svelte";
  import { states, haCallService } from "../ha/connection";

  export let currentView;

  $: sections = currentView?.sections ?? [];

  const lightsStore = derived(states, ($states) => {
    const all = Object.values($states || {});
    const lights = all.filter((e) => e && e.entity_id && e.entity_id.startsWith("light."));
    const byId = {};
    for (const e of lights) {
      byId[e.entity_id] = e;
    }
    return { list: lights, byId };
  });

  let lightsList = [];
  let lightsById = {};

  $: {
    const val = $lightsStore;
    lightsList = val.list;
    lightsById = val.byId;
  }

  function lightsForSection(section) {
    if (section.auto_domain === "light") {
      return lightsList;
    }
    if (Array.isArray(section.cards)) {
      const out = [];
      for (const card of section.cards) {
        if (card.type === "light" && card.entity_id && lightsById[card.entity_id]) {
          out.push(lightsById[card.entity_id]);
        }
      }
      return out;
    }
    return [];
  }

  function toggle(light) {
    haCallService("light", "toggle", { entity_id: light.entity_id });
  }
</script>

<div class="lights-view">
  {#if !sections.length}
    <p style="padding: 1rem;">No sections defined for this view.</p>
  {:else}
    {#each sections as section}
      <section class="section">
        <header class="main-header">
          <div class="main-title">
            <h1>{section.title}</h1>
          </div>
        </header>

        <div class="card-grid">
          {#each lightsForSection(section) as light (light.entity_id)}
            <LightCard {light} on:toggle={() => toggle(light)} />
          {/each}
        </div>
      </section>
    {/each}
  {/if}
</div>
