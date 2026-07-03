<template>
  <a-tree-select
    :treeData="treeOptions"
    tree-data-simple-mode
    allowClear
    :show-checked-strategy="TreeSelect.SHOW_ALL"
    treeNodeLabelProp="label"
    multiple
    :filterTreeNode="isPermScope ? filterTreeNode : false"
    maxTagCount="responsive"
    :maxTagTextLength="2"
    :show-search="isPermScope"
  >
    <template #maxTagPlaceholder="omittedValues">
      <a-tooltip :title="getOmittedText(omittedValues)">
        <span>+{{ omittedValues?.length }}</span>
      </a-tooltip>
    </template>
  </a-tree-select>
</template>

<script name="gct-select" setup lang="ts">
  import { onBeforeMount, toRef, h, ref, computed } from 'vue';
  import { TreeSelect } from 'ant-design-vue';
  import { getModelMetaInfo } from '/@/apis/gct-apaas/ModelMetaController';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';

  interface Props {
    api: any;
    apiParams: any;
    filterType: string;
  }

  const props = defineProps<Props>();

  const treeOptions = ref<any>([]);
  const displayField = ref();
  const isPermScope = computed(() => props.filterType === 'permissionScope');

  const getModelInfo = async () => {
    const { modelKey } = props.apiParams ?? {};
    const res = (await getModelMetaInfo({ id: modelKey })) || {};
    displayField.value = res.displayField;
  };

  onBeforeMount(async () => {
    if (isPermScope.value) {
      await getModelInfo();
    }
    const result = await postBizServiceByModelKeyByBsKey(
      {
        ...(props.apiParams ?? {}),
        bsKey: 'listAll',
      },
      {},
    );

    const list = Array.isArray(result) ? result : (result.data ?? []);
    const options = list.map((i) => {
      if (i.__NON_LEAF__ === undefined) {
        i.__NON_LEAF__ = list.some((k) => k.parent_id_ === i.id_);
      }
      return {
        label: i.name_ || i[displayField.value] || i.id_,
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
  });

  function getOmittedText(omitted) {
    return omitted.map((v) => (v && v.label ? v.label : String(v))).join(', ');
  }

  const filterTreeNode = (inputVal, treeNode) => {
    return treeNode.title?.toLowerCase().includes(inputVal.toLowerCase());
  };
</script>
