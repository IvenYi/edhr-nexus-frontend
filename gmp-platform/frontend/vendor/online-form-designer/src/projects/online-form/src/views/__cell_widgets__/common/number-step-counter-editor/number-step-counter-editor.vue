<template>
  <div :class="[ns.b()]">
    <form-item :label="t('sys.onlineForm.isEnableStep')">
      <a-switch
        :class="[ns.e('switch')]"
        size="small"
        v-model:checked="formState.enableStepCounter"
        :disabled="disabled || readonly"
      />
    </form-item>
    <template v-if="formState.enableStepCounter">
      <a-input-number
        :class="[ns.e('num')]"
        v-model:value="formState.stepCounter"
        :min="1"
        :precision="precision"
        :placeholder="t('sys.inputTextTip', { name: t('sys.onlineForm.stepCounter') })"
        size="small"
        :disabled="disabled || readonly"
      />
    </template>
  </div>
</template>

<script lang="ts" setup name="number-step-counter-editor">
  import { computed } from 'vue';
  import { isNil } from 'lodash-es';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';

  const { t } = useI18n();

  const ns = useNamespace('number-step-counter-editor');

  const props = withDefaults(
    defineProps<{
      widget: CellWidget.Integer;
      /** 打印或者关联模型字段 */
      readonly: boolean;
      precision?: number;
      disabled?: boolean;
    }>(),
    {},
  );

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });
</script>

<style lang="scss" scoped>
  $number-step-counter-editor: (
    height: auto,
  );

  @include b(number-step-counter-editor) {
    @include set-component-css-var(number-step-counter-editor, $number-step-counter-editor);
    height: getCssVar(number-step-counter-editor, height);

    .gct-select-ex {
      #{getCssVarName(select-ex,font-size)}: 12px;
    }

    @include e(switch) {
      float: right;
    }

    @include e(num) {
      margin-top: 4px;
    }
  }
</style>
