<template>
  <a-select
    :class="[ns.b()]"
    v-model:value="localVal"
    size="small"
    :options="options"
    :disabled="disabled"
    :placeholder="t('sys.appDesigner.approval.enableOpinionTip')"
    allow-clear
  />
</template>

<script lang="ts" setup name="Demo">
  import { useNamespace } from '@gct/runtime';
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ButtonOpinionMode } from '@gct/flow/src/plugins/bpmn/enums';

  const { t } = useI18n() as any;

  const ns = useNamespace('opinion-select');

  const props = withDefaults(
    defineProps<{
      value?: ButtonOpinionMode;
      disabled?: boolean;
    }>(),
    {
      value: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: ButtonOpinionMode | undefined): void;
  }>();

  const options = Object.values(ButtonOpinionMode).map((item) => {
    return {
      label: t(`sys.appDesigner.approval.opinionMode.${item}`),
      value: item,
    };
  });

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
  $opinion-select: ();

  @include b(opinion-select) {
    @include set-component-css-var(opinion-select, $opinion-select);
    width: 100%;
    font-size: getCssVar(op-editor, font-size);

    :deep(.ant-select-arrow) {
      color: #8f8f8f;
    }
  }
</style>
