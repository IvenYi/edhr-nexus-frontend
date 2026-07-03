<template>
  <a-tree-select
    :class="[ns.b()]"
    v-model:value="selectValue"
    :tree-data="selectTreeData"
    tree-default-expand-all
    :size="size || 'small'"
  />
</template>

<script lang="ts" setup name="EdhrOutline">
  import { computed, ref, watch } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { isNil } from 'lodash-es';
  import { useEDHRWiki } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
  import { OutlineSelectTreeNode } from './type';
  import { getParentOutlines } from './edhr-outline.util';

  const ns = useNamespace('edhr-outline-select');

  const { outlineTreeData } = useEDHRWiki();

  const selectTreeData = ref<OutlineSelectTreeNode[]>([]);

  const props = withDefaults(
    defineProps<{
      value?: string;
      size?: 'small' | 'middle' | 'large';
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string | undefined): void;
  }>();

  const selectValue = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });

  watch(
    () => outlineTreeData.value,
    (v) => {
      if (!isNil(v)) {
        selectTreeData.value = getParentOutlines(outlineTreeData.value);
      }
    },
    { immediate: true },
  );
</script>

<style lang="scss" scoped>
  @include b(edhr-outline-select) {
    width: 100%;
  }
</style>
