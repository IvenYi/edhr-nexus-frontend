<template>
  <a-button type="primary" ghost @click="handleClick" class="add-rule-btn">
    {{ $t('sys.onlineForm.addBarcodeParsing') }}
  </a-button>
</template>

<script lang="ts" setup name="add-rule-btn">
  import { useFormModel } from '@gct/nocode-base';
  import ParseRuleModal from './parse-rule-modal.vue';
  import { ParseRuleProps } from '/@online-form/views/designer/types/cell-widget';

  const formModelController = useFormModel().injectController();

  const props = withDefaults(
    defineProps<{
      subModelKey?: string;
      modelValue?: ParseRuleProps;
    }>(),
    {
      modelValue: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value?: ParseRuleProps): void;
  }>();

  const handleClick = async () => {
    const res = await gct.openUtil.modal<{
      ok: boolean;
      data?: ParseRuleProps;
    }>(ParseRuleModal, {
      config: props.modelValue,
      subModelKey: props.subModelKey,
      formModelController: formModelController,
    });
    if (res.ok) {
      emit('update:modelValue', res.data);
    }
  };
</script>

<style lang="less" scoped>
  .add-rule-btn {
    width: 100%;
  }
</style>
