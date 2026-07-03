<template>
  <a-select
    :class="[ns.b()]"
    v-model:value="localVal"
    size="small"
    :options="flowActionOpts"
    :disabled="disabled"
    :placeholder="t('sys.chooseTextTip', { name: $t('sys.appDesigner.circulationNode') })"
  />
</template>

<script lang="ts" setup name="Demo">
  import { useNamespace } from '@gct/runtime';
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ButtonFlowAction, SignatureTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';

  const { t } = useI18n() as any;

  const ns = useNamespace('flow-action-select');

  const props = withDefaults(
    defineProps<{
      value?: SignatureTypeEnum;
      disabled?: boolean;
      disabledFlowActions?: ButtonFlowAction[];
    }>(),
    {
      value: undefined,
      disabledFlowActions: () => [],
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

  const flowActionOpts = Object.values(ButtonFlowAction)
    // 临时上一个节点不支持
    .filter((k) => !props.disabledFlowActions.includes(k) && k !== ButtonFlowAction.PreviousNode)
    .map((key) => {
      return {
        label: $t(`sys.appDesigner.approval.flowAction.${key}`),
        value: key,
      };
    });
</script>

<style lang="scss" scoped>
  $flow-action-select: ();

  @include b(flow-action-select) {
    @include set-component-css-var(flow-action-select, $flow-action-select);

    width: 100%;
    font-size: getcssvar(op-editor, font-size);

    :deep(.ant-select-arrow) {
      color: #8f8f8f;
    }
  }
</style>
