<template>
  <van-field
    :class="{ 'hidden!': isEmpty }"
    ref="comfield"
    v-bind="{ ...$attrs, ...formAttr }"
    :style="wrapperStyle"
    :rules="RuleProps"
    @click="clickEvent"
    :label-width="labelWidth"
    :modelValue="modelValue"
  >
    <template #label v-if="displayLabelText && widgetType !== FormComponents.SubTable">
      <span :class="[showDisabled ? 'tag-label-disabled' : null, labelClass]">
        {{ label }}
      </span>
    </template>
    <template v-for="(_value, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
    <template v-for="(_value, name) in Fieldslots" #[name]="slotData">
      <component :is="_value" v-bind="slotData || {}" />
    </template>
    <template #button v-if="modelValue && clearable && !showReadonly && !showDisabled">
      <van-icon name="clear" size="20" color="#c8c9cc" @click.stop="emit('clearValue')" />
    </template>
  </van-field>
  <van-field
    v-if="isEmpty"
    v-bind="{ ...$attrs, ...formAttr }"
    :style="wrapperStyle"
    :label-width="labelWidth"
  >
    <template #label v-if="displayLabelText && widgetType !== FormComponents.SubTable">
      <span :class="[showDisabled ? 'tag-label-disabled' : null, labelClass]">
        {{ label }}
      </span>
    </template>
    <template #input>
      <RenderEmptyValue />
    </template>
  </van-field>
  <refCardLabel :modelValue="FieldValue" :props="props.props" v-if="modelValue" />
</template>

