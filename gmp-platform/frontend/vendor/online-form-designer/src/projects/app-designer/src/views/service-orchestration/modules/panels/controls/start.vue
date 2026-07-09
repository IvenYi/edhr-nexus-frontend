<template>
  <a-form-item :label="t('参数配置')" name="parameter">
    <a-radio-group v-model:value="formState.parameter" name="parameter">
      <a-radio :value="false">无参数</a-radio>
      <a-radio :value="true">参数</a-radio>
    </a-radio-group>
  </a-form-item>

  <a-button v-show="formState.parameter" type="primary" block @click="handleParameterConfig"
    >点击配置参数</a-button
  >
  <parameter-struct-modal @register="register" />
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import ParameterStructModal from '../../modals/parameter-struct-modal.vue';

  const { t } = useI18n();
  const [register, { openModal }] = useModal();

  const props = defineProps({
    formState: {
      type: Object,
      default: () => ({}),
    },
  });

  const formState = computed({
    get() {
      return props.formState;
    },
    set(value) {
      Object.assign(props.formState, value);
    },
  });

  const handleParameterConfig = () => {
    openModal(true, props.formState.parameterStruct);
  };
</script>

<style lang="less" scoped></style>
