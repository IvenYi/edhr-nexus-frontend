<template>
  <gctFieldSortPopover
    :fieldMap="fieldMap"
    :groupOptions="groupOptions"
    :getLabelByFun="getLabelByFun"
    :getFieldTypeByFun="getFieldTypeByFun"
    @change="changeSort"
  >
    <div class="row-total inline-block highlight">
      <span class="iconfont icon-a-xitongguanli1 mr6px"></span>
      显示字段
    </div>
  </gctFieldSortPopover>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { ReportTable, BaseField, ReportEnum, dimensionEnum } from '../../../schema/index';
  import { gctFieldSortPopover } from '../../../../gct-field-tree-select';
  import { useStorage } from '@vueuse/core';
  import { useUserStoreWithOut } from '/@/store/modules/user';

  const props = defineProps<{
    reportSchema: ReportTable;
  }>();
  const emit = defineEmits(['reloadColumn']);
  const userStore = useUserStoreWithOut();
  const tableKey = `report_field_sort_${userStore.userInfo.userId}`;
  const fieldCacheMap = useStorage(tableKey, {});
  const {
    _key,
    dataColumn = [],
    fieldMap,
    multiLevelHeader,
    headerGrouping = [],
    reportType,
    rowDimension,
    columnDimension,
  } = props.reportSchema!;

  const tableField = computed(() => {
    if (reportType === ReportEnum.CROSS_TABLE) {
      return [
        {
          isGroup: true,
          title: '行（维度）',
          children: rowDimension.map((key) => ({ key })),
          key: Math.random(),
          noDrag: true,
        },
        {
          isGroup: true,
          title: '列（维度）',
          children: columnDimension.map((key) => ({ key })),
          key: Math.random(),
          noDrag: true,
        },
      ].filter((i) => i.children.length > 0);
    }
    if (multiLevelHeader) return headerGrouping;
    return dataColumn.map((key) => ({ key }));
  });
  /**缓存的字段 */
  const cacheOptions = computed(() => {
    if (
      fieldCacheMap.value[_key] &&
      fieldCacheMap.value[_key].multiLevelHeader === multiLevelHeader
    ) {
      const cacheFields = dfsNonRecursive(fieldCacheMap.value[_key].options);
      Object.values(fieldMap).forEach((i) => {
        if (reportType === ReportEnum.CROSS_TABLE) {
          if (i.inDimension === dimensionEnum.ROW) {
            i.__addField || cacheFields[0].children.push({ key: i.id });
          }
          if (i.inDimension === dimensionEnum.COLUMN) {
            i.__addField || cacheFields[0].children.push({ key: i.id });
          }
        } else {
          i.__addField || cacheFields.push({ key: i.id });
        }
      });
      return cacheFields;
    } else return null;
  });
  const groupOptions = computed(() => {
    return cacheOptions.value || tableField.value;
  });
  function getLabelByFun(field: BaseField) {
    return field.alias || field.fieldName;
  }
  function getFieldTypeByFun(field: BaseField) {
    return field.fieldType;
  }
  function changeSort(options) {
    fieldCacheMap.value[_key] = {
      multiLevelHeader,
      options,
    };
    emit('reloadColumn', options);
  }
  onMounted(() => {
    cacheOptions.value && emit('reloadColumn', cacheOptions.value, true);
  });

  /**隐藏已经被删除的字段 */
  function dfsNonRecursive(root: any[]) {
    if (!root) return [];
    return root
      .map((i) => {
        if (i.children) {
          i.children = dfsNonRecursive(i.children);
        }
        return i;
      })
      .filter((c) => {
        if (!c) return false;
        if (c?.children) return true;
        const fieldItem = fieldMap[c.key];
        if (fieldItem) {
          fieldItem.__addField = true;
        }
        return fieldItem;
      });
  }
</script>
<style scoped lang="less"></style>