<script setup lang="ts">
  import { reactive, computed, inject, onBeforeMount, ref, toRef, toRefs, useAttrs } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { BindCmpStyleEnum, FormComponents } from '/@page-designer/enum';
  import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
  import { useDisabled, useReadyonly } from '/@page-designer/components/widgets/hooks/useReadyonly';
  import type { FieldProps, FieldRule } from 'vant';
  import { emptyValueDisplay } from '/@page-designer/components/widgets/web/__components__/formcomponent/field-emptyValue';
  import refCardLabel from './ref-card-label.vue';

  const Event = getPageEvent();
  const comfield = ref();
  const props = defineProps<{
    props: LowCodeWidget.FormItemProps;
    style: LowCodeWidget.BasicStyle;
    widgetType?: FormComponents;
    isLink?: boolean;
    clearable?: boolean;
    formData: any;
    widget?: LowCodeWidget.BasicSchema;
    modelValue: string;
  }>();
  const Fieldslots: any = inject('Fieldslots', {});
  const emit = defineEmits(['clearValue', 'click']);
  const FieldValue = computed(() => props.modelValue);
  const { RenderEmptyValue, isEmpty } = emptyValueDisplay(props, FieldValue);
  const labelLayout = inject('labelLayout', {});
  const subLabelLayout = inject('subLabelLayout', {});
  const subTableValidateRule = inject('subTableValidateRule') || inject('validateRule') || [];
  const { label } = toRefs(props.props);
  const required = toRef(() => props.props.required);
  const reg = toRef(() => props.props.reg);
  const validateTrue = toRef(() => props.props.validateTrue);
  const {
    regHint,
    regSwitch,
    fieldName,
    field,
    placeholder,
    displayLabelText,
    minlength,
    fieldType,
    modelKey,
    closeValidator,
    notAutoFix,
    maxValue,
    minValue,
  } = reactive(props.props);
  const formLayout = inject<any>('form-layout', {});
  const layout: any = toRef(() => {
    const layoutData = { ...(formLayout.value || {}) };
    if (fieldType === FIELD_TYPE.MASTERSLAVE) {
      layoutData.inputBg = false;
    }
    return layoutData;
  });

  const { labelFont, wrapperStyle, contentFont }: any = useStyle(props.widget || props);

  const showDisabled = toRef(() => useDisabled(props.props.disabled));
  const showReadonly = toRef(() => useReadyonly(props.props.readonly));

  function clickEvent(e) {
    if (showDisabled.value || showReadonly.value) return;

    emit('click', e);
  }
  const RuleProps = toRef(() => {
    const rules: FieldRule[] = [];
    if (closeValidator || showReadonly.value) {
      return rules;
    }
    if (required?.value) {
      rules.push({
        required: true,
        message: label.value + '不能为空',
        formatter(value) {
          /**vant false 触发空置校验 */
          if (value === false) {
            return true;
          } else {
            return value;
          }
        },
      });
    }
    if (regSwitch && reg?.value) {
      rules.push({
        pattern: new RegExp(reg.value),
        message: regHint ?? '格式不正确',
      });
    }
    if (validateTrue?.value) {
      rules.push({
        validator(value) {
          if (!value) {
            return `${label.value}填写错误`;
          }
          return '';
        },
      });
    }
    rules.push({
      validator(value) {
        if (value.length && minlength && value.length < minlength) {
          return label.value + '长度不小于' + minlength;
        }
        return '';
      },
    });

    if (notAutoFix) {
      if (minValue !== '' && !isNaN(minValue)) {
        rules.push({
          trigger: 'onChange',
          validator(value) {
            if (Number(value) < Number(minValue)) {
              return '最小数值为 ' + minValue;
            }
            return '';
          },
        });
      }
      if (maxValue !== '' && !isNaN(maxValue)) {
        rules.push({
          trigger: 'onChange',
          validator(value) {
            if (Number(value) > Number(maxValue)) {
              return '最大数值为 ' + maxValue;
            }
            return '';
          },
        });
      }
    }

    /**自定义校验 */
    if (Array.isArray(subTableValidateRule)) {
      const vdata = subTableValidateRule.find((i) => i.field === field);

      if (vdata) {
        rules.push({
          trigger: [
            FIELD_TYPE.TEXT,
            FIELD_TYPE.DOUBLE,
            FIELD_TYPE.DECIMAL,
            FIELD_TYPE.INTEGER,
            FIELD_TYPE.LONG_TEXT,
            FIELD_TYPE.LONG,
          ].includes(fieldType as FIELD_TYPE)
            ? 'onBlur'
            : 'onChange',
          async validator(value) {
            const fieldValue = value;
            try {
              await Event!.runExportByName(vdata.jsName, fieldValue, { ...(props.formData ?? {}) });
            } catch (error) {
              return error;
            }
          },
        });
      }
    }

    return rules;
  });
  // console.log(field);

  const formAttr = computed(() => {
    const res = {
      isLink: showReadonly.value ? false : props.isLink,
    };
    if ([FIELD_TYPE.LONG_TEXT, FIELD_TYPE.ATTACHMENT, FIELD_TYPE.MASTERSLAVE].includes(fieldType)) {
      Object.assign(res, {
        labelAlign: 'top',
        inputAlign: 'left',
        errorMessageAlign: 'center',
      });
    }

    if ([FIELD_TYPE.INTEGER, FIELD_TYPE.LONG].includes(fieldType)) {
      Object.assign(res, {
        type: 'digit',
      });
    }
    // if ([FIELD_TYPE.DECIMAL].includes(fieldType)) {
    //   Object.assign(res, {
    //     type: 'number',
    //   });
    // }

    const label = subLabelLayout?.value
      ? subLabelLayout.value?.layout?.label
      : labelLayout.value?.layout?.label;

    const textAlign = subLabelLayout?.value
      ? subLabelLayout.value?.layout?.inputAlign
      : layout.value?.inputAlign;

    let attr: Partial<FieldProps> = {
      inputAlign: contentFont.value.textAlign || textAlign,
      labelAlign: label,
      name: field,
      placeholder: showReadonly.value ? '' : placeholder,
      // required: 'auto',
      disabled: showDisabled.value,
      ...res,
    };
    return attr;
  });
  const notNeedBgColor = computed(() => {
    return (
      [
        // FormComponents.Switch,
        FormComponents.UploadFile,
        FormComponents.UploadImage,
        FormComponents.Signature,
        // FormComponents.ReadonlyCmp,
      ].includes(props.widgetType) ||
      props?.props?.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN
    );
  });

  const labelWidth = computed(() => {
    if (subLabelLayout && subLabelLayout.value) {
      return !!subLabelLayout.value?.hasLabelWidth && subLabelLayout.value?.layout?.label == 'left'
        ? subLabelLayout.value?.width
        : '6.2em';
    }
    return !!labelLayout.value?.hasLabelWidth && labelLayout.value?.layout?.label == 'left'
      ? labelLayout.value?.width
      : '6.2em';
  });

  const labelClass = computed(() => {
    if (subLabelLayout && subLabelLayout.value) {
      return !!subLabelLayout.value?.hasLabelWidth && subLabelLayout.value?.layout?.label === 'left'
        ? subLabelLayout.value?.overLabelDisplay == 'ellipsis'
          ? 'label-ellipsis'
          : 'label-wrap'
        : '';
    }
    return !!labelLayout.value?.hasLabelWidth && labelLayout.value?.layout?.label === 'left'
      ? labelLayout.value?.overLabelDisplay == 'ellipsis'
        ? 'label-ellipsis'
        : 'label-wrap'
      : '';
  });

  const textAlign = computed(() => {
    if (subLabelLayout && subLabelLayout.value) {
      return contentFont.textAlign
        ? contentFont.textAlign
        : subLabelLayout.value?.layout?.inputAlign;
    }
    return contentFont.textAlign ? contentFont.textAlign : layout.value?.inputAlign;
  });

  const subLayoutBg = computed(() => subLabelLayout.value?.layout?.inputBg);

  console.log('-------------', contentFont.value, subLabelLayout.value, textAlign.value);

  onBeforeMount(async () => {
    initFieldWidgetRuntime(props, true)
      .then((fieldInfo) => {
        props.props.label = props.props.label || fieldInfo?.name;
      })
      .catch((err) => {
        /**隐藏已经删除的字段 */
        // props.props.hidden = true;
      });
  });
  defineExpose({
    focus() {
      comfield.value.focus();
    },
  });
