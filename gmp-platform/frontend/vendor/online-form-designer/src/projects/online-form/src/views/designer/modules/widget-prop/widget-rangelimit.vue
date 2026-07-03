<template>
  <div :class="ns.b()">
    <form-item
      v-for="item in arr"
      :label="`${item.label}${$t('sys.name')}`"
      :inline="false"
      :class="ns.b('item')"
      :key="item.label"
    >
      <a-input
        :class="ns.be('item', 'input')"
        size="small"
        :disabled="disabled"
        v-model:value="formState[item.inputKey]"
        :placeholder="`${item.label}（${$t('sys.onlineForm.default')}）`"
        show-count
        :maxlength="32"
      />
      <SingleFieldDrop
        :class="ns.be('item', 'field')"
        :disabled="disabled"
        :value="formState[item.fieldKey]"
        @update:value="(v) => setNumberFieldMeta(v, item.fieldKey)"
      />
    </form-item>
    <form-item :label="$t('sys.pageDesigner.displayStyle')" :inline="false" :class="ns.b('item')">
      <SingleFieldDrop
        :class="ns.be('item', 'field')"
        :disabled="disabled"
        :value="formState.showTypeField"
        @update:value="(v) => setTextFieldMeta(v, 'showTypeField')"
      />
    </form-item>
  </div>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import SingleFieldDrop from '/@online-form/views/designer/modules/base/drag/single-field-drop.vue';
  import { useNamespace } from '@gct/runtime';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { computed } from 'vue';
  import { message } from 'ant-design-vue';
  import type { IBindField } from '@gct/nocode-base';

  const ns = useNamespace('widget-rangelimit');

  const props = defineProps<{
    widget: Partial<PaperWidget.RangeLimit>;
    disabled?: boolean;
  }>();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const numberTypes = [FIELD_TYPE.DECIMAL, FIELD_TYPE.DOUBLE, FIELD_TYPE.INTEGER, FIELD_TYPE.LONG];

  const setNumberFieldMeta = (fieldMeta: IBindField | undefined, key) => {
    if (fieldMeta && fieldMeta.isFieldModel) {
      message.warn($t('sys.onlineForm.powerWidgetErrorTip1'));
      return;
    }
    if (fieldMeta && !numberTypes.includes(fieldMeta.fieldType!)) {
      message.warn($t('sys.onlineForm.powerWidgetErrorTip3'));
      return;
    }
    formState.value[key] = fieldMeta;
  };

  const setTextFieldMeta = (fieldMeta: IBindField | undefined, key) => {
    if (fieldMeta && fieldMeta.isFieldModel) {
      message.warn($t('sys.onlineForm.powerWidgetErrorTip1'));
      return;
    }
    if (fieldMeta && ![FIELD_TYPE.TEXT].includes(fieldMeta.fieldType!)) {
      message.warn($t('sys.onlineForm.rangeLimitWidgetErrorTip1'));
      return;
    }
    formState.value[key] = fieldMeta;
  };

  const arr = [
    {
      label: $t('sys.onlineForm.upperLimit'),
      inputKey: 'upperLimitLabel',
      fieldKey: 'upperLimitField',
    },
    {
      label: $t('sys.onlineForm.lowerLimit'),
      inputKey: 'lowerLimitLabel',
      fieldKey: 'lowerLimitField',
    },
    {
      label: $t('sys.onlineForm.standardValue'),
      inputKey: 'standardValueLabel',
      fieldKey: 'standardValueField',
    },
    {
      label: $t('sys.onlineForm.upperTolerance'),
      inputKey: 'upperToleranceLabel',
      fieldKey: 'upperLimitField',
    },
    {
      label: $t('sys.onlineForm.lowerTolerance'),
      inputKey: 'lowerToleranceLabel',
      fieldKey: 'lowerLimitField',
    },
  ] as const;
</script>

<style scoped lang="scss">
  @include b(widget-rangelimit-item) {
    @include e(input) {
      margin-bottom: 8px;
      :deep(.ant-input) {
        font-size: 12px;
      }
    }
  }
</style>
