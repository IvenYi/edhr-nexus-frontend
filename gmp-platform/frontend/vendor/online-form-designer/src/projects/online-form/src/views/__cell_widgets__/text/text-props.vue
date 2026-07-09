<template>
  <a-form ref="formRef" :model="formState">
    <template v-if="!readonly">
      <form-item :label="`${t('sys.pageDesigner.fieldPlaceholder')}`" :inline="false">
        <a-input
          size="small"
          v-model:value="formState.placeholder"
          :placeholder="t('sys.inputText')"
          :disabled="disabled"
          show-count
          :maxlength="32"
        />
      </form-item>
      <form-item
        :label="`${t('sys.defaultValue')}`"
        name="defaultValue"
        :inline="false"
        :rules="[{ validator: defaultValueValidator }]"
      >
        <a-input
          size="small"
          v-model:value="formState.defaultValue"
          :placeholder="t('sys.inputText')"
          :disabled="disabled"
          show-count
          :maxlength="formState.maxlength || 32"
        />
      </form-item>
      <form-item :label="`${t('sys.component.fieldTypeProps.textLengthRange')}`" :inline="false">
        <number-range
          v-model:min="formState.minlength"
          v-model:max="maxlengthVal"
          :precision="0"
          :disabled="disabled"
        />
      </form-item>
      <form-item :label="`${t('sys.pageDesigner.regSwitch')}`" :inline="false">
        <RegexEditor v-model="regValue" :disabled="disabled" />
      </form-item>
    </template>

    <form-item :label="`${t('sys.pageDesigner.widgetType')}`" :inline="false">
      <a-select
        size="small"
        v-model:value="formState.renderComp"
        :disabled="disabled"
        class="w-full"
      >
        <a-select-option :value="CellWidgetRenderComp.Input">{{
          t('sys.pageDesigner.input')
        }}</a-select-option>
        <a-select-option :value="CellWidgetRenderComp.Textarea">{{
          t('sys.pageDesigner.text')
        }}</a-select-option>
      </a-select>
    </form-item>
  </a-form>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import NumberRange from '../common/number-range/number-range.vue';
  import { CellWidgetRenderComp } from '/@online-form/views/designer/enums';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { computed, ref } from 'vue';
  import RegexEditor from '../common/regex-editor/regex-editor.vue';
  import { pick } from 'lodash-es';

  const { t } = useI18n();

  const formRef = ref<any>(null);

  const props = defineProps<{
    widget: CellWidget.Text;
    /** 打印或者关联模型字段 */
    readonly: boolean;
    disabled: boolean;
  }>();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const maxlengthVal = computed({
    get() {
      return formState.value.maxlength;
    },
    set(v) {
      formState.value.maxlength = v;
      formRef.value.validate();
    },
  });

  /** 正则相关参数 */
  const regValue = computed({
    get() {
      if (!formState.value.regex || !formState.value.regexHint) {
        return undefined;
      }
      return pick(formState.value, ['regex', 'regexHint']);
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const defaultValueValidator = (rule, value, callback: (error?: string) => void) => {
    if (!value) {
      return;
    }
    if (formState.value.minlength && value.length < formState.value.minlength) {
      return callback(
        $t('sys.onlineForm.atLeastInputCharacterNumberTip', { number: formState.value.minlength }),
      );
    }
    if (formState.value.maxlength && value.length > formState.value.maxlength) {
      return callback(
        $t('sys.onlineForm.atMostInputCharacterNumberTip', { number: formState.value.maxlength }),
      );
    }
  };
</script>

<style></style>
