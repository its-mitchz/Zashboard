<script>
  import { createEventDispatcher } from "svelte";

  export let views = [];

  const dispatch = createEventDispatcher();

  function openView(id) {
    dispatch("openView", id);
  }
</script>

<div class="shell">
  <div class="bg">
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>
    <div class="grid-overlay"></div>
  </div>

  <main class="center-stage">
    <div class="brand">
      <div class="logo">Z</div>
      <div>
        <h1>Zashboard</h1>
        <p>HAFusion-style popup dashboard</p>
      </div>
    </div>

    <div class="view-picker">
      {#each views as v}
        <button type="button" class="view-button" on:click={() => openView(v.id)}>
          <span class="icon">{v.icon ?? (v.title?.slice(0, 1) ?? "*")}</span>
          <span class="title">{v.title}</span>
          {#if v.description}
            <small>{v.description}</small>
          {/if}
        </button>
      {/each}
    </div>
  </main>

  <slot />
</div>

<style>
  .shell {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: #030308;
    color: #f5f5f5;
  }

  .bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.5;
  }

  .glow-1 {
    width: 520px;
    height: 520px;
    background: #583bff;
    top: -120px;
    left: -120px;
  }

  .glow-2 {
    width: 600px;
    height: 600px;
    background: #ffbe3d;
    bottom: -200px;
    right: -160px;
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
  }

  .grid-overlay::before {
    content: "";
    position: absolute;
    inset: 0;
    background-size: 80px 80px;
    background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    opacity: 0.25;
  }

  .center-stage {
    position: relative;
    z-index: 10;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    padding: 2rem;
    text-align: center;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    pointer-events: auto;
  }

  .logo {
    width: 70px;
    height: 70px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.15);
    display: grid;
    place-items: center;
    font-size: 1.6rem;
    font-weight: 700;
  }

  .brand h1 {
    margin: 0;
    font-size: 2rem;
    letter-spacing: 0.1em;
  }

  .brand p {
    margin: 0.2rem 0 0;
    opacity: 0.75;
    font-size: 0.85rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .view-picker {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    width: min(900px, 100%);
    pointer-events: auto;
  }

  .view-button {
    border: none;
    border-radius: 24px;
    padding: 1.4rem 1.2rem;
    text-align: left;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.06);
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .view-button:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.12);
  }

  .icon {
    font-size: 1.5rem;
    opacity: 0.8;
  }

  .title {
    font-size: 1.1rem;
    font-weight: 600;
  }

  small {
    opacity: 0.7;
    font-size: 0.78rem;
  }
</style>
