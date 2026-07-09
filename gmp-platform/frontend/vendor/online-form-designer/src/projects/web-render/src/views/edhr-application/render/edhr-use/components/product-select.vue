<template>
  <a-tree-select
    :class="[ns.b()]"
    v-model:value="local"
    :placeholder="$t('sys.chooseTextTip', { name: $t('sys.edhr.product') })"
    v-model:searchValue="searchValue"
    style="width: 100%"
    :tree-data="treeData"
    show-search
    :allowClear="true"
    :treeNodeLabelProp="multiple ? 'label' : 'select_label'"
    :virtual="false"
    @search="onSearch"
    :filterTreeNode="filterTreeNode"
    @clear="onClear"
    treeDefaultExpandAll
    dropdown-class-name="vxe-table--ignore-clear"
    :multiple="multiple"
  />
</template>

<script lang="ts" setup name="product-select">
  import { useNamespace } from '@gct/runtime';
  import { getProduct } from '../logic/use-model-service';
  import { computed, h, onMounted, ref } from 'vue';
  import { debounce } from 'lodash-es';

  const ns = useNamespace('product-select');

  const props = withDefaults(
    defineProps<{
      value?: string;
      items?: string[];
      /** 是否选中父级实际选中默认子版本 */
      parentToDefault?: boolean;
      multiple?: boolean;
    }>(),
    {
      value: undefined,
      parentToDefault: false,
      multiple: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
    (e: 'update:items', value?: string[]): void;
  }>();

  let defaultVersionMap: Record<string, string> = {};

  /** 转换抛出的数据，选中父抛出默认子的id */
  const toDefaultVersionId = (id: string) => {
    if (props.parentToDefault || props.multiple) {
      return defaultVersionMap[id] || id;
    }
    return id;
  };

  const local = computed({
    get() {
      if (props.multiple) {
        return props.items;
      }
      return props.value;
    },
    set(v) {
      if (props.multiple) {
        const val =
          v === undefined
            ? undefined
            : Array.from(new Set((v as any[]).map((i) => toDefaultVersionId(i)) || []));
        emit('update:items', val);
      }
      emit('update:value', v === undefined ? undefined : toDefaultVersionId(v as string));
    },
  });

  const searchValue = ref();
  const treeData = ref<any[]>([]);

  const load = async (params) => {
    const res = await getProduct(params);
    defaultVersionMap = {};
    treeData.value =
      res?.data?.map((item: any) => {
        // 父节点
        const parentNode: any = {
          label: item.name_,
          value: item.id_,
          title: item.name_,
          filterText: item.name_,
          select_label: () =>
            h('div', [
              h('span', item.name_),
              h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
            ]),
        };

        // 子节点
        if (item.__CHILDREN__) {
          parentNode.children = item.__CHILDREN__.map((child: any) => {
            const childId = `${item.id_}:${child.id_}`;
            if (child.default_) {
              defaultVersionMap[item.id_] = childId;
            }
            return {
              filterText: item.name_,
              label: `${item.name_}:${child.version_}`,
              title: () =>
                h('div', [
                  h('span', { class: 'version' }, child.version_),
                  child.default_
                    ? h('span', { class: 'version gct-custom-tag ml8px' }, '默认')
                    : null,
                ]),
              value: childId,
              select_label: () => h('div', [h('span', `${child.name_}:${child.version_}`)]),
            };
          });
        }
        return parentNode;
      }) || [];
    console.log('加载出来的数据', treeData.value);
  };

  onMounted(() => {
    load({});
  });

  const onClear = () => {
    emit('update:value', undefined);
    emit('update:items', undefined);
  };

  const onSearch = debounce(async () => {
    // 多选只能本地搜索
    if (props.multiple) {
      return;
    }
    await load({
      keyword: searchValue.value,
      // pageNo: 1
    });
  }, 200);

  const filterTreeNode = (inputVal, treeNode) => {
    if (!props.multiple) {
      return true;
    }
    return treeNode.filterText.includes(inputVal);
  };
</script>

<style lang="scss" scoped>
  $product-select: ();

  @include b(product-select) {
    @include set-component-css-var(product-select, $product-select);
  }
</style>
