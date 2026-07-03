<template>
  <field-unique-key
    v-if="!isDataModel && !hideUniqueKey"
    v-show="!isCustom"
    :is-tree-model="boolSupportTree"
    :is-disabled="isEdit"
    v-model:type="formData.uniqueConstraint.type"
    v-model:fieldKeys="formData.uniqueConstraint.fieldKeys"
  />
  <!-- <a-form-item
    :label="t('sys.model.transactionModel')"
    name="bindInfo"
    :rules="[
      {
        required: true,
      },
    ]"
  >
    <a-select
      v-model:value="formData.bindInfo"
      :disabled="isEdit"
      :placeholder="t('sys.chooseText')"
    >
      <a-select-opt-group v-for="(group, index) in modelList" :key="index">
        <template #label>
          <span>
            {{ group.name }}
          </span>
        </template>
        <a-select-option
          v-for="model in group.children"
          :key="model.key"
          :value="model.key"
          :fieldName="model.displayFieldName"
          >{{ model.name }}</a-select-option
        >
      </a-select-opt-group>
    </a-select>
  </a-form-item> -->
</template>

<script setup lang="ts" name="transaction">
  import { PropType, reactive, watch } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { FormInstance } from 'ant-design-vue';
  import FieldUniqueKey from '../components/field-unique-key.vue';

  const emit = defineEmits(['update:formState']);
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
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

<style lang="less" scoped>
  .config-icon {
    position: relative;
    top: 1px;
    line-height: 1;
  }
</style>
