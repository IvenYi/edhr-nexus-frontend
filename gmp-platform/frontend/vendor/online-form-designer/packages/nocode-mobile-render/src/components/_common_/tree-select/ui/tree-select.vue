<template>
  <div :class="['tree-select']" @click.stop="openPopup">
    <span v-if="selectedNodes.length">
      <slot name="value-label" :selectedNodes="selectedNodes">{{ label }}</slot>
    </span>
    <span class="color-[#c8c9cc]" v-else>{{ placeholder }}</span>
  </div>
</template>

<script lang="ts" setup name="tree-select">
  import { i18n } from '@mobile/locales/setupI18n';
  import { GctPopup } from '@mobile/utils/popup';
  import TreeSelectPopup from './tree-select-popup.vue';
  import { TreeSelectController } from '../hooks/tree-select-controller';
  import { computed, ref, useSlots, watch } from 'vue';
  import { SelectTreeNode } from '../types/tree-select-popup';

  const { t } = i18n.global;

  const slots = useSlots();

  const props = withDefaults(
    defineProps<{
      selectedIds?: string[];
      placeholder?: string;
      multiple?: boolean;
      controller: TreeSelectController;
    }>(),
    {
      selectedIds: () => [],
      placeholder: '请选择',
      multiple: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:selectedIds', selectedIds: string[]): void;
  }>();

  const selectedNodes = computed(() => props.controller.state.selectedNodes);
  const _selectedIds = computed(() => selectedNodes.value.map((i) => i.id));

  const label = computed(() => {
    return selectedNodes.value.map((node) => node.name).join(',');
  });

  const openPopup = () => {
    let popSlots: any = undefined;
    if (slots['node-label']) {
      popSlots = {
        'node-label': slots['node-label'],
      };
    }

    GctPopup.open(
      TreeSelectPopup,
      {
        controller: props.controller,
        selectedNodes: selectedNodes.value,
        multiple: props.multiple,
        onOk(nodes) {
          props.controller.setSelectedNodes(nodes);
          emit('update:selectedIds', _selectedIds.value);
        },
      },
      popSlots,
    );
  };

  watch(
    () => props.selectedIds,
    async (value) => {
      await props.controller.setSelectedIds(value);
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="less" scoped>
  .tree-select {
  }
</style>
