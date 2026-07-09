<template>
  <form-item :class="[ns.b()]" :label="$t('sys.onlineForm.superscriptSubscript')" :inline="false">
    <a-input
      :class="[ns.e('value')]"
      size="small"
      v-model:value="_scriptValue"
      :disabled="disabled"
      :placeholder="t('sys.inputText')"
    />
    <SelectEx
      :class="[ns.e('script')]"
      v-model:value="_isSuperScript"
      :options="renderCompOptions"
      :disabled="disabled"
      show-mode="icon"
      icon-type="custom"
      direction="portrait"
    />
  </form-item>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { useNamespace } from '@gct/runtime';

  const { t } = useI18n();

  const ns = useNamespace('indices-editor');

  const props = defineProps<{
    scriptValue?: string;
    isSuperScript?: boolean;
    disabled: boolean;
  }>();

  const emit = defineEmits(['update:scriptValue', 'update:isSuperScript']);

  const _scriptValue = computed({
    get() {
      return props.scriptValue;
    },
    set(v) {
      emit('update:scriptValue', v);
    },
  });

  const _isSuperScript = computed({
    get() {
      return props.isSuperScript;
    },
    set(v) {
      emit('update:isSuperScript', v);
    },
  });

  const renderCompOptions = [
    {
      label: $t('sys.onlineForm.superscript'),
      value: true,
      icon: 'icon-jiaobiao-shang',
    },
    {
      label: $t('sys.onlineForm.subscript'),
      value: false,
      icon: 'icon-jiaobiao-xia',
    },
  ];
</script>

<style lang="scss" scoped>
  @include b(indices-editor) {
    :deep(.ant-form-item-control-input-content) {
      display: flex;
      align-items: center;
    }

    @include e(script) {
      margin-left: 8px;
      #{getCssVarName(select-ex,icon-size )}: 12px;

      :deep(.gct-select-ex-option) {
        border: 1px solid transparent;
        color: #666666;
        padding: 0;
        &:hover {
          background: #e0e8ff;
        }
        &.is-selected {
          border-radius: 2px 2px 2px 2px;
          border-color: var(--ant-primary-color);
          color: var(--ant-primary-color);
        }
      }
    }
  }
</style>
