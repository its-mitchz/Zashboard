<script lang="ts">
  import { onMount } from "svelte";
  import Shell from "./lib/components/Shell.svelte";
  import DraggableCard from "./lib/components/DraggableCard.svelte";
  import ButtonObject from "./lib/components/ButtonObject.svelte";
  import ObjectEditorModal from "./lib/components/ObjectEditorModal.svelte";
  import AddObjectMenu from "./lib/components/AddObjectMenu.svelte";
  import {
    rooms,
    sidebar,
    activeRoom,
    activeRoomId,
    editMode,
    editingObject,
    loadDashboardState,
    setActiveRoom,
    toggleEditMode,
    startCreatingObject,
    startEditingObject,
    saveEditingObject,
    cancelEditingObject,
    removeObject,
    updateObjectPosition
  } from "./stores/dashboard";
  import {
    initHaConnection,
    connectionStatus,
    connectionError
  } from "./lib/ha/connection";
  import type { DashboardButtonObject } from "./lib/types/dashboard";

  let addMenuOpen = false;

  onMount(() => {
    loadDashboardState();
    initHaConnection();
  });

  $: currentRoom = $activeRoom;
  $: currentEditing = $editingObject;
  $: connectionState = $connectionStatus;
  $: wsError = $connectionError;

  function handleMove(event: CustomEvent<{ id: string; x: number; y: number }>, objectId: string) {
    if (!currentRoom) return;
    updateObjectPosition(currentRoom.id, objectId, event.detail.x, event.detail.y);
  }

  function openEditor(objectId: string) {
    if (!currentRoom) return;
    startEditingObject(currentRoom.id, objectId);
  }

  function handleSave(event: CustomEvent<DashboardButtonObject>) {
    if (!currentEditing) return;
    saveEditingObject({
      roomId: currentEditing.roomId,
      object: event.detail,
      isNew: currentEditing.isNew
    });
  }

  function handleRemove() {
    if (!currentEditing) return;
    removeObject(currentEditing.roomId, currentEditing.object.id);
  }

  function handleCreate(event: CustomEvent<{ roomId: string; type: "button" }>) {
    addMenuOpen = false;
    const { roomId, type } = event.detail;
    startCreatingObject(roomId, type);
    if ($activeRoomId !== roomId) {
      setActiveRoom(roomId);
    }
  }
</script>

<Shell
  {connectionState}
  connectionMessage={wsError ?? ""}
  editMode={$editMode}
  rooms={$rooms}
  sidebar={$sidebar}
  activeRoomId={$activeRoomId}
  on:selectRoom={(event) => setActiveRoom(event.detail)}
  on:toggleEdit={() => toggleEditMode()}
  on:addObject={() => (addMenuOpen = true)}
>
  <div class="canvas-wrapper">
    {#if currentRoom}
      {#if currentRoom.objects.length === 0}
        <div class="empty-state">
          <h2>{currentRoom.title}</h2>
          <p>
            {#if $editMode}
              Use <strong>Add object</strong> to place your first control in this room.
            {:else}
              No objects yet. Enable edit mode to start customizing this room.
            {/if}
          </p>
        </div>
      {/if}

      {#each currentRoom.objects as object (object.id)}
        <DraggableCard
          id={object.id}
          x={object.x}
          y={object.y}
          width={object.width}
          height={object.height}
          on:move={(event) => handleMove(event, object.id)}
        >
          <ButtonObject
            object={object}
            editMode={$editMode}
            on:edit={() => openEditor(object.id)}
          />
        </DraggableCard>
      {/each}
    {:else}
      <div class="empty-state">
        <h2>No rooms defined</h2>
        <p>Update your dashboard configuration to add rooms.</p>
      </div>
    {/if}
  </div>
</Shell>

<ObjectEditorModal
  editing={currentEditing}
  on:close={cancelEditingObject}
  on:save={handleSave}
  on:remove={handleRemove}
/>

<AddObjectMenu
  open={addMenuOpen}
  rooms={$rooms}
  activeRoomId={$activeRoomId}
  on:close={() => (addMenuOpen = false)}
  on:create={handleCreate}
/>

<style>
  :global(body) {
    margin: 0;
    font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
    background: #05050b;
    color: #f5f5f5;
  }

  .canvas-wrapper {
    position: relative;
    min-height: 600px;
  }

  .empty-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    max-width: 320px;
    background: rgba(0, 0, 0, 0.4);
    padding: 1.5rem;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
</style>
