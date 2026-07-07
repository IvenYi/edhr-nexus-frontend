<template>
  <div class="hosted-cell-widget-props">
    <form-item :label="$t('sys.edhr.emptyChar')" :inline="false">
      <a-select
        v-model:value="emptySymbolValue"
        size="small"
        :disabled="disabled"
        :options="emptySymbolOptions"
        :placeholder="$t('sys.chooseText')"
        allowClear
      />
    </form-item>

    <form-item v-if="showInputPropEditor" :label="$t('sys.model.inputAttr')">
      <a-checkbox v-model:checked="requiredValue" :disabled="disabled || fieldRequired">
        {{ $t('sys.appDesigner.approval.opinionMode.Required') }}
      </a-checkbox>
      <a-checkbox v-model:checked="disabledValue" :disabled="disabled">
        {{ $t('sys.disable') }}
      </a-checkbox>
    </form-item>

    <form-item
      v-if="showViewStatus"
      :label="$t('sys.onlineForm.renderingMethodWhenViewing')"
      :inline="false"
    >
      <a-select
        v-model:value="viewStateValue"
        size="small"
        :disabled="disabled"
        :options="viewStateOptions"
      />
    </form-item>

    <form-item
      v-if="showAffixEditor"
      :label="$t('sys.onlineForm.prefixOrSuffix')"
      :inline="false"
    >
      <div class="hosted-cell-widget-props__affix">
        <span>{{ $t('sys.onlineForm.prefix') }}</span>
        <a-textarea
          v-model:value="prefixValue"
          :placeholder="$t('sys.inputText')"
          :disabled="disabled"
          show-count
          :maxlength="120"
        />
      </div>
      <div class="hosted-cell-widget-props__affix">
        <span>{{ $t('sys.onlineForm.suffix') }}</span>
        <a-textarea
          v-model:value="suffixValue"
          :placeholder="$t('sys.inputText')"
          :disabled="disabled"
          show-count
          :maxlength="120"
        />
      </div>
    </form-item>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  const inputCategories = [
    'text',
    'integer',
    'double',
    'decimal',
    'boolean',
    'date-time',
    'image',
    'file',
    'user',
    'org',
    'enum',
    'signature',
    'ref',
    'trace',
  ];
  const affixCategories = [
    'text',
    'integer',
    'double',
    'decimal',
    'date-time',
    'org',
    'user',
    'trace',
    'ref',
  ];
  const traceCategories = ['trace'];

  const emptySymbolOptions = ['/', '--', '——', 'NA', 'N/A', 'empty', 'none'].map((value) => ({
    label: value === 'empty' || value === 'none' ? $t(`sys.edhr.emptySymbol.${value}`) : value,
    value,
  }));

  const viewStateOptions = [
    { label: $t('sys.pageDesigner.readonly'), value: 'readonly' },
    { label: $t('sys.disable'), value: 'disabled' },
    { label: $t('sys.onlineForm.followDesign'), value: 'auto' },
  ];

  const props = defineProps<{
    fieldMeta: Record<string, any>;
    fieldWidget: Record<string, any>;
    readonly: boolean;
    disabled: boolean;
    isViewModel: boolean;
  }>();

  const formState = computed(() => props.fieldWidget ?? {});
  const fieldRequired = computed(() => Boolean(props.fieldMeta?.required));
  const category = computed(() => props.fieldWidget?.category);
  const isTraceField = computed(() => traceCategories.includes(category.value));

  const showInputPropEditor = computed(() => {
    if (props.isViewModel || props.readonly) return false;
    return inputCategories.includes(category.value);
  });

  const showViewStatus = computed(() => !isTraceField.value);
  const showAffixEditor = computed(() => affixCategories.includes(category.value));

  const emptySymbolValue = computed({
    get: () => formState.value.emptySymbol,
    set: (value) => {
      formState.value.emptySymbol = value;
    },
  });

  const requiredValue = computed({
    get: () => fieldRequired.value || formState.value.required,
    set: (value) => {
      formState.value.required = value;
      formState.value.disabled = undefined;
    },
  });

  const disabledValue = computed({
    get: () => formState.value.disabled,
    set: (value) => {
      formState.value.required = undefined;
      formState.value.disabled = value;
    },
  });

  const viewStateValue = computed({
    get: () => formState.value.viewState || 'readonly',
    set: (value) => {
      formState.value.viewState = value;
    },
  });

  const prefixValue = computed({
    get: () => formState.value.prefix,
    set: (value) => {
      formState.value.prefix = value;
    },
  });

  const suffixValue = computed({
    get: () => formState.value.suffix,
    set: (value) => {
      formState.value.suffix = value;
    },
  });
</script>

<style lang="less" scoped>
  .hosted-cell-widget-props {
    :deep(.ant-checkbox-wrapper) {
      font-size: 12px;
    }

    &__affix {
      display: flex;
      gap: 6px;
      padding: 4px;
      background: #f2f4f7;
      border-radius: 4px;

      &:not(:first-child) {
        margin-top: 4px;
      }

      span {
        flex: none;
        width: 32px;
        color: #666;
        font-size: 12px;
        line-height: 24px;
      }
    }
  }
</style>
