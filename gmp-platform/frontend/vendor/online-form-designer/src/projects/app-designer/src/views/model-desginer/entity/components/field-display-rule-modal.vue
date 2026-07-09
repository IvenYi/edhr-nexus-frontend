<template>
  <basic-modal
    @register="registerInner"
    :title="t('sys.model.displayRuleConf')"
    center
    width="640px"
    :maskClosable="false"
    @ok="handleOk"
  >
    <field-display-rule
      :source="formState.bindInfo"
      :rules="false"
      :fieldType="fieldType"
      v-model:value="formState.displayRule"
    />
  </basic-modal>
</template>
<script setup lang="ts" name="field-display-rule-modal">
  import { reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import FieldDisplayRule from '../components/data-field/components/field-display-rule.vue';
  import { useI18n } from 'vue-i18n';
  import { FIELD_TYPE } from '@/enums/appEnum';

  const emit = defineEmits(['ok']);
  const { t } = useI18n();
  const formState = reactive({
    bindInfo: '',
    displayRule: {},
  });

  const props = defineProps<{
    fieldType?: FIELD_TYPE;
  }>();
  
  const [registerInner, { closeModal }] = useModalInner((data) => {
    Object.assign(formState, data);
  });

  const handleOk = async () => {
    closeModal();
    emit('ok', formState);
  };
</script>
<style lang="scss" scoped></style>
