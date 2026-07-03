<template>
  <a-tree-select
    class="gct-request-tree-select"
    dropdownClassName="gct-request-tree-select-dropdown"
    :treeData="treeOptions"
    tree-data-simple-mode
    allowClear
    :show-checked-strategy="TreeSelect.SHOW_ALL"
    treeNodeLabelProp="label"
    :filterTreeNode="false"
    maxTagCount="responsive"
    :maxTagTextLength="3"
  />
</template>

<script name="gct-select" setup lang="ts">
  import { onBeforeMount, ref } from 'vue';
  import { TreeSelect } from 'ant-design-vue';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
  import { list_to_tree } from '/@/utils/helper/treeHelper';
  import { cloneDeep } from 'lodash-es';

  interface Props {
    api: any;
    apiParams: any;
  }

  const props = defineProps<Props>();

  const treeOptions = ref<IObject[]>([]);

  const isPrinterField = (params: Props['apiParams']) =>
    params?.fieldType === FIELD_TYPE.PRINTER;

  /** 打印机树：父节点 + printChildNode 扁平化后交给 list_to_tree */
  function buildPrinterTreeFlatList(list: IObject[]): IObject[] {
    return list.flatMap((i) => {
      const dftInfo = i.printChildNode?.find((e: IObject) => e.defaultPrint === '是');
      const parent: IObject = {
        ...i,
        label: i.name,
        value: i.printKey,
        parentId: i.parentId || 'ROOT',
        dftPrintInfo:
          i.type === PrintResourceEnum.CLIENT_PRINT && dftInfo
            ? { ...dftInfo, value: dftInfo.printKey, label: dftInfo.name }
            : undefined,
      };
      const children = (i.printChildNode as IObject[] | undefined)?.map((e) => ({
        ...e,
        label: e.name,
        value: e.printKey,
        parentId: i.printKey,
      })) ?? [];
      return [parent, ...children];
    });
  }

  onBeforeMount(async () => {
    if (typeof props.api === 'function') {
      const result = await props.api({ ...(props.apiParams ?? {}) });
      const list = Array.isArray(result) ? result : result.data ?? [];
      if (isPrinterField(props.apiParams)) {
        const valueList = buildPrinterTreeFlatList(list ?? []);
        treeOptions.value = list_to_tree(
          cloneDeep(valueList.map((i) => ({ ...i, id: i.printKey }))),
          (node) => ({
            ...node,
            title: node.label ?? node.name ?? '',
            disabled: node.parentId === 'ROOT' && node.type === PrintResourceEnum.INTERNET_PRINT,
          }),
        );
      } else {
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
            title: ch_full_path,
          };
        });
      }
    }
  });
</script>

<!-- 下拉层渲染在 body，须用 dropdownClassName 限定作用域，勿用 scoped -->
<style lang="less">
  .gct-request-tree-select-dropdown.ant-select-dropdown {
    max-width: min(520px, 92vw);
  }

  .gct-request-tree-select-dropdown {
    .ant-select-tree-list-holder-inner {
      max-width: 100%;
    }

    .ant-select-tree-treenode {
      max-width: 100%;
    }

    .ant-select-tree-node-content-wrapper {
      flex: 1;
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
    }

    .ant-select-tree-title {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
