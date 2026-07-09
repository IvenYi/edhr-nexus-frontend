<template>
  <form-item :class="[ns.b()]" :label="$t('sys.edhr.emptyChar')" :inline="false">
    <a-select
      size="small"
      v-model:value="_value"
      :disabled="disabled"
      :options="symbolOptions"
      :placeholder="t('sys.chooseText')"
      allowClear
    />
  </form-item>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';
  import { EmptySymbol } from '@gct/nocode-base';

  const { t } = useI18n();

  const ns = useNamespace('empty-symbol-editor');

  const symbolOptions = Object.values(EmptySymbol).map((val) => {
    return {
      label: $t(`sys.edhr.emptySymbol.${val}`),
      value: val,
    };
  });

  const props = defineProps<{
    emptySymbol?: string;
    disabled: boolean;
  }>();

  const emit = defineEmits(['update:emptySymbol']);

  const _value = computed({
    get() {
      return props.emptySymbol;
    },
    set(v) {
      emit('update:emptySymbol', v);
    },
  });
</script>

<style lang="scss" scoped>
  @include b(indices-editor) {
    :deep(.ant-form-item-control-input-content) {
      display: flex;
      align-items: center;
    }

    @include e(script) {
      margin-left: 8px;
      #{getCssVarName(select-ex,icon-size )}: 10px;
    }
  }
</style>
