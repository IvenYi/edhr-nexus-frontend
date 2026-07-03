<template>
  <a-select
    :class="[ns.b()]"
    v-model:value="localVal"
    size="small"
    :options="opSignModeOpts"
    :disabled="disabled"
    :placeholder="t('sys.chooseTextTip', { name: t('sys.appDesigner.approval.signType') })"
  />
</template>

<script lang="ts" setup name="Demo">
  import { useNamespace } from '@gct/runtime';
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SignatureTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';

  const opSignModeOpts = [
    // {
    //   label: $t(`sys.appDesigner.approval.signatureType.Handwritten`),
    //   value: SignatureTypeEnum.Handwritten,
    // },
    {
      label: $t(`sys.appDesigner.approval.signatureType.Account`),
      value: SignatureTypeEnum.Account,
    },
    // {
    //   label: $t(`sys.appDesigner.approval.signatureType.Any`),
    //   value: SignatureTypeEnum.Any,
    // },
    {
      label: $t(`sys.appDesigner.approval.signatureType.None`),
      value: SignatureTypeEnum.None,
    },
  ];

  const { t } = useI18n() as any;

  const ns = useNamespace('sign-type-select');

  const props = withDefaults(
    defineProps<{
      value?: SignatureTypeEnum;
      disabled?: boolean;
    }>(),
    {
      value: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: SignatureTypeEnum | undefined): void;
  }>();

  const localVal = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });
</script>

<style lang="scss" scoped>
  $sign-type-select: ();

  @include b(sign-type-select) {
    @include set-component-css-var(sign-type-select, $sign-type-select);
    width: 100%;
    font-size: getCssVar(op-editor, font-size);

    :deep(.ant-select-arrow) {
      color: #8f8f8f;
    }
  }
</style>
