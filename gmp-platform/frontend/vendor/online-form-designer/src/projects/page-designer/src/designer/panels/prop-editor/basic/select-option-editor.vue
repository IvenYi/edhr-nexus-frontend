<template>
  <a-select
    :allow-clear="clearable === false ? false : true"
    v-model:value="propValue.customMenuFilter"
    :placeholder="t(placeholder ?? 'sys.chooseText')"
    mode="multiple"
    v-bind="selectAttr"
    show-arrow
    :show-search="showSearch"
    :maxTagCount="5"
    :maxTagTextLength="6"
    @dropdownVisibleChange="changeOptions"
    size="small"
    dropdownClassName="panel-select-editor"
    @change="selectChange"
  >
    <a-select-option
      v-for="(opt, index) in options"
      :value="opt.value"
      :key="index"
      :label="t(opt.label)"
    >
      <span class="label">{{ t(opt.label) }}</span>
    </a-select-option>
  </a-select>
</template>
<script setup lang="ts" name="select-option-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, ref, inject } from 'vue';

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { options: propOptions, clearable, showSearch, placeholder } = defProps.propConfig || {};
  const { propValue } = usePropEditor(
    defProps.propName,
    defProps.changeCallback,
    defProps.propConfig.supportGlobData ? globFieldInfo : {},
  );

  const options = ref<{ label: string; value: string | number | boolean }[]>([]);

  const selectAttr = computed(() => {
    if (showSearch) {
      return {
        showSearch: showSearch,
        filterOption: (input: string, option: any) => {
          return option.langLabel.indexOf(input.toLowerCase()) >= 0;
        },
      };
    }
    return {};
  });

  async function changeOptions() {
    if (typeof propOptions === 'function') {
      options.value = await propOptions(defProps.widget);
    } else {
      options.value = propOptions || [];
    }
  }
  changeOptions();
  function selectChange(value, option) {
    console.log('value, option', value, option);
    propValue.value = {
      customMenuFilter: value,
      customMenuOptions: option,
    };
  }
</script>

<style lang="scss">
  .panel-select-editor {
    .ant-select-item-option-content {
      display: flex;
      justify-content: space-between;
    }
  }
</style>
