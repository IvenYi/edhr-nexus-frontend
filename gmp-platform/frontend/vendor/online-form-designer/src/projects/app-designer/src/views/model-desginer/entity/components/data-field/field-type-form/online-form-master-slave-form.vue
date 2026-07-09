<template>
  <a-form-item
    :label="`${t('sys.model.childModelName')}KEY`"
    name="subModelKey"
    :rules="[
      { required: true },
      { pattern: /^[a-z0-9_]+$/, message: t('sys.model.modelKeyFormat') },
    ]"
  >
    <a-input
      v-model:value="formData.subModelKey"
      :addon-before="keyPrefix"
      :disabled="isEdit"
      show-count
      :maxlength="64 - keyPrefix.length - keySuffix.length"
      :placeholder="t('sys.inputText')"
    />
  </a-form-item>
  <a-form-item
    :label="t('sys.model.childModelType')"
    name="refModelType"
    :rules="[{ required: true, message: `${t('sys.chooseText')}${t('sys.model.childModelType')}` }]"
  >
    <a-select
      v-model:value="formData.refModelType"
      :disabled="isEdit"
      :placeholder="t('sys.chooseText')"
    >
      <a-select-option :value="onlineFormMasterModelTypeEnum.BASE">{{ t('sys.model.BASE') }}</a-select-option>
      <a-select-option :value="onlineFormMasterModelTypeEnum.DYNAMIC_FORM">{{ t('sys.model.DYNAMIC_FORM') }}</a-select-option>
      <a-select-option v-if="suiteKey == 'eDHR'" :value="onlineFormMasterModelTypeEnum.MATERIAL_CONSUME">{{
        t('sys.model.MATERIAL_CONSUME')
      }}</a-select-option>
      <a-select-option v-if="suiteKey == 'eDHR'" :value="onlineFormMasterModelTypeEnum.MATERIAL_BALANCE">{{
        t('sys.model.MATERIAL_BALANCE')
      }}</a-select-option>
      <a-select-option v-if="suiteKey == 'eDHR'" :value="onlineFormMasterModelTypeEnum.INSPECTION">{{
        t('sys.model.INSPECTION')
      }}</a-select-option>
    </a-select>
  </a-form-item>
</template>

<script setup lang="ts" name="of_master_slave">
  import { PropType, reactive, ref, watch } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { useUUid } from '@/hooks/web/useUUid';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { onlineFormMasterModelTypeEnum } from '@gct/runtime';

  const { appInfo } = useAppInfoStore();
  const suiteKey = appInfo.suiteKey;

  const { t } = useI18n();
  const { keyPrefix, keySuffix } = useKeyParser('fm', '');
  const { getUuid } = useUUid([], '', { chars: 'lowercase&number' });

  const emit = defineEmits(['update:formState']);
  const { formState, isEdit } = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
    isEdit: { type: Boolean, default: false },
  });
  const formData = reactive<FieldFormState>(formState);

  const initData = () => {
    return {
      subModelKey: getUuid(),
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
