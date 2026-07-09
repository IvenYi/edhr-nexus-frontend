<template>
  <FieldTreeSelect
    v-model="value"
    :label="showFieldName"
    :disabled="showDisabled || showReadonly"
    :required="showRequired"
    :placeholder="placeholder"
    :options="newOptions"
    :multiple="multiple"
    :field="field"
    :modelKey="modelKey"
    :onChange="onChange"
    is-select
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
  </FieldTreeSelect>
</template>

<script setup lang="ts" name="online-form-department-field-render">
  import { computed } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { FIELD_TYPE } from '@gct/runtime';
  import { useNocodeFormWidget, type IDepartment } from '@gct/nocode-base';
  import { useMobileAttrs } from '../../../hooks';
  import { FieldTreeSelect, FieldTypeIcon } from '../../_common_';

  import { list_to_tree, treeToList } from '/@/utils/helper/treeHelper';

  const props = defineProps<{
    modelValue?: string;
    widget: IDepartment;
    formData: any;

    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { value, onChange } = useNocodeFormWidget(props, emit);

  const {
    field,
    modelKey,
    fieldType,
    placeholder,
    showFieldName,
    showRequired,
    showDisabled,
    showReadonly,
    options,
  } = useMobileAttrs(props.widget);

  const multiple = fieldType === FIELD_TYPE.ORG_MULTI;

  function deepOptions(trees, parentId?: string) {
    trees.forEach((i) => {
      const ch_full_path = parentId ? `${parentId}/${i.value}` : i.value;
      // 树弹窗组件需要
      i._item.full_path_ = ch_full_path;
      i.id = i._item.id;
      if (i?.children?.length) {
        deepOptions(i.children, ch_full_path);
      }
    });
  }

  const newOptions = computed(() => {
    const valueList = list_to_tree(cloneDeep(options.map((i) => i._item)), (node) => {
      return {
        _item: node,
        pId: node.parentId,
        label: node.name,
        value: node.id,
        children: node.children,
      };
    });

    deepOptions(valueList);
    return treeToList(valueList, { children: 'children' });
  });
</script>
