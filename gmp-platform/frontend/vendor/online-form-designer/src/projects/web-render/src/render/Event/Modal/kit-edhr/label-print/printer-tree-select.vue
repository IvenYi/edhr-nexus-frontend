<template>
  <div v-if="readonly" :title="selectedVal?.label">
    <!-- <div>{{ selectedVal?.label || value }}</div> -->
     {{ selectedVal?.label || value }}
    <a-tag v-if="selectedVal?.defaultPrint === '是'"  color="processing">{{ $t('sys.default') }}</a-tag>
  </div>
  <a-tree-select
    v-else
    show-search
    v-model:value="value"
    :placeholder="$t('sys.chooseText')"
    :allowClear="true"
    tree-node-filter-prop="label"
    treeNodeLabelProp="label"
    :tree-data="treeoptions"
    :disabled="disabled"
    :size="size"
    tree-default-expand-all
    dropdown-class-name="gct-custom-select-dropdown vxe-table--ignore-clear"
    :listHeight="310"
    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
    :dropdownMatchSelectWidth="false"
    style="width: 100%"
  >
    <template #title="item">
      <!-- 由于tree-select的title插槽会被引用到选中项的回显中，所以只能在插槽中判断是下拉框还是选中项的回显 -->
      <a-row v-if="item.label">
        <a-col
          :span="item.defaultPrint === '是' ? 18 : 24"
          class="gct-text-overflow"
          :title="item.label"
        >
          {{ item.label }}
        </a-col>
        <a-col v-if="item.defaultPrint === '是'" :span="6" class="text-right">
          <a-tag color="processing">{{ $t('sys.default') }}</a-tag>
        </a-col>
      </a-row>
      <span v-else>{{ value }}</span>
    </template>
  </a-tree-select>
</template>
<script setup lang="ts">
  import { computed, ref, watch, onMounted } from 'vue';
  import { list_to_tree } from '/@/utils/helper/treeHelper';
  import { cloneDeep } from 'lodash-es';
  import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
  import { getPrintPrintDropdownList } from '/@/apis/gct-apaas/PrintController';

  const props = defineProps<{
    modelValue?: string;
    disabled?: boolean;
    size?: 'small' | 'middle' | 'large';
    readonly?: boolean;
  }>();

  const emit = defineEmits(['update:modelValue']);
  const value = ref(props.modelValue);
  const options = ref<any[]>([]);

  const selectedVal = computed(() => {
    return options.value.find((i) => i.printKey === value.value);
  });

  const treeoptions = computed(() => {
    const valueList = list_to_tree(
      cloneDeep(
        options.value.map((i) => {
          return {
            ...i,
            id: i.printKey,
          };
        }),
      ),
      (node) => {
        return {
          ...node,
          disabled: node.parentId === 'ROOT' && node.type === PrintResourceEnum.INTERNET_PRINT,
        };
      },
    );
    return valueList;
  });

  watch(
    () => value.value,
    (val) => {
      emit('update:modelValue', val);
    },
  );

  watch(
    () => props.modelValue,
    (val) => {
      value.value = val;
    },
  );

  onMounted(() => {
    getPrinterList();
  });

  async function getPrinterList() {
    const data = (await getPrintPrintDropdownList()) || [];
    const list: Array<any> = [];
    data?.forEach((i) => {
      const dftInfo =
        (i.printChildNode && i.printChildNode.filter((e) => e.defaultPrint === '是')[0]) ||
        undefined;
      const obj = {
        ...i,
        label: i.name,
        value: i.printKey,
        parentId: i.parentId || 'ROOT',
        dftPrintInfo:
          i.type === PrintResourceEnum.CLIENT_PRINT && dftInfo
            ? { ...dftInfo, value: dftInfo.printKey, label: dftInfo.name }
            : undefined,
      };
      list.push({ ...obj });
      if (i.printChildNode) {
        list.push(
          ...i.printChildNode.map((e) => {
            const obj = {
              ...e,
              label: e.name,
              value: e.printKey,
              parentId: i.printKey,
            };
            return {
              ...obj,
            };
          }),
        );
      }
    });
    options.value = list;
  }
</script>
<style lang="less" scoped></style>
