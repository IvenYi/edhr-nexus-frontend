<template>
  <van-field
    :class="{
      'hidden!': isEmpty,
      'file-display': [FIELD_TYPE.SIGNATURE, FIELD_TYPE.ATTACHMENT, FIELD_TYPE.IMAGE].includes(
        fieldType,
      ),
    }"
    ref="comfield"
    v-bind="{ ...$attrs, ...formAttr }"
    :style="[wrapperStyle, { '--currency-symbol': currency ? `'${currency}'` : '' }]"
    :rules="RuleProps"
    @click="clickEvent"
    :label-width="
      !!labelLayout?.hasLabelWidth && labelLayout?.layout.label == 'left'
        ? labelLayout.width
        : 'auto'
    "
    :modelValue="modelValue"
    @end-validate="onEndValidate"
  >
    <template #label v-if="displayLabelText && widgetType !== FormComponents.SubTable">
      <div v-if="field_multi" class="ks-row w100%">
        <span class="ks-col" :class="[showDisabled ? 'tag-label-disabled' : null]">
          {{ label }}
        </span>
        <div v-if="!showDisabled && !showReadonly">
          <span class="pr8px">已选择{{ valueLength || 0 }}个</span>
          <van-icon name="clear" size="16" color="#c8c9cc" @click.stop="emit('clearValue')" />
        </div>
      </div>
      <span
        v-else
        :class="[
          showDisabled ? 'tag-label-disabled' : null,
          !!labelLayout?.hasLabelWidth && labelLayout?.layout.label === 'left'
            ? labelLayout?.overLabelDisplay == 'ellipsis'
              ? 'label-ellipsis'
              : 'label-wrap'
            : '',
        ]"
      >
        {{ label }}
      </span>
    </template>
    <template v-for="(_value, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
    <template v-for="(_value, name) in Fieldslots" #[name]="slotData">
      <component :is="_value" v-bind="slotData || {}" />
    </template>
    <template
      #button
      v-if="!field_multi && modelValue && clearable && !showReadonly && !showDisabled"
    >
      <van-icon name="clear" size="16" color="#c8c9cc" @click.stop="emit('clearValue')" />
    </template>
  </van-field>
  <van-field
    v-if="isEmpty"
    v-bind="{ ...$attrs, ...formAttr }"
    @end-validate="onEndValidate"
    :style="wrapperStyle"
    :label-width="
      !!labelLayout?.hasLabelWidth && labelLayout?.layout.label == 'left'
        ? labelLayout.width
        : '6.2em'
    "
  >
    <template #label v-if="displayLabelText && widgetType !== FormComponents.SubTable">
      <span
        :class="[
          showDisabled ? 'tag-label-disabled' : null,
          !!labelLayout?.hasLabelWidth && labelLayout?.layout.label === 'left'
            ? labelLayout?.overLabelDisplay == 'ellipsis'
              ? 'label-ellipsis'
              : 'label-wrap'
            : '',
        ]"
      >
        {{ label }}
      </span>
    </template>
    <template #input>
      <RenderEmptyValue />
    </template>
  </van-field>
</template>

