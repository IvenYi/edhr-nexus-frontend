<template>
  <field-unique-key
    v-if="!isDataModel && !hideUniqueKey"
    v-show="!isCustom"
    :is-tree-model="boolSupportTree"
    :is-disabled="isEdit"
    v-model:type="formData.uniqueConstraint.type"
    v-model:fieldKeys="formData.uniqueConstraint.fieldKeys"
  />
</template>

<script setup lang="ts" name="range_user">
  import { PropType, reactive, watch } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import FieldUniqueKey from '../components/field-unique-key.vue';
  import { FormInstance } from 'ant-design-vue';

  const emit = defineEmits(['update:formState']);
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: () => {} },
    isEdit: { type: Boolean, default: false },
    boolSupportTree: { type: Boolean, default: false },
    formRef: { type: Object as PropType<FormInstance>, default: null },
    // 是否是自定义字段，设计器-表单中使用
    isCustom: { type: Boolean, default: false },
    isDataModel: { type: Boolean, default: false },
    hideUniqueKey: { type: Boolean, default: false },
  });

  const formData = reactive<FieldFormState>(props.formState);

  watch(
    () => formData,
    (val) => {
      emit('update:formState', reactive(val));
    },
    { deep: true },
  );
</script>

<style lang="less" scoped></style>