</script>

<style lang="less" scoped>
  :deep(.van-field__label) {
    color: v-bind('labelFont.color');
    // font-size: v-bind('labelFont.fontSize');
    font-style: v-bind('labelFont.fontStyle');
    font-weight: v-bind('labelFont.fontWeight');
    text-align: v-bind('labelFont.textAlign');
    text-decoration-line: v-bind('labelFont.textDecorationLine');

    .label-ellipsis {
      display: inline-block;
      width: v-bind("required?'calc(100% - 18px)':'100%'");
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: top;
      white-space: nowrap;
    }
  }

  :deep(.app-tag-cell-box.van-cell .van-cell__value) {
    & > div {
      display: inline-block;
    }
  }

  :deep(.van-field__value) {
    overflow: hidden;
  }

  :deep(.van-field__body) {
    padding: v-bind("layout.inputBg && !notNeedBgColor?'10px 0':''");
    border-radius: 4px;
    background-color: v-bind("layout.inputBg && !notNeedBgColor?'#f7f7f7':''");
    font-size: 14px;

    textarea {
      padding-left: v-bind("layout.inputBg?'12px':''");
      text-align: v-bind("textAlign||'left'");
    }

    input {
      // background-color: v-bind("layout.inputBg?'#f7f7f7':''");
      // padding: v-bind("layout.inputBg?'10px 0':''");
      padding-left: v-bind("layout.inputBg?'12px':''");
      // min-height: v-bind("layout.inputBg?'44px':''");
      text-align: v-bind("textAlign||'left'");
    }
    & > div {
      padding-left: v-bind("layout.inputBg?'12px':''");
    }
  }

  :deep(.van-field__body:has(.van-field__control .time-input)) {
    padding: 0;
    background-color: transparent;

    .time-input {
      input {
        width: v-bind("layout.inputBg?'32px':'24px'");
        height: v-bind("layout.inputBg?'32px':'24px'");
        border-width: v-bind("layout.inputBg?'1px':0");
      }

      span {
        line-height: v-bind("layout.inputBg?'32px':'24px'");
      }
    }

    .time-input__null {
      input {
        background-color: v-bind("layout.inputBg?'#f7f7f7':'transparent'");
      }
    }
  }

  :deep(.van-cell__right-icon) {
    display: flex;
    align-items: center;
    height: auto;
    margin-left: -2px;
    padding: v-bind("!modelValue&&layout.inputBg?'10px 0':''");
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    background-color: v-bind("layout.inputBg?'#f7f7f7':''");
    line-height: inherit;
  }

  :deep(.van-cell__value) {
    text-align: v-bind("textAlign||'left'");
    word-break: break-all;
    // padding-left: v-bind("layout.inputBg?'12px':''");
  }

  .tag-label-disabled {
    padding-left: v-bind("layout.inputBg?'12px':''");
    opacity: 1;
    color: var(--van-field-input-disabled-text-color);
  }

  :deep(.van-field__error-message--center) {
    margin-left: 104px;
    text-align: left;
  }

  :deep(.gct-sub-table-render-item .van-field > .van-field__value > .van-field__body) {
    padding: v-bind("subLayoutBg && !notNeedBgColor?'10px 0':''") !important;
    background-color: v-bind("subLayoutBg&& !notNeedBgColor?'#f7f7f7':''") !important;
    textarea,
    input,
    .select-text {
      padding-left: v-bind("subLayoutBg?'12px':''") !important;
    }
    .time-input__body {
      input {
        width: v-bind("subLayoutBg?'32px':'24px'");
        height: v-bind("subLayoutBg?'32px':'24px'");
        border-width: v-bind("subLayoutBg?'1px':0");
        background-color: v-bind("subLayoutBg?'#f7f7f7':''");
      }
      span {
        line-height: v-bind("subLayoutBg?'32px':'24px'");
      }
    }
    & > div {
      padding-left: 0 !important;
    }
    .van-cell__right-icon {
      padding: v-bind(
        "(subLabelLayout?.layout?.label !== 'top'&&subLayoutBg)?'10px 0':''"
      ) !important;
    }
  }
  :deep(.gct-sub-table-render-item .van-field--label-top) {
    border-bottom: v-bind(
      "(subLabelLayout?.layout?.label == 'top'&&!subLayoutBg)?'1px solid #e8ebf0':''"
    );
  }
  :deep(.gct-sub-table-render-item .van-field__value) {
    background: v-bind(
      "subLayoutBg && ![ FIELD_TYPE.ATTACHMENT, FIELD_TYPE.IMAGE,FIELD_TYPE.BOOLEAN,FIELD_TYPE.MASTERSLAVE].includes(fieldType)?'#f7f7f7':''"
    ) !important;
  }
</style>
