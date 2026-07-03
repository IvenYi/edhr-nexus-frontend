<template>
  <field-unique-key
    v-if="!isDataModel && !hideUniqueKey"
    :is-tree-model="boolSupportTree"
    :is-disabled="isEdit"
    v-model:type="formData.uniqueConstraint.type"
    v-model:fieldKeys="formData.uniqueConstraint.fieldKeys"
  />
  <field-display-rule
    :source="formData.bindInfo"
    v-model:value="formData.specificConfig.displayRule"
  />
</template>

<script setup lang="ts" name="business_ref">
  import { PropType, reactive, watch, inject } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import FieldUniqueKey from '../components/field-unique-key.vue';
  import FieldDisplayRule from '../components/field-display-rule.vue';

  const TYPE_MAP = {
    [FIELD_TYPE.ROUTING_OPERATION]: {
      bindInfo: 'em_routing_operation',
      exprInEditor: '工序名称',
    },
    [FIELD_TYPE.NOT_GOOD_REASON]: {
      bindInfo: 'em_not_good_reason',
      exprInEditor: '不良原因名称',
    },
    [FIELD_TYPE.NOT_GOOD_GROUP]: {
      bindInfo: 'em_not_good_group',
      exprInEditor: '不良分类名称',
    },
    [FIELD_TYPE.SCRAP_REASON]: {
      bindInfo: 'em_scrap_reason',
      exprInEditor: '名称',
    },
    [FIELD_TYPE.SCRAP_GROUP]: {
      bindInfo: 'em_scrap_group',
      exprInEditor: '名称',
    },
    [FIELD_TYPE.PRODUCT]: {
      bindInfo: 'em_product',
      exprInEditor: '物料名称',
    },
    [FIELD_TYPE.SCRAP_MATERIAL]: {
      bindInfo: 'em_product',
      exprInEditor: '物料名称',
    },
    [FIELD_TYPE.DEVICE_REF]: {
      bindInfo: 'em_device',
      exprInEditor: '设备名称',
    },
    [FIELD_TYPE.DEVICE_REF_MULTI]: {
      bindInfo: 'em_device',
      exprInEditor: '设备名称',
    },
    [FIELD_TYPE.DEVICE]: {
      bindInfo: 'em_device',
      exprInEditor: '设备名称',
    },
  };

  const COMMON_CONFIG = {
    specificConfig: {
      displayRule: {
        exp: 'name_',
        relationColumns: ['name_'],
      },
    },
  };

  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
    isEdit: { type: Boolean, default: false },
    boolSupportTree: { type: Boolean, default: false },
    isMultiple: { type: Boolean, default: true },
    isDataModel: { type: Boolean, default: false },
    hideUniqueKey: { type: Boolean, default: false },
    fieldType: { type: String },
  });

  const emit = defineEmits(['update:formState']);

  const formData = reactive<FieldFormState>(props.formState);

  const initData = () => {
    const config = TYPE_MAP[props.fieldType!];
    return {
      bindInfo: config.bindInfo,
      specificConfig: {
        displayRule: {
          ...COMMON_CONFIG.specificConfig.displayRule,
          exprInEditor: config.exprInEditor,
        },
      },
    };
  };

  watch(
    () => formData,
    (val) => {
      emit('update:formState', val);
    },
    { deep: true },
  );

  defineExpose({
    initData,
  });
</script>

<style lang="less" scoped></style>
