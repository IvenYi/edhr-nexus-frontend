<template>
  <a-tree-select
    v-model:value="value"
    :show-search="showSearch"
    style="width: 100%"
    :tree-checkable="treeCheckable"
    :multiple="multiple"
    :placeholder="placeholder || t('sys.chooseText')"
    :allow-clear="clearable"
    :tree-default-expand-all="defaultExpandAll"
    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
    :tree-data="options"
    tree-node-filter-prop="label"
    dropdown-class-name="gct-custom-select-dropdown"
    size="small"
    @dropdownVisibleChange="changeOptions"
  >
    <template #title="item">
      <div
        class="gct-text-overflow"
        v-if="value && !Object.prototype.hasOwnProperty.call(item, 'selected')"
      >
        {{ item.dftPrintInfo?.label || item.label }}
      </div>
      <a-row v-else>
        <a-col :span="showTag(item) ? 18 : 24" class="gct-text-overflow" :title="item.label">
          {{ item.label }}
        </a-col>
        <a-col :span="showTag(item) ? 6 : 0">
          <a-tag color="processing">{{ t(tagName || '') }}</a-tag>
        </a-col>
      </a-row>
    </template>
  </a-tree-select>
</template>
<script setup lang="ts" name="printer-select-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, ref, inject } from 'vue';
  import type { TreeSelectProps } from 'ant-design-vue';

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const { t } = useI18n();
  const defProps = defineProps(props);
  const {
    options: propOptions,
    clearable,
    valueType,
    showSearch,
    multiple,
    placeholder,
    defaultExpandAll,
    treeCheckable,
    tagName,
    showTagFunc,
  } = defProps.propConfig || {};
  const { propValue } = usePropEditor(
    defProps.propName,
    defProps.changeCallback,
    defProps.propConfig.supportGlobData ? globFieldInfo : {},
  );

  const options = ref<TreeSelectProps['treeData']>([]);
  const value = computed({
    get() {
      if (defProps.widget?.props.multiple) {
        return propValue.value
          ? Array.isArray(propValue.value)
            ? propValue.value
            : propValue.value.split(',')
          : undefined;
      }
      if (typeof propValue.value === 'boolean') {
        return propValue.value;
      }
      return propValue.value || undefined;
    },
    set(val) {
      if (valueType === 'string' && defProps.widget?.props.multiple) {
        propValue.value = val?.join(',');
      } else {
        propValue.value = val;
      }
    },
  });

  // 是否显示title中的tag
  const showTag = (item) => {
    if (showTagFunc && typeof showTagFunc === 'boolean') return showTagFunc;
    else if (showTagFunc && typeof showTagFunc === 'function') {
      return showTagFunc(item);
    } else return false;
  };

  async function changeOptions() {
    if (typeof propOptions === 'function') {
      options.value = await propOptions(defProps.widget);
    } else {
      options.value = propOptions || [];
    }
  }
  changeOptions();
</script>
<style lang="less" scoped></style>
