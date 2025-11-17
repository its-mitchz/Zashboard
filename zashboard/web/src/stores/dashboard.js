// src/stores/dashboard.js
import { writable } from "svelte/store";

export const editMode = writable(false);

export const cards = writable([
  // starter example, you can remove this
  // {
  //   id: "card-1",
  //   type: "light",
  //   entity_id: "light.office_net_lights",
  //   x: 50,
  //   y: 50,
  //   width: 220,
  //   height: 120,
  //   style: "large-toggle" // or "compact", "info"
  // }
]);

let idCounter = 1;
function nextId() {
  return `card-${idCounter++}`;
}

export function addLightCard(entity_id, style = "large-toggle") {
  cards.update((current) => [
    ...current,
    {
      id: nextId(),
      type: "light",
      entity_id,
      x: 50,
      y: 50,
      width: 220,
      height: 120,
      style
    }
  ]);
}

export function updateCardPosition(id, x, y) {
  cards.update((current) =>
    current.map((card) =>
      card.id === id ? { ...card, x, y } : card
    )
  );
}

export function updateCard(id, partial) {
  cards.update((current) =>
    current.map((card) =>
      card.id === id ? { ...card, ...partial } : card
    )
  );
}

export function removeCard(id) {
  cards.update((current) => current.filter((c) => c.id !== id));
}
