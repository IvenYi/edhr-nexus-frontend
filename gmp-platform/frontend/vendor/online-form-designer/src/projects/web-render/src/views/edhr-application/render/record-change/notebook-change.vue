<template>
  <basic-page-render>
    <div :class="[ns.b()]">
      <note-book-left :class="[ns.e('left')]" ref="notebookLeftRef" />
      <note-book-container
        :recordBookId="recordId"
        :paramExtraProps="{ _gct_record_id: recordId }"
      />
    </div>
  </basic-page-render>
</template>

<script lang="ts" setup>
  import { ref, computed, onBeforeMount } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import NoteBookLeft from './note-book/note-book-left.vue';
  import NoteBookContainer from './note-book/note-book-container.vue';

  const ns = useNamespace('notebook-change-index');

  const notebookLeftRef = ref<InstanceType<typeof NoteBookLeft> | null>(null);

  const recordId = computed(() => notebookLeftRef.value?.getValue?.()?.recordId ?? null);
</script>

<style lang="less" scoped>
  .gct-notebook-change-index {
    display: flex;
    height: 100%;
    width: 100%;
  }
</style>
