<template>
  <field-unique-key
    v-if="!isDataModel && !hideUniqueKey"
    :is-tree-model="boolSupportTree"
    :is-disabled="isEdit"
    v-model:type="formData.uniqueConstraint.type"
    v-model:fieldKeys="formData.uniqueConstraint.fieldKeys"
  />

  <a-form-item
    v-if="formData.type === FIELD_TYPE.ORG_MULTI"
    :name="['specificConfig', 'codeVisibleNum']"
    :label="t('sys.model.codeDisplayNumber')"
  >
    <a-input-number
      v-model:value="formData.specificConfig.codeVisibleNum"
      :min="8"
      :max="20"
      :precision="0"
      placeholder="8"
      @blur="
        () => {
          if (!formData.specificConfig.codeVisibleNum) formData.specificConfig.codeVisibleNum = 8;
        }
      "
      style="width: 50% !important"
    />
    <div class="mt-2 text-sm text-zinc-400">
      {{ t('sys.model.codeDisplayNumberTip') }}
    </div>
  </a-form-item>

  <a-form-item :label="`${t('sys.defaultValue')}`" :name="['defaultValue', 'type']" v-show="false">
    <a-input :value="formData.defaultValue.type" />
  </a-form-item>

  <a-form-item :label="`${t('sys.defaultValue')}`" :name="['defaultValue', 'value']">
    <a-select
      v-model:value="formData.defaultValue.value"
      :placeholder="t('sys.chooseText')"
      @change="onSelectChange"
      allowClear
    >
      <a-select-option :value="FieldSysVarDefaultValueEnum.NULL">{{
        t('sys.none')
      }}</a-select-option>
      <a-select-option :value="FieldSysVarDefaultValueEnum.CURRENT_ORG">{{
        t('sys.sysCurrentOrg')
      }}</a-select-option>
    </a-select>
  </a-form-item>
</template>

<script setup lang="ts" name="org_multi">
  import { PropType, reactive, watch } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import {
    FieldDefaultValueTypeEnum,
    FieldSysVarDefaultValueEnum,
  } from '@/projects/app-designer/src/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FieldUniqueKey from '../components/field-unique-key.vue';
  import { FIELD_TYPE } from '@/enums/appEnum';

  const { t } = useI18n();

  const emit = defineEmits(['update:formState']);
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
    isEdit: { type: Boolean, default: false },
    boolSupportTree: { type: Boolean, default: false },
    isDataModel: { type: Boolean, default: false },
    hideUniqueKey: { type: Boolean, default: false },
  });

  const getCodeVisibleNum = () => {
    if (props.formState.specificConfig?.codeVisibleNum) {
      return props.formState.specificConfig?.codeVisibleNum;
    }
    if (props.formState?.id) {
      return 8;
    } else {
      return 12;
    }
  };
  const formData = reactive<FieldFormState>(
    Object.assign(props.formState, {
      specificConfig: {
        ...props.formState.specificConfig,
        codeVisibleNum: getCodeVisibleNum(),
      },
    }),
  );

  const initData = () => {
    return {
      defaultValue: {
        type: FieldDefaultValueTypeEnum.NONE,
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

  const onSelectChange = (val) => {
    if (val === FieldSysVarDefaultValueEnum.CURRENT_ORG) {
      formData.defaultValue.type = FieldDefaultValueTypeEnum.SYS_VAR;
    } else {
      formData.defaultValue.type = FieldDefaultValueTypeEnum.NONE;
    }
  };

  defineExpose({
    initData,
  });
</script>

<style lang="less" scoped></style>
