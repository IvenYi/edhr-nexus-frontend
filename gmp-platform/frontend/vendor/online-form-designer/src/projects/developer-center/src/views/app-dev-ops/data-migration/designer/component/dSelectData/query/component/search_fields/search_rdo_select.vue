<template>
  <div class="ks-row-middle">
    <a-tree-select
      style="width: 100%"
      v-model:value="value"
      v-bind="separatorAttr"
      :tree-data="treeData"
      :virtual="true"
      treeNodeLabelProp="label"
      treeNodeFilterProp="name"
      @dropdownVisibleChange="dropdownVisibleChange"
      treeDefaultExpandAll
      @select="changeSelect"
      @change="emit('tableSearch')"
      multiple
    />
  </div>
</template>

<script name="gct-rdo-select" setup lang="ts">
  import { ref, computed, h, toRaw, toRef, nextTick, toRefs, onMounted } from 'vue';
  import type { SearchSelect } from '/@page-designer/types/web';
  import type { TreeSelectProps } from 'ant-design-vue';
  import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
  import { debounce } from 'lodash-es';

  const props = defineProps<{
    modelValue?: string;
    widget: SearchSelect;
    configByHeaders: object;
  }>();
  const emit = defineEmits(['update:modelValue', 'tableSearch']);
  const treeData = ref([]);
  const { name: label, key: fieldKey, modelKey } = props.widget;

  const rdoApis = postModelDataQueryRefData;

  onMounted(() => {
    if (value.value) getAsyncOptions();
  });

  async function getAsyncOptions({ pageSize = 99, keyword } = {}) {
    const { data = [] } =
      (await rdoApis(
        {
          fieldKey,
          modelKey,
          pageSize,
          keyword,
        },
        props.configByHeaders,
      )) || {};
    treeData.value =
      data?.map((i) => {
        const rdoLabel = i.__LABEL__ || i.name_;
        return {
          name: rdoLabel,
          label: rdoLabel,
          value: i.id_,
          title: rdoLabel,
          _info: i.__CHILDREN__?.find((k) => k.default_),
          children: i.__CHILDREN__?.map((j) => {
            const versionName = j.__LABEL__ || j.version_;
            return {
              label: rdoLabel + ':' + versionName,
              versionName,
              value: j.id_,
              title: () =>
                h('div', [
                  h('span', { class: 'version' }, versionName),
                  j.default_ ? h('span', { class: 'version gct-custom-tag ml8px' }, $t('sys.default')) : null,
                ]),
              name: rdoLabel,
              default_: j.default_,
              _info: { ...j },
            };
          }),
        };
      }) || [];
  }

  function dropdownVisibleChange(v) {
    v && getAsyncOptions({ pageSize: 9999 });
  }

  const separatorAttr = toRef(() => {
    let attr: TreeSelectProps = {
      placeholder: $t('sys.chooseText'),
      allowClear: true,
    };
    return attr;
  });
  const value = computed<any>({
    get() {
      let value = props.modelValue || [];
      return value;
    },
    set(value: string[]) {
      if (value?.length) {
        emit('update:modelValue', value);
      } else {
        emit('update:modelValue', null);
      }
    },
  });
  async function changeSelect(v, node) {
    const cachemap = value.value.map((i) => i);
    const id = node._info.id_;
    await nextTick();
    if (node.children) {
      value.value = !cachemap.includes(id) ? [...cachemap, id] : [...cachemap];
    }
  }
  const tagValue = toRef<string>(() => {
    const rdo = toRaw(findTreeDataById(value.value, treeData.value));
    if (rdo?.versionName) {
      return rdo ? rdo.label + '：' + rdo.versionName : '';
    } else if (rdo?.label) {
      return rdo.label;
    } else {
      return '';
    }
  });
  /**
   * 递归查找获取选中树结构中的值
   */
  function findTreeDataById(leafValue: string, nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (leafValue === nodes[i].value) {
        return nodes[i];
      }
      if (nodes[i].children) {
        let findResult = findTreeDataById(leafValue, nodes[i].children);
        if (findResult) {
          return findResult;
        }
      }
    }
  }
  function handleSearch(keyword?: string) {
    debonceSearch(keyword);
  }
  const debonceSearch = debounce((keyword) => {
    if (keyword && keyword.trim()) {
      getAsyncOptions({ keyword });
    }
    if (!keyword) {
      /**清空输入选项的时候重置输入框 */
      getAsyncOptions();
    }
  }, 200);
</script>
<style lang="less" scoped>
  :deep(.ant-select-selection-item) {
    .version {
      display: none;
    }
  }

  .ant-select-tree-title {
    .name {
      display: none;
    }
  }
</style>
<style lang="less"></style>