<script setup lang="ts">
  import { reactive, computed, inject, onBeforeMount, ref, toRef, toRefs, useAttrs } from 'vue';
  import { getPageEvent, useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { FIELD_TYPE, UniqueConstraintType } from '/@/enums/appEnum';
  import { BindCmpStyleEnum, FormComponents } from '/@page-designer/enum';
  import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
  import { useDisabled, useReadyonly } from '/@page-designer/components/widgets/hooks/useReadyonly';
  import type { FieldProps, FieldRule } from 'vant';
  import { transformPropsField } from '@gct/runtime';
  import { emptyValueDisplay } from './formcomponent/field-emptyValue';
  import { getModelDataCheckFieldValueExist } from '/@/apis/gct-apaas/ModelDataController';

  const Event = getPageEvent();
  const t = window.$t;
  const comfield = ref();
  const props = defineProps<{
    props: LowCodeWidget.FormItemProps;
    style: LowCodeWidget.BasicStyle;
    widgetType?: FormComponents;
    isLink?: boolean;
    clearable?: boolean;
    formData: any;
    // 币种标识
    currency?: string;
    widget?: LowCodeWidget.BasicSchema;
    modelValue: string;
    validateTrigger?: string[];
  }>();
  const is_v_table = inject('is_v_table', false);
  const Fieldslots: any = inject('Fieldslots', {});
  const emit = defineEmits(['clearValue', 'click']);
  const FieldValue = computed(() => {
    return props.modelValue;
  });
  const valueLength = computed(() => {
    if (Array.isArray(FieldValue.value)) {
      return FieldValue.value.length;
    } else if (typeof FieldValue.value === 'string') {
      return FieldValue.value.split(',').filter((v) => v).length;
    } else return 0;
  });
  const { getFileAttrs, attrObj } = useAsyncFileAttrs();
  const { RenderEmptyValue, isEmpty } = emptyValueDisplay(props, FieldValue);
  const labelLayout = inject('labelLayout', {});
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
    bindCompStyleType,
    readonly,
    uniqueConstraintType,
  } = reactive(props.props);

  // 子表全局唯一值校验、
  const subTableCustomValidateRules: Fn | undefined = inject(
    'subTableCustomValidateRules',
    undefined,
  );

  const formLayout = inject<any>('form-layout', {});
  const layout: any = toRef(() => {
    const layoutData = { ...(formLayout.value || {}) };
    if (fieldType === FIELD_TYPE.MASTERSLAVE) {
      layoutData.inputBg = false;
    }
    return layoutData;
  });

  // 校验结束事件透传
  const endValidate = inject('end-validate');

  function onEndValidate(...args: any[]) {
    endValidate && endValidate(...args);
  }

  const { labelFont = {}, wrapperStyle, contentFont }: any = useStyle(props.widget || props);
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
        trigger: props.validateTrigger,
        message: (label.value || '') + '不能为空',
        formatter(value) {
          /**vant false 触发空置校验 */
          if (value === false) {
            return true;
          }
          return value;
        },
      });
    }
    if (regSwitch && reg?.value) {
      rules.push({
        trigger: props.validateTrigger,
        pattern: new RegExp(reg.value),
        message: regHint ?? '格式不正确',
      });
    }
    if (validateTrue?.value) {
      rules.push({
        trigger: props.validateTrigger,
        validator(value) {
          if (!value) {
            return `${label.value}填写错误`;
          }
          return '';
        },
      });
    }
    rules.push({
      trigger: ['onChange', 'onBlur'],
      validator(value) {
        if (value?.length && props.props.minlength && value?.length < props.props.minlength) {
          return label.value + '长度不小于' + props.props.minlength;
        }
        return '';
      },
    });

    if (notAutoFix) {
      if (
        props.props.minValue !== '' &&
        props.props.minValue !== null &&
        props.props.minValue !== undefined &&
        !isNaN(props.props.minValue)
      ) {
        rules.push({
          trigger: ['onChange', 'onBlur'],
          validator(value) {
            if (Number(value) < Number(props.props.minValue)) {
              return '最小数值为 ' + props.props.minValue;
            }
            return '';
          },
        });
      }
      if (
        props.props.maxValue !== '' &&
        props.props.maxValue !== null &&
        props.props.maxValue !== undefined &&
        !isNaN(props.props.maxValue)
      ) {
        rules.push({
          trigger: ['onChange', 'onBlur'],
          validator(value) {
            if (Number(value) > Number(props.props.maxValue)) {
              return '最大数值为 ' + props.props.maxValue;
            }
            return '';
          },
        });
      }
    }

    // 唯一值异步校验
    if (uniqueConstraintType === UniqueConstraintType.GLOBAL) {
      rules.push({
        trigger: ['onBlur'],
        message: t('sys.pageDesigner.theCurrentValueAlreadyExists'),
        async validator(value) {
          if (value === undefined || value === null || value === '') {
            return true;
          }
          // 子表全局唯一校验
          if (typeof subTableCustomValidateRules === 'function') {
            return subTableCustomValidateRules({
              field,
              value,
            });
          }
          try {
            const exist = await getModelDataCheckFieldValueExist({
              fieldKey: field,
              fieldValue: value,
              modelKey,
              excludeId: props.formData?.id_,
              refFieldKey: props.formData?.ref_field_key_,
              refMasterId: props.formData?.ref_master_id_,
            });
            if (exist) {
              return t('sys.pageDesigner.theCurrentValueAlreadyExists');
            }
            return true;
          } catch (error) {
            return '唯一值校验失败，请稍后重试';
          }
        },
      });
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

  /**关联字段多选 */
  const field_multi = computed(() => {
    return (
      FieldValue.value &&
      [
        FIELD_TYPE.ENUM_MULTI,
        FIELD_TYPE.USER_MULTI,
        FIELD_TYPE.ORG_MULTI,
        FIELD_TYPE.REF_MULTI,
      ].includes(fieldType)
    );
  });
  const formAttr = computed(() => {
    const res = {
      isLink: showReadonly.value ? false : props.isLink,
    };
    if (field_multi.value) {
      Object.assign(res, {
        labelAlign: 'top',
        inputAlign: 'left',
        errorMessageAlign: 'center',
      });
    }
    if ([FIELD_TYPE.ATTACHMENT, FIELD_TYPE.MASTERSLAVE, FIELD_TYPE.SIGNATURE].includes(fieldType)) {
      Object.assign(res, {
        labelAlign: 'top',
        inputAlign: 'left',
        errorMessageAlign: 'center',
      });
    }
    if (
      [FIELD_TYPE.LONG_TEXT, FIELD_TYPE.TEXT].includes(fieldType) &&
      bindCompStyleType === BindCmpStyleEnum.CMP_TEXTAREA
    ) {
      return {
        labelAlign: 'top',
        inputAlign: 'left',
        errorMessageAlign: 'center',
      };
    }
    if (fieldType === FIELD_TYPE.IMAGE) {
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
    if ([FIELD_TYPE.DECIMAL].includes(fieldType)) {
      Object.assign(res, {
        type: 'number',
      });
    }

    let attr: Partial<FieldProps> = {
      inputAlign: contentFont.value.textAlign || layout.value.inputAlign,
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

  const flexJustify = computed(() => {
    if (contentFont.value?.textAlign && is_v_table === false) {
      return contentFont.value?.textAlign === 'left'
        ? 'flex-start'
        : contentFont.value?.textAlign === 'center'
          ? 'center'
          : 'flex-end';
    }
    if (layout.value?.inputAlign && is_v_table === false) {
      return layout.value?.inputAlign === 'left' ? 'flex-start' : 'flex-end';
    }
    return 'flex-start';
  });

  onBeforeMount(async () => {
    initFieldWidgetRuntime(props, true)
      .then((fieldInfo) => {
        props.props.label = props.props.label || fieldInfo?.name;
        Object.assign(props.props, transformPropsField(fieldInfo.type, fieldInfo));
      })
      .catch((err) => {
        console.error(err);
        /**隐藏已经删除的字段 */
        // props.props.hidden = true;
      });
    getFileAttrs({ fieldKey: field, modelKey: modelKey });
  });
  defineExpose({
    focus() {
      comfield.value.focus();
    },
  });
</script>

<style lang="less" scoped>
  .van-field {
    --van-cell-font-size: 16px;
    --van-cell-value-font-size: 16px;
    --van-cell-line-height: 22px;
    --van-cell-vertical-padding: 16px;
    --van-cell-horizontal-padding: 16px;
  }

  :deep(.van-field__label--top) {
    margin-bottom: 16px;
  }

  :deep(.van-field__label) {
    min-width: v-bind("!labelLayout?.hasLabelWidth? '30%': 'auto'");
    color: v-bind('labelFont.color || ""');
    font-size: v-bind('labelFont.fontSize || ""');
    font-style: v-bind('labelFont.fontStyle || ""');
    font-weight: v-bind('labelFont.fontWeight || ""');
    text-align: v-bind('labelFont.textAlign || ""');
    text-decoration-line: v-bind('labelFont.textDecorationLine || ""');

    .label-ellipsis {
      display: inline-block;
      width: v-bind("required?'calc(100% - 18px)':'100%'");
      overflow: hidden;
      text-decoration-line: v-bind('labelFont.textDecorationLine || ""');
      text-overflow: ellipsis;
      vertical-align: top;
      white-space: nowrap;
    }
  }

  .van-cell {
    background: transparent;

    &::after {
      border: none;
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

  .file-display {
    :deep(.van-field__value) {
      width: 100%;
      overflow: visible;
    }

    :deep(.van-field__label--top) {
      margin-bottom: 0;
    }

    :deep(.van-field__control--custom) {
      min-height: auto;
    }
  }

  :deep(.van-field__body) {
    max-width: 100%;
    padding: v-bind("layout.inputBg && !notNeedBgColor?'11px 12px':''");
    border-radius: 4px;
    background-color: v-bind("layout.inputBg && !notNeedBgColor?'#f7f7f7':''");
    font-size: 16px;

    textarea {
      // padding-left: v-bind("layout.inputBg?'12px':''");
      text-align: left;
    }

    input {
      // background-color: v-bind("layout.inputBg?'#f7f7f7':''");
      // padding: v-bind("layout.inputBg?'10px 0':''");
      // padding-left: v-bind("layout.inputBg?'12px':''");
      // min-height: v-bind("layout.inputBg?'44px':''");
      text-align: v-bind(
        "contentFont.textAlign ? contentFont.textAlign : layout.inputAlign||'left'"
      );
    }

    .tag {
      display: inline-block;
    }

    .van-field__control--custom {
      justify-content: v-bind('flexJustify');
      text-align: v-bind(
        "contentFont.textAlign ? contentFont.textAlign : layout.inputAlign||'left'"
      );
    }
  }
  .van-field.has-currency {
    :deep(.van-field__body)::before {
      content: var(--currency-symbol);
      margin-right: 2px;
      color: var(--gct-color-text-6);
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
    // align-items: v-bind("layout.inputBg?'center':'flex-start'");
    align-items: center;
    height: auto;
    margin-left: -2px;
    // padding: v-bind("layout.inputBg?'10px 0':''");
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    background-color: v-bind("layout.inputBg?'#f7f7f7':''");
    line-height: inherit;
  }

  .van-field--error {
    //报错的时候样式调整上下布局
    :deep(.van-cell__value) {
      flex-direction: column;
    }
  }

  :deep(.van-cell__value) {
    display: flex;
    // align-items: center;
    justify-content: v-bind('flexJustify');
    text-align: v-bind("contentFont.textAlign ? contentFont.textAlign : layout.inputAlign||'left'");
    word-break: break-all;
    // padding-left: v-bind("layout.inputBg?'12px':''");
    & > .van-field__body {
      flex: 1;
    }
  }

  .tag-label-disabled {
    padding-left: v-bind("layout.inputBg?'12px':''");
    opacity: 1;
    color: var(--van-field-input-disabled-text-color);
  }

  :deep(.van-field__error-message--center) {
    // margin-left: 104px;
    text-align: left;
  }

  :deep(.van-field__error-message) {
    text-align: left;
  }

  :deep(.van-field__control--error) {
    .img-add {
      border: 1px dashed #ee0a24 !important;
    }
  }

  :deep(.van-field__control--error::placeholder) {
    color: #c6c6c6;
  }

  .readonly {
    :deep(.van-field__body textarea) {
      color: v-bind('contentFont.color ? contentFont.color : "#323233"');
      font-size: v-bind('contentFont.fontSize || ""');
      font-style: v-bind('contentFont.fontStyle || ""');
      font-weight: v-bind('contentFont.fontWeight || ""');
      line-height: 1.3;
      text-decoration-line: v-bind('contentFont.textDecorationLine || ""');
    }
  }
</style>
