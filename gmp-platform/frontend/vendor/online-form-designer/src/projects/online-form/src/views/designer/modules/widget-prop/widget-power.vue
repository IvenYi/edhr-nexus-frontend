<template>
  <div :class="ns.b()">
    <form-item
      :label="$t('sys.onlineForm.powerComp.valueFieldLabel')"
      :inline="false"
      :class="ns.b('item')"
    >
      <SingleFieldDrop
        :class="ns.be('item', 'field')"
        :disabled="disabled"
        :value="formState.valueField"
        @update:value="(v) => setDoubleFieldMeta(v, 'valueField')"
      />
    </form-item>
    <a-button
      :disabled="generateDisabled"
      :class="ns.e('generate-btn')"
      size="small"
      @click="generateFields"
    >
      {{ $t('sys.onlineForm.powerComp.generateBtnText') }}
    </a-button>
    <form-item
      :label="$t('sys.onlineForm.powerComp.baseFieldLabel')"
      :inline="false"
      :class="ns.b('item')"
    >
      <SingleFieldDrop
        :class="ns.be('item', 'field')"
        :disabled="disabled"
        :value="formState.baseValueField"
        @update:value="(v) => setNumberFieldMeta(v, 'baseValueField')"
      />
    </form-item>
    <form-item
      :label="$t('sys.onlineForm.powerComp.exponentFieldLabel')"
      :inline="false"
      :class="ns.b('item')"
    >
      <SingleFieldDrop
        :class="ns.be('item', 'field')"
        :disabled="disabled"
        :value="formState.exponentValueField"
        @update:value="(v) => setNumberFieldMeta(v, 'exponentValueField')"
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
  import { useSpreadSheet } from '../../hooks/useSpreadSheet';
  import { useReverseModeling } from '../../hooks/reverse-modeling';

  const ns = useNamespace('widget-power');

  const props = defineProps<{
    widget: Partial<PaperWidget.Power>;
    disabled?: boolean;
  }>();

  const { isEasyEdition, publish } = useSpreadSheet();
  const { addField, getFieldDTO, findField } = useReverseModeling();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const numberTypes = [FIELD_TYPE.DECIMAL, FIELD_TYPE.DOUBLE, FIELD_TYPE.INTEGER, FIELD_TYPE.LONG];

  const setDoubleFieldMeta = (fieldMeta: IBindField | undefined, key) => {
    if (fieldMeta && fieldMeta.isFieldModel) {
      message.warn($t('sys.onlineForm.powerWidgetErrorTip1'));
      return;
    }
    if (fieldMeta && ![FIELD_TYPE.DECIMAL, FIELD_TYPE.DOUBLE].includes(fieldMeta.fieldType!)) {
      message.warn($t('sys.onlineForm.powerWidgetErrorTip2'));
      return;
    }
    formState.value[key] = fieldMeta;
  };

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

  /** 禁用自动生产字段 */
  const generateDisabled = computed(() => {
    if (props.disabled) {
      return true;
    }
    return !!(
      !formState.value.valueField ||
      formState.value.baseValueField ||
      formState.value.exponentValueField
    );
  });

  const generateFields = () => {
    if (generateDisabled.value) {
      return;
    }
    const bindValField = props.widget.valueField!;
    const valueField = findField({ modelKey: bindValField.model, fieldKey: bindValField.field! });

    const baseFieldDto = Object.assign(
      getFieldDTO({ type: FIELD_TYPE.DOUBLE, model: valueField.modelKey! }),
      {
        key: valueField.key + '_js',
        name: valueField.name + '_' + $t('sys.onlineForm.baseNumber'),
      },
    );
    const exponentFieldDto = Object.assign(
      getFieldDTO({ type: FIELD_TYPE.DOUBLE, model: valueField.modelKey! }),
      {
        key: valueField.key + '_cm',
        name: valueField.name + '_' + $t('sys.onlineForm.power'),
      },
    );
    console.log('baseFieldDto', baseFieldDto);
    console.log('exponentFieldDto', exponentFieldDto);

    try {
      addField(baseFieldDto);
      addField(exponentFieldDto);
      // 专业模式直接走发布;
      if (!isEasyEdition.value) {
        publish();
      }
    } catch (error) {
      message.error(error.message);
    }
  };
</script>

<style scoped lang="scss">
  @include b(widget-power) {
    @include e(input) {
      margin-bottom: 8px;
      :deep(.ant-input) {
        font-size: 12px;
      }
    }

    @include e(generate-btn) {
      margin-top: 8px;
      width: 100%;
    }
  }
</style>
