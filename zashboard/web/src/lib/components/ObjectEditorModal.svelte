<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import PopupModal from "./PopupModal.svelte";
  import ButtonObject from "./ButtonObject.svelte";
  import type { DashboardButtonObject, EditingObjectState } from "../types/dashboard";

  export let editing: EditingObjectState | null = null;

  const dispatch = createEventDispatcher<{
    close: void;
    save: DashboardButtonObject;
    remove: void;
  }>();

  let working: DashboardButtonObject | null = null;

  $: if (editing) {
    working = { ...(editing.object as DashboardButtonObject) };
  }

  function update(field: keyof DashboardButtonObject, value: string | boolean) {
    if (!working) return;
    working = { ...working, [field]: value } as DashboardButtonObject;
  }

  function handleSave() {
    if (working) {
      dispatch("save", working);
    }
  }

  function handleRemove() {
    dispatch("remove");
  }
</script>

{#if editing && working}
  <PopupModal title="Object settings" on:close={() => dispatch("close")}>
    <div class="editor">
      <section class="preview">
        <h3>Preview</h3>
        <ButtonObject object={working} editMode />
      </section>

      <section class="form">
        <label>
          <span>Entity</span>
          <input
            type="text"
            value={working.entity}
            on:input={(event) => update("entity", event.currentTarget.value)}
          />
        </label>

        <label>
          <span>Name</span>
          <input
            type="text"
            value={working.name}
            on:input={(event) => update("name", event.currentTarget.value)}
          />
        </label>

        <label>
          <span>State (optional override)</span>
          <input
            type="text"
            value={working.state ?? ""}
            on:input={(event) => update("state", event.currentTarget.value)}
          />
        </label>

        <label>
          <span>Icon</span>
          <input
            type="text"
            value={working.icon ?? ""}
            on:input={(event) => update("icon", event.currentTarget.value)}
          />
        </label>

        <label>
          <span>Accent color</span>
          <input
            type="color"
            value={working.color}
            on:input={(event) => update("color", event.currentTarget.value)}
          />
        </label>

        <label>
          <span>Service (domain.service)</span>
          <input
            type="text"
            value={working.service ?? ""}
            on:input={(event) => update("service", event.currentTarget.value)}
          />
        </label>

        <label class="toggle">
          <input
            type="checkbox"
            checked={working.showInfo}
            on:change={(event) => update("showInfo", event.currentTarget.checked)}
          />
          <span>Show more information on the button</span>
        </label>
      </section>
    </div>

    <footer class="modal-actions">
      <button type="button" class="danger" on:click={handleRemove}>
        Remove object
      </button>

      <div class="right">
        <button type="button" on:click={() => dispatch("close")}>Cancel</button>
        <button type="button" class="primary" on:click={handleSave}>
          {editing.isNew ? "Add object" : "Save changes"}
        </button>
      </div>
    </footer>
  </PopupModal>
{/if}

<style>
  .editor {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(320px, 1fr);
    gap: 1.5rem;
    padding-bottom: 1rem;
  }

  .preview,
  .form {
    background: rgba(255, 255, 255, 0.02);
    padding: 1rem;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .preview h3 {
    margin-top: 0;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-bottom: 0.85rem;
    font-size: 0.85rem;
  }

  input[type="text"],
  input[type="color"] {
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.4);
    color: inherit;
    padding: 0.6rem 0.8rem;
  }

  input[type="color"] {
    height: 42px;
  }

  .toggle {
    flex-direction: row;
    align-items: center;
    gap: 0.6rem;
  }

  .modal-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    gap: 1rem;
  }

  .modal-actions button {
    border-radius: 999px;
    border: none;
    padding: 0.6rem 1.4rem;
    cursor: pointer;
  }

  .modal-actions .danger {
    background: rgba(255, 77, 77, 0.15);
    color: #ff9f9f;
  }

  .modal-actions .right {
    display: flex;
    gap: 0.6rem;
  }

  .modal-actions .primary {
    background: linear-gradient(135deg, #ffe359, #ffb347);
    color: #171717;
  }
</style>
