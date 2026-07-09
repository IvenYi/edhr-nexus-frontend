<template>
  <gctFieldTreeSelect
    :fieldMap="fieldMap"
    :groupOptions="propValue"
    :getLabelByFun="getLabelByFun"
    :setLabelByFun="setLabelByFun"
    :getFieldTypeByFun="getFieldTypeByFun"
  />
</template>

<script setup lang="ts" name="field-level-editor">
  import { watch, computed } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { gctFieldTreeSelect } from '@gct/runtime-web';
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const fieldOptions = computed(() => defProps.widget?.children[1]?.children);
  const fieldMap = computed(() => {
    return fieldOptions.value.reduce((pre, curr) => {
      pre[curr.id] = curr;
      return pre;
    }, {});
  });
  watch(
    () => fieldOptions.value.length,
    (length, old) => {
      if (!propValue?.value?.length) {
        propValue.value = fieldOptions.value.map((i) => ({ key: i.id }));
      }
    },
    {
      immediate: true,
    },
  );
  watch(
    () => Object.keys(fieldMap.value),
    (newVal, oldVal) => {
      // console.log('fieldMap变化', newVal, oldVal);
      if (oldVal.length > newVal.length) {
        /**删除数据 */
        loopTree(propValue.value, (item, index, children) => {
          children.splice(index, 1);
        });
      } else {
        /**新增数据 */
        const oldSet = new Set(oldVal);
        const addKeys = newVal.filter((k) => !oldSet.has(k));
        addKeys.forEach((key) => {
          propValue.value = [...propValue.value, { key }];
        });
      }
    },
  );

  function setLabelByFun(key, title) {
    fieldMap.value[key].alias = title;
    fieldMap.value[key].props.label = title;
  }
  function getLabelByFun(widget) {
    return widget.alias || widget.props.fieldName;
  }
  function getFieldTypeByFun(widget) {
    return widget.props.fieldType;
  }
  /**递归匹配 */
  function loopTree(data: any[], callback: any) {
    const length = data.length;
    for (let i = 0; i < length; i++) {
      const item = data[i];
      if (!item.isGroup && !fieldMap.value[item.key]) {
        callback(item, i, data);
        break;
      }
      if (item.children) {
        loopTree(item.children, callback);
      }
    }
  }
</script>

<style lang="less" scoped></style>
