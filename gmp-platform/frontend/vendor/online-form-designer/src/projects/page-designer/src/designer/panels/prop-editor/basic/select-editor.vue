<template>
  <a-select
    :allow-clear="clearable === false ? false : true"
    v-model:value="value"
    :placeholder="t(placeholder ?? 'sys.chooseText')"
    :mode="mode"
    v-bind="selectAttr"
    show-arrow
    :show-search="showSearch"
    :maxTagCount="5"
    :maxTagTextLength="6"
    @dropdownVisibleChange="changeOptions"
    size="small"
    dropdownClassName="panel-select-editor"
    class="select-editor-wrapper"
    :getPopupContainer="(element) => element.parentNode"
  >
    <a-select-option
      v-for="(opt, index) in options"
      :value="opt.value"
      :key="index"
      :langLabel="t(opt.label)"
      :disabled="maxMultiple && value.length >= maxMultiple && !value.some((e) => e === opt.value)"
    >
      <span class="label" :title="t(opt.label)">{{ t(opt.label) }}</span>
      <span v-show="opt.suffix" class="suffix">{{ t(opt.suffix!) }}</span>
    </a-select-option>
  </a-select>
  <div v-if="tips" class="tooltip">{{ t(tips) }}</div>
</template>

<script setup lang="ts" name="select-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, ref, inject, onMounted } from 'vue';

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const { t } = useI18n();
  const defProps = defineProps(props);
  const {
    options: propOptions,
    clearable,
    valueType,
    showSearch,
    maxMultiple,
    tips,
    multiple,
    placeholder,
    selectChange,
    optionsvalidate,
  } = defProps.propConfig || {};
  const mode = computed(() => {
    return defProps.widget?.props.multiple || multiple ? 'multiple' : undefined;
  });
  const { propValue } = usePropEditor(
    defProps.propName,
    defProps.changeCallback,
    defProps.propConfig.supportGlobData ? globFieldInfo : {},
  );
  const value = computed({
    get() {
      if (defProps.widget?.props.multiple) {
        return propValue.value
          ? Array.isArray(propValue.value)
            ? propValue.value
            : propValue.value.split(',')
          : undefined;
      }
      if (typeof propValue.value === 'boolean' || valueType === 'boolean') {
        return propValue.value;
      }
      return propValue.value || undefined;
    },
    set(val) {
      if (valueType === 'string' && defProps.widget?.props.multiple) {
        propValue.value = val?.join(',');
      } else {
        propValue.value = val != null ? val : '';
      }

      if (selectChange) {
        selectChange(
          defProps.widget,
          val,
          options.value.find((item) => item.value === val),
        );
      }
    },
  });
  const options = ref<{ label: string; value: string | number | boolean; suffix?: string }[]>([]);

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

  /** 后端进行选项筛选时，前段筛除没有选中的值 */
  function filterValue() {
    if (optionsvalidate && mode.value) {
      const optionsValue = options.value.map((obj) => obj.value);
      value.value = value.value ? optionsValue.filter((item) => value.value.includes(item)) : [];
    }
    if (optionsvalidate && !mode.value) {
      const optionsValue = options.value.map((obj) => obj.value);
      value.value = optionsValue.includes(value.value) ? value.value : '';
    }
  }

  onMounted(async () => {
    await changeOptions();
    await filterValue();
  });
</script>

<style lang="less" scoped>
  .label {
    display: inline-block;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 4px;
  }

  .suffix {
    display: inline-block;
    flex: 0;
  }

  .tooltip {
    color: #c3c3c3;
    font-size: 12px;
  }
</style>

<style lang="scss">
  .panel-select-editor {
    .ant-select-item-option-content {
      display: flex;
      justify-content: space-between;

      .suffix {
        color: #8f8f8f;
        font-size: 12px;
      }
    }
  }

  .select-editor-wrapper {
    .ant-select-selection-item {
      display: flex;
      justify-content: space-between;
    }

    .suffix {
      color: #8f8f8f;
      font-size: 12px;
    }
  }
</style>
