<template>
  <a-cascader
    @mousedown="(e) => e.preventDefault()"
    :placeholder="$t('sys.chooseText')"
    :options="filterOptions"
    :load-data="loadData"
    expandTrigger="hover"
    class="gct-field-cascader-selector"
    :dropdownClassName="`gct-field-cascader ${props.expandToLeft ? 'cascader-expand-to-left' : ''}`"
    :open="visibleValue"
    @dropdownVisibleChange="dropdownVisibleChange"
    :allowClear="allowClear"
    :displayRender="displayRender"
    :value="fieldValues"
    @change="change"
    :placement="props.expandToLeft ? 'topRight' : undefined"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted, h, computed } from 'vue';
  import { comProps, useFieldCascader, Option } from './hooks';

  const emit = defineEmits(['FieldClick', 'labelChange']);
  const props = defineProps(comProps);
  const { visibleValue, getChildrenOptionsByKey, filterOptions, fieldValues, fieldMapByKey } =
    useFieldCascader(props, {
      onFieldClick,
    });

  // const value = ref(['if_refroot_yrle', 'if_tttt1_yrle']);
  const lastSelectedIds = ref();

  const loadData = async (selectedOptions) => {
    //防止重复展开
    if (selectedOptions.map((i) => i.value).join(',') === lastSelectedIds.value) return;
    lastSelectedIds.value = selectedOptions
      .slice(0, -1)
      .map((item) => item.value)
      .join(',');
    const targetOption = selectedOptions.at(-1);
    if (!targetOption.isExpandField) return;
    await getChildrenOptionsByKey(targetOption.__props, selectedOptions.length + 1);
  };
  function dropdownVisibleChange(v) {
    visibleValue.value = v;
  }
  function onFieldClick(row: Option, level: number) {
    const value = row?.__bindFields?.join(props.valueSeparator);
    emit('FieldClick', value, row);
    visibleValue.value = false;
  }
  function displayRender({ labels, selectedOptions }) {
    const levelCount = selectedOptions.length;
    let title = selectedOptions
      .filter((i) => i)
      .map((i, index) => {
        const isLastLevel = index === levelCount - 1;
        return isLastLevel ? i.title : i.titleWithRelation;
      })
      .join('.');
    if (!title && labels.length > 0) {
      /**过滤的时候会导致这边查不到 */
      title = labels.map((k) => fieldMapByKey[k]?.name || '').join('.');
    }
    emit('labelChange', title);
    return h(
      'div',
      {
        class: 'ell',
        title,
        onClick: (e) => {
          e.stopPropagation();
          e.preventDefault();
        },
      },
      title,
    );
  }
  function change(v) {
    if (v === undefined) {
      /**清空逻辑 */
      emit('FieldClick', v, {});
    }
  }
  onMounted(() => {});
</script>
<style lang="less">
  .gct-field-cascader {
    padding: 0;

    .ant-cascader-menu {
      min-width: 180px;
      max-width: 280px;
      height: 280px;
      margin: 0;
      padding: 0;
    }

    .ant-cascader-menu-item-disabled {
      color: #8b8b8b;
      cursor: default;
    }

    .ant-cascader-menu-item {
      padding: 0;
      color: #1a1d23;

      &[aria-checked='true'] {
        .gct-option-label {
          background-color: color-mix(in srgb, var(--ant-primary-color) 8%, transparent);
          color: var(--ant-primary-color);
        }
      }

      &:hover {
        background-color: #fff;
        font-weight: normal;
      }

      .ant-cascader-menu-item-content {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ant-cascader-menu-item-expand-icon {
        display: none;
      }

      .ant-cascader-menu-item-loading-icon {
        display: none;
      }

      .gct-option-label {
        box-sizing: border-box;
        margin: 0 5px;
        padding: 6px;
        border-radius: 4px;

        .iconfont {
          color: #5a5f6b;
          font-size: 14px;
        }
      }

      .gct-option-title {
        box-sizing: border-box;
        margin: 0 5px;
        padding: 6px;
        color: #8b8b8b;
      }
    }

    .ant-cascader-menu-item-active {
      background-color: #fff;
      font-weight: normal;

      .gct-option-label {
        background-color: #f2f5f8;

        .iconfont {
          color: var(--ant-primary-color);
        }
      }
    }
  }

  .cascader-expand-to-left {
    .ant-cascader-menus {
      flex-direction: row-reverse;

      .ant-cascader-menu {
        width: 230px;
      }
    }
  }
</style>
