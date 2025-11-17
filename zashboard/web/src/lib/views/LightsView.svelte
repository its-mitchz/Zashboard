<script>
  import { cards, updateCardPosition } from "../../stores/dashboard";
  import EditToolbar from "../components/EditToolbar.svelte";
  import DraggableCard from "../components/DraggableCard.svelte";
  import DashboardLightCard from "../components/DashboardLightCard.svelte";

  export let currentView;
</script>

<div class="lights-root">
  <EditToolbar />

  <div class="canvas">
    {#if $cards.length === 0}
      <div class="empty-state">
        <h2>{currentView?.title ?? "Lights"}</h2>
        <p>
          Turn on <strong>Edit dashboard</strong> and add your first light card
          using the menu above.
        </p>
      </div>
    {/if}

    {#each $cards as card (card.id)}
      {#if card.type === "light"}
        <DraggableCard
          id={card.id}
          x={card.x}
          y={card.y}
          width={card.width}
          height={card.height}
          onMove={updateCardPosition}
        >
          <div slot="header">
            {currentView?.title ?? "Lights"}
          </div>

          <DashboardLightCard {card} />
        </DraggableCard>
      {/if}
    {/each}
  </div>
</div>

<style>
  .lights-root {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: radial-gradient(circle at top, #1d1d29, #050509);
    color: #f5f5f5;
  }

  .canvas {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .empty-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    max-width: 420px;
    padding: 1.5rem 1.75rem;
    border-radius: 18px;
    background: rgba(10, 10, 16, 0.92);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.7);
  }

  .empty-state h2 {
    margin: 0 0 0.5rem;
    font-size: 1.3rem;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.85;
  }
</style>
