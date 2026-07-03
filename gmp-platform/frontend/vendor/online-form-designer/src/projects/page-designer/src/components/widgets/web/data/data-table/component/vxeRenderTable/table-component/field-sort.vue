<template>
  <gctFieldSortPopover
    :groupOptions="groupOptions"
    :getLabelByFun="getLabelByFun"
    :getFieldTypeByFun="getFieldTypeByFun"
    @change="changeSort"
    :fieldMap="fieldMap"
    :getFieldHiddenByFun="getFieldHiddenByFun"
    :changeFieldHiddenByFun="changeFieldHiddenByFun"
  >
    <slot></slot>
  </gctFieldSortPopover>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { useStorage } from '@vueuse/core';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { gctFieldSortPopover } from '@gct/runtime-web';

  const props = defineProps<{
    columns: FieldSchema[];
    cacheKey: string;
    headerGrouping: object[];
    multiLevelHeader: boolean;
  }>();
  const emit = defineEmits(['reloadColumn', 'reloadGroup']);
  const userStore = useUserStoreWithOut();
  const { columns = [], cacheKey, multiLevelHeader, headerGrouping = [] } = props!;
  const fieldMap = columns.reduce((acc, field) => {
    acc[field.id] = field;
    return acc;
  }, {} as Record<string, FieldSchema>);
  const tableKey = `table_field_sort_${userStore.userInfo.userId}`;
  const fieldCacheMap = useStorage(tableKey, {});
  const tableField = computed(() => {
    if (multiLevelHeader) return headerGrouping;
    return columns.map((row) => ({ key: row.id }));
  });

  /**缓存的字段 */
  const cacheOptions = computed(() => {
    if (
      fieldCacheMap.value[cacheKey] &&
      fieldCacheMap.value[cacheKey].multiLevelHeader === multiLevelHeader
    ) {
      const cacheFields = dfsNonRecursive(fieldCacheMap.value[cacheKey].options);
      /**添加后面新增的字段 */
      Object.values(fieldMap).forEach((i) => {
        i.__addField || cacheFields.push({ key: i.id });
      });
      return cacheFields;
    } else return null;
  });
  const groupOptions = computed(() => {
    return cacheOptions.value || tableField.value;
  });
  function getLabelByFun(field: FieldSchema) {
    return field.alias || field.props.label;
  }
  function getFieldTypeByFun(field: FieldSchema) {
    return field.props.fieldType;
  }
  function changeFieldHiddenByFun(field: FieldSchema, v) {
    field.props.hidden = !v;
  }
  function getFieldHiddenByFun(field: FieldSchema) {
    return !field.props.hidden;
  }
  function changeSort(options) {
    fieldCacheMap.value[cacheKey] = {
      multiLevelHeader,
      options,
    };
    updateCacheOptions(options);
  }

  /**更新表头 */
  function updateCacheOptions(options) {
    if (multiLevelHeader) {
      emit('reloadGroup', options);
    } else {
      const newOptions = options
        .map((i) => {
          return fieldMap[i.key];
        })
        .filter((i) => i);
      emit('reloadColumn', newOptions);
    }
  }
  onMounted(() => {
    cacheOptions.value && updateCacheOptions(cacheOptions.value);
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
