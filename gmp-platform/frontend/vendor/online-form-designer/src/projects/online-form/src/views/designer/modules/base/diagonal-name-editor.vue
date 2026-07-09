<template>
  <form-item :class="[ns.b()]" :label="label" :inline="false">
    <template #extra>
      <span :class="[ns.e('switch-text')]">{{
        t('sys.onlineForm.diagonal.enableFIeldLabel')
      }}</span>
      <a-switch size="small" :disabled="disabled" v-model:checked="enableFieldVal" />
    </template>
    <template v-if="enableFieldVal">
      <SingleFieldDrop
        :class="ns.be('field')"
        :value="bindFieldVal"
        :disabled="disabled"
        @update:value="onFieldChange"
      />
    </template>
    <template v-else>
      <a-textarea
        size="small"
        :disabled="disabled"
        show-count
        :maxlength="32"
        :rows="3"
        v-model:value="nameVal"
        :placeholder="t('sys.inputTextTip', { name: label })"
      />
    </template>
  </form-item>
</template>

<script lang="ts" setup name="diagonal-name-editor">
  import { FIELD_TYPE, useNamespace } from '@gct/runtime';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { computed } from 'vue';
  import SingleFieldDrop from '/@online-form/views/designer/modules/base/drag/single-field-drop.vue';
  import type { IBindField } from '@gct/nocode-base';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const ns = useNamespace('diagonal-name-editor');

  const props = withDefaults(
    defineProps<{
      widget: PaperWidget.Diagonal;
      index: number;
      label?: string;
      disabled?: boolean;
    }>(),
    {},
  );

  const widget = computed(() => props.widget);

  const nameVal = computed({
    get() {
      return widget.value.names[props.index];
    },
    set(v) {
      widget.value.names[props.index] = v;
    },
  });
  const enableFieldVal = computed({
    get() {
      return widget.value.enableFields![props.index];
    },
    set(v) {
      widget.value.enableFields![props.index] = v;
    },
  });
  const bindFieldVal = computed({
    get() {
      return widget.value.bindFields![props.index];
    },
    set(v) {
      widget.value.bindFields![props.index] = v;
    },
  });

  const onFieldChange = (fieldMeta: IBindField | undefined) => {
    if (fieldMeta && fieldMeta.isFieldModel) {
      message.warn($t('sys.onlineForm.cannotBindFieldsUnderAssociatedModel'));
      return;
    }
    if (fieldMeta && ![FIELD_TYPE.TEXT, FIELD_TYPE.LONG_TEXT].includes(fieldMeta.fieldType!)) {
      message.warn($t('sys.onlineForm.canOnlyBindTextTypeFields'));
      return;
    }
    bindFieldVal.value = fieldMeta;
  };
</script>

<style lang="scss" scoped>
  $diagonal-name-editor: (
    height: auto,
  );

  @include b(diagonal-name-editor) {
    @include set-component-css-var(diagonal-name-editor, $diagonal-name-editor);
    height: getCssVar(diagonal-name-editor, height);

    @include e(switch-text) {
      margin-right: 8px;
      font-weight: 400;
      font-size: 12px;
      color: #919398;
      line-height: 18px;
    }
  }
</style>
