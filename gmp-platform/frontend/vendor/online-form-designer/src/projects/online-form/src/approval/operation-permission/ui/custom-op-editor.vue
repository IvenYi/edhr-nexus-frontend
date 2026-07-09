<template>
  <div :class="[ns.b()]">
    <div :class="[ns.b('line')]">
      <a-checkbox
        :class="[ns.e('enable')]"
        v-model:checked="local.enable"
        :disabled="bpmnReadonly"
      />
      <a-input
        :class="[ns.e('input'), 'ml-4px']"
        v-model:value="local.alias"
        size="small"
        :disabled="bpmnReadonly || !local.enable"
        :placeholder="t('sys.inputTextTip', { name: $t('sys.pageDesigner.buttonName') })"
      />
      <a-input
        :class="[ns.e('input'), 'ml-4px']"
        v-model:value="local.type"
        size="small"
        :disabled="bpmnReadonly || !local.enable"
        :placeholder="t('sys.inputTextTip', { name: $t('sys.appDesigner.approval.buttonKey') })"
      />
    </div>
    <div :class="[ns.b('line'), 'mt-2px']">
      <FlowActionSelect
        :class="[ns.e('flow-action')]"
        v-model:value="local.flowAction"
        :disabled="bpmnReadonly || !local.enable"
        :disabledFlowActions="disabledFlowActions"
      />
      <SignTypeSelect
        v-if="showOpinionConfig"
        :class="[ns.e('signature')]"
        v-model:value="local.signatureType"
        :disabled="bpmnReadonly || !local.enable"
      />
    </div>

    <div :class="[ns.b('line'), 'mt-2px']">
      <SignTypeSelect
        v-if="!showOpinionConfig"
        :class="[ns.e('signature')]"
        v-model:value="local.signatureType"
        :disabled="bpmnReadonly || !local.enable"
      />
      <OpinionSelect
        v-if="showOpinionConfig"
        :class="[ns.e('opinion')]"
        v-model:value="local.opinionMode"
        :disabled="bpmnReadonly || !local.enable"
      />
      <i
        :class="['iconfont icon-shanchu2', ns.e('remove'), ns.is('disabled', bpmnReadonly)]"
        @click="onRemove"
      ></i>
      <i
        :class="['iconfont icon-shezhi', ns.e('config'), ns.is('disabled', bpmnReadonly)]"
        @click="onConfig"
      ></i>
    </div>
  </div>
</template>

<script lang="ts" setup name="op-editor">
  import { inject, ref } from 'vue';
  import { computedEx, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { OperatePermissionConfig } from '../types';
  import { ButtonFlowAction } from '@gct/flow/src/plugins/bpmn/enums';
  import SignTypeSelect from './sign-type-select.vue';
  import OpinionSelect from './opinion-select.vue';
  import FlowActionSelect from './flow-action-select.vue';

  const bpmnReadonly = inject('bpmnReadonly', ref(false));

  const ns = useNamespace('op-editor');
  const { t } = useI18n() as any;

  const props = withDefaults(
    defineProps<{
      value?: OperatePermissionConfig;
      disabledFlowActions?: ButtonFlowAction[];
      showOpinionConfig?: boolean;
    }>(),
    {
      disabledFlowActions: () => [],
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: OperatePermissionConfig): void;
    (e: 'remove', value: OperatePermissionConfig): void;
    (e: 'config', value: OperatePermissionConfig): void;
  }>();

  const local = computedEx({
    get: () => {
      return props.value || ({} as OperatePermissionConfig);
    },
    set: (v) => {
      emit('update:value', v);
    },
    deep: true,
  });

  const onRemove = () => {
    if (bpmnReadonly.value) {
      return;
    }
    emit('remove', props.value!);
  };

  const onConfig = () => {
    if (bpmnReadonly.value) {
      return;
    }
    emit('config', props.value!);
  };
</script>

<style lang="scss" scoped>
  $op-editor: (
    height: auto,
    font-size: 12px,
  );

  @include b(op-editor) {
    @include set-component-css-var(op-editor, $op-editor);

    @include e(enable) {
      line-height: 24px;
    }

    @include e(label) {
      flex-shrink: 0;
      margin-right: 4px;
      margin-left: 8px;
      color: #666;
      line-height: 24px;
    }

    @include e(input) {
      flex-grow: 1;
      flex-shrink: 0;
      width: 50px;

      :deep(.ant-input-suffix) {
        display: none;
      }
    }

    @include e(remove) {
      @include when(disabled) {
        cursor: not-allowed;
      }

      padding-right: 0;
      padding-left: 8px;
      color: #797a7d;
      line-height: 1;
      cursor: pointer;
    }

    @include e(config) {
      @include when(disabled) {
        cursor: not-allowed;
      }

      padding-right: 4px;
      padding-left: 8px;
      color: #797a7d;
      line-height: 1;
      cursor: pointer;
    }

    height: getcssvar(op-editor, height);
    padding: 4px 8px;
    border-radius: 4px;
    background: #f0f0f0;
    font-size: getcssvar(op-editor, font-size);

    :deep(.ant-input) {
      font-size: getcssvar(op-editor, font-size);
    }

    .#{bem(op-editor,flow-action)} + .#{bem(op-editor,signature)} {
      flex-shrink: 0;
      width: 107px;
      margin-left: 4px;
    }
  }

  @include b(op-editor-line) {
    display: flex;
    align-items: center;
  }
</style>
