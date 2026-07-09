<template>
  <a-tree-select
    v-model:value="value"
    :show-search="showSearch"
    style="width: 100%"
    :tree-checkable="treeCheckable"
    :multiple="mode"
    :placeholder="placeholder || t('sys.chooseText')"
    :allow-clear="clearable"
    :tree-default-expand-all="defaultExpandAll"
    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
    :tree-data="options"
    tree-node-filter-prop="label"
    dropdown-class-name="gct-custom-select-dropdown"
    size="small"
    @dropdownVisibleChange="changeOptions"
    @change="selectChange"
  >
    <template #tagRender="item">
      <span
        class="ant-select-selection-item"
        :title="item?.option?.dftPrintInfo?.label || item.label || item.value"
      >
        <span class="ant-select-selection-item-content">
          {{ item?.option?.dftPrintInfo?.label || item.label || item.value }}</span
        >
        <span class="ant-select-selection-item-remove">
          <CloseOutlined @click="closetag(item)" />
        </span>
      </span>
    </template>

    <template #title="item">
      <div
        class="gct-text-overflow"
        v-if="item.label && !Object.prototype.hasOwnProperty.call(item, 'selected')"
      >
        {{ item?.dftPrintInfo?.label || item.label }}
      </div>
      <a-row v-else-if="item.label">
        <a-col :span="showTag(item) ? 18 : 24" class="gct-text-overflow" :title="item.label">
          {{ item.label }}
        </a-col>
        <a-col :span="showTag(item) ? 6 : 0">
          <a-tag color="processing">{{ t(tagName || '') }}</a-tag>
        </a-col>
      </a-row>
      <span v-else>{{ value }}</span>
    </template>
  </a-tree-select>
</template>
<script setup lang="ts" name="printer-select-option-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, ref, inject, nextTick, onBeforeMount } from 'vue';
  import type { TreeSelectProps } from 'ant-design-vue';
  import { FieldSchema } from '../../../../hooks/getFieldSchema';

  const globFieldInfo = inject<any>('globFieldInfo', {});
  const { t } = useI18n();

  const defProps = defineProps(props);
  const {
    options: propOptions,
    clearable,
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
  const mode = computed(() => {
    return defProps.widget?.props.multiple || multiple ? 'multiple' : undefined;
  });
  const isOrgin = ref(true);

  const fieldInfo = ref();

  const options = ref<TreeSelectProps['treeData']>([]);
  const value = computed({
    get() {
      if (
        propValue.value.selectOption &&
        propValue.value.selectOption.length &&
        options.value?.length
      ) {
        judgeExist(options.value);
      }
      if (propValue.value.defaultValue && propValue.value.selectOption.length && mode.value) {
        return propValue.value.selectOption.length
          ? mode.value
            ? propValue.value.selectOption.map(
                (item) => `${item.active ? item.value : item.label + '(离线)'}`,
              )
            : propValue.value.selectOption.map(
                (item) => `${item.active ? item.value : item.label + '(离线)'}`,
              )[0]
          : propValue.value.defaultValue;
      }

      if (propValue.value.defaultValue) {
        return propValue.value.defaultValue;
      }
      if (globFieldInfo.defaultValue && isOrgin.value && options.value && fieldInfo.value) {
        let flag = false;
        options.value.map((i) => {
          if (i.children && i.children.length) {
            i.children.map((e) => {
              if (e.value === globFieldInfo.defaultValue) {
                flag = true;
              }
            });
          }
        });

        return flag ? globFieldInfo.defaultValue : fieldInfo.value.defaultValueTips[0] + '(离线)';
      }

      return undefined;
    },
    set(val) {},
  });
  onBeforeMount(async () => {
    await nextTick();
    fieldInfo.value = await FieldSchema.getConfigByField(
      defProps.widget?.props.modelKey,
      defProps.widget?.props.field,
    );
  });
  const judgeExist = (options) => {
    let onlineprint = [] as any;
    const select = propValue.value.selectOption.map((item) => item.value);
    propValue.value.selectOption.map((p) => {
      p.active = 1;
    });
    options.map((i) => {
      if (i.children && i.children.length) {
        if (select.includes(i.value)) {
          onlineprint.push(i.value);
        }
        i.children.map((e) => {
          if (select.includes(e.value)) {
            onlineprint.push(e.value);
          }
        });
      }
    });
    if (!onlineprint.length) {
      propValue.value.selectOption.map((p) => {
        p.active = 0;
      });

      return;
    }

    if (onlineprint.length < select.length) {
      const filter = select.filter((i) => {
        return !onlineprint.includes(i);
      });
      propValue.value.selectOption.map((p) => {
        if (filter.includes(p.value)) {
          p.active = 0;
        }
      });
    }
  };

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

  function selectChange(value, option) {
    isOrgin.value = false;
    propValue.value = {
      defaultValue: mode.value ? getOptionSelect(value, option).map((item) => item.value) : value,
      selectOption: mode.value
        ? getOptionSelect(value, option)
        : value
          ? [
              {
                value: value,
                label: option[0],
                active: 1,
              },
            ]
          : [],
    };
  }

  function getOptionSelect(value, option) {
    // 如果没有离线打印机直接返回选项
    if (!option.includes(undefined)) {
      return value.map((item: any, index) => {
        return {
          value: item,
          label: option[index],
          active: 1,
        };
      });
    }
    // 包含离线打印机
    const existArr = propValue.value.selectOption.filter((item) => {
      return value.includes(item.value) || value.includes(item.label + '(离线)');
    });

    // 删除选项时直接返回
    if (existArr.length == value.length) {
      return existArr;
    } else {
      return [
        ...propValue.value.selectOption,
        {
          value: value[value.length - 1],
          label: option[option.length - 1],
          active: 1,
        },
      ];
    }
  }

  function closetag(i) {
    if (!propValue.value.selectOption && !propValue.value.selectOption.length) {
      value.value = [];
    }
    const idx = propValue.value.defaultValue.indexOf(i.value);
    if (idx > -1) {
      propValue.value = {
        defaultValue: propValue.value.defaultValue.filter((p, i) => i !== idx),
        selectOption: propValue.value.selectOption.filter((p, i) => i !== idx),
      };
    }
  }
</script>
<style lang="less" scoped></style>
