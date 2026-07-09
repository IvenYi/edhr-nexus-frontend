<template>
  <div :class="[ns.b()]">
    <div :class="[ns.b('line')]">
      <a-checkbox
        :class="[ns.e('enable')]"
        v-model:checked="local.enable"
        :disabled="bpmnReadonly"
      />
      <span :class="[ns.e('label')]"> {{ opLabel }}</span>
      <a-input
        :class="[ns.e('alias')]"
        v-model:value="local.alias"
        size="small"
        :disabled="bpmnReadonly || !local.enable"
        :placeholder="t('sys.inputTextTip', { name: t('sys.alias') })"
      />
      <SignTypeSelect
        v-if="showOpinionConfig"
        :class="[ns.e('signature')]"
        v-model:value="local.signatureType"
        :disabled="bpmnReadonly || !local.enable"
      />
    </div>
    <div :class="[ns.b('line'), 'mt-2px']">
      <OpinionSelect
        v-if="showOpinionConfig"
        :class="[ns.e('opinion')]"
        v-model:value="local.opinionMode"
        :disabled="bpmnReadonly || !local.enable"
      />
      <SignTypeSelect
        v-if="!showOpinionConfig"
        :class="[ns.e('signature')]"
        v-model:value="local.signatureType"
        :disabled="bpmnReadonly || !local.enable"
      />
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
  import SignTypeSelect from './sign-type-select.vue';
  import OpinionSelect from './opinion-select.vue';

  const bpmnReadonly = inject('bpmnReadonly', ref(false));

  const ns = useNamespace('op-editor');
  const { t } = useI18n() as any;

  const props = withDefaults(
    defineProps<{
      opLabel: string;
      value?: OperatePermissionConfig;
      showOpinionConfig?: boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: OperatePermissionConfig): void;
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
    height: getCssVar(op-editor, height);
    padding: 4px 8px;
    background: #f0f0f0;
    border-radius: 4px 4px 4px 4px;
    font-size: getCssVar(op-editor, font-size);

    :deep(.ant-input) {
      font-size: getCssVar(op-editor, font-size);
    }

    @include e(enable) {
      line-height: 24px;
    }
    @include e(label) {
      margin-left: 8px;
      margin-right: 4px;
      color: #666666;
      line-height: 24px;
      flex-shrink: 0;
    }
    @include e(alias) {
      width: auto;
      flex-grow: 1;
      :deep(.ant-input-suffix) {
        display: none;
      }
    }

    @include e(config) {
      padding: 0 4px;
      cursor: pointer;
      line-height: 1;
      padding-left: 12px;
      padding-right: 4px;
      color: #797a7d;

      @include when(disabled) {
        cursor: not-allowed;
      }
    }

    .#{bem(op-editor,alias)} + .#{bem(op-editor,signature)} {
      margin-left: 4px;
    }
  }

  @include b(op-editor-line) {
    display: flex;
    align-items: center;
  }
</style>
