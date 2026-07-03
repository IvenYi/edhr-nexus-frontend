<template>
  <a-form-item
    :label="t('sys.model.childModelKey')"
    name="subModelKey"
    :rules="[
      { required: true },
      { validator: validateSpecialCharacters },
      { validator: fieldKeyValidator, trigger: 'blur' },
    ]"
  >
    <a-input
      v-model:value="formData.subModelKey"
      :addon-before="keyPrefix"
      :disabled="isEdit"
      show-count
      :maxlength="63 - keyPrefix.length - keySuffix.length"
      :placeholder="t('sys.inputText')"
    />
  </a-form-item>
</template>

<script setup lang="ts" name="warehouse_in_out">
  import { PropType, reactive, computed, watch } from 'vue';
  import { FieldFormState } from '../../../types/entity';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { useUUid } from '@/hooks/web/useUUid';

  const { t } = useI18n();

  const { keyPrefix, keySuffix } = useKeyParser('fm');

  const emit = defineEmits(['update:formState']);
  const { formState, isEdit, keyList } = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
    isEdit: { type: Boolean, default: false },
    keyList: { type: Array, default: [] },
  });

  const { getUuid } = useUUid([], '', { chars: 'lowercase&number' });
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

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-z0-9_]+$/;
    if (!reg.test(value)) {
      callback(t('sys.model.fieldKeyFormat'));
    }
    callback();
  };

  const fieldKeyValidator = () => {
    if (!isEdit.value && keyList.includes(formData.subModelKey)) {
      return Promise.reject(
        t('sys.pageDesigner.fieldRepeatTip', {
          sth: t('sys.model.childModelKey'),
        }),
      );
    }
    return Promise.resolve();
  };

  defineExpose({
    initData,
  });
</script>

<style lang="less" scoped></style>
