<template>
  <a-tree-select
    :treeData="treeOptions"
    tree-data-simple-mode
    allowClear
    :show-checked-strategy="TreeSelect.SHOW_ALL"
    treeNodeLabelProp="label"
    :filterTreeNode="false"
    maxTagCount="responsive"
    :maxTagTextLength="2"
  />
</template>

<script name="gct-select" setup lang="ts">
  import { onBeforeMount, toRef, h, ref } from 'vue';
  import { TreeSelect } from 'ant-design-vue';

  interface Props {
    api: any;
    apiParams: any;
  }

  const props = defineProps<Props>();

  const treeOptions = ref<any>([]);

  onBeforeMount(async () => {
    if (typeof props.api === 'function') {
      const result = await props.api({ ...(props.apiParams ?? {}) });
      const list = Array.isArray(result) ? result : (result.data ?? []);
      const options = list.map((i) => {
        if (i.__NON_LEAF__ === undefined) {
          i.__NON_LEAF__ = list.some((k) => k.parent_id_ === i.id_);
        }
        return {
          label: i.__LABEL__,
          value: i.id_,
          full_path_: i.full_path_,
          _item: i,
          id: i.id_,
          pId: i.parent_id_,
          isLeaf: !i.__NON_LEAF__,
        };
      });

      treeOptions.value = options.map((item) => {
        const fullPaths = item.full_path_.split('/');
        const ch_full_path = fullPaths
          .map((path) => {
            const n = options.find((k) => k.value === path);
            if (n) {
              return n.label;
            }
            return null;
          })
          .filter((i) => i)
          .join('/');
        return {
          ...item,
          label: ch_full_path,
          title: item.label,
        };
      });
    }
  });
</script>
