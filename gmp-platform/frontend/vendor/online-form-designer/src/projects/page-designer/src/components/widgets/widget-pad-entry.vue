<template>
  <div v-if="widget.formItem">
    <van-field
      :required="widget.props.required"
      :disabled="widget.props.disabled"
      v-bind="separatorAttr"
      :class="[
        isSubTable ? 'sub-table-warp' : '',
        !notNeedBgColor ? 'mobile-entry-van-field' : '',
        [FIELD_TYPE.SIGNATURE, FIELD_TYPE.ATTACHMENT, FIELD_TYPE.IMAGE].includes(fieldType)
          ? 'file-display'
          : '',
      ]"
      :label-width="
        !!labelLayout?.hasLabelWidth && labelLayout?.layout?.label == 'left'
          ? labelLayout?.width
          : 'auto'
      "
    >
      <template #label v-if="widget.props.displayLabelText && !isSubTable">
        <span
          :class="
            !!labelLayout?.hasLabelWidth && labelLayout?.layout?.label === 'left'
              ? labelLayout?.overLabelDisplay == 'ellipsis'
                ? 'label-ellipsis'
                : 'label-wrap'
              : ''
          "
        >
          {{ widget.props.label || globFieldInfo.label }}
        </span>
      </template>
      <template #input>
        <slot :disabled="widget.props.disabled" class="widget label-ellipsis"></slot>
      </template>
    </van-field>
    <div v-if="showCard && imgSrc">
      <div class="cardbox mb16px">
        <img :src="imgSrc" />
      </div>
      <div class="more pb16px text-center primary-gct" v-if="fieldType === FIELD_TYPE.REF_MULTI">
        <div> 查看更多 <van-icon name="arrow-down" /> </div>
      </div>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts" name="widget-pad-entry">
  import {
    computed,
    toRefs,
    ref,
    inject,
    onBeforeMount,
    reactive,
    provide,
    toRef,
    watch,
    Ref,
  } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { FormComponents, BindCmpStyleEnum } from '/@page-designer/enum';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { get } from 'lodash-es';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { gctMemoizeAsync } from '@gct/base';
  import { getCommonInfoCardGetById } from '/@/apis/gct-apaas/CommonInfoCardController';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';

  const emit = defineEmits(['remove']);
  const { getFileAttrs, attrObj } = useAsyncFileAttrs();
  const props = defineProps(widgetProps);
  const { labelFont = {}, contentFont }: any = useStyle(props.widget);
  const imgSrc = ref('');
  const { fieldType, refCard, refCardId, readonly, bindModelKey, maxCount, bindCompStyleType } =
    toRefs(props.widget.props);
  const noFieldTypeArr = ref<any>([FormComponents.GenCheckbox, FormComponents.GenRadio]);
  const formReadonly = <Ref<boolean>>inject('formReadonly', false);
  const showCard = toRef(() => {
    return (
      (fieldType?.value === FIELD_TYPE.REF ||
        fieldType?.value === FIELD_TYPE.REF_MULTI ||
        fieldType?.value === FIELD_TYPE.RDO_REF) &&
      refCard?.value &&
      refCardId?.value &&
      (formReadonly.value || readonly?.value)
    );
  });
  const createCardApi = gctMemoizeAsync(async (id, modelKey) => {
    const data = await getCommonInfoCardGetById({
      id,
      modelKey,
      type: 'CARD',
    });
    return data.screenShoot;
  });
  watch(
    [refCardId, showCard],
    async () => {
      if (showCard.value) {
        imgSrc.value = await createCardApi(refCardId.value, bindModelKey.value);
      } else {
        imgSrc.value = '';
      }
    },
    {
      immediate: true,
    },
  );
  const globFieldInfo = reactive<any>({});

  const { allFormWidget, getWidgetByScope } = useDesigner();

  const layout = inject('form-layout', {});

  const labelLayout = inject('labelLayout', {});
  const separatorAttr = computed(() => {
    if (noFieldTypeArr.value.includes(props.widget.type)) {
      return {
        labelAlign: 'top',
      };
    }
    if (!fieldType?.value) {
      return {};
    }
    if (
      [FIELD_TYPE.LONG_TEXT, FIELD_TYPE.TEXT].includes(fieldType.value) &&
      bindCompStyleType.value === BindCmpStyleEnum.CMP_TEXTAREA
    ) {
      return {
        labelAlign: 'top',
        inputAlign: 'left',
      };
    }

    if ([FIELD_TYPE.ATTACHMENT, FIELD_TYPE.SIGNATURE, FIELD_TYPE.IMAGE].includes(fieldType.value)) {
      return {
        labelAlign: 'top',
        inputAlign: 'left',
      };
    }

    return { inputAlign: contentFont.value.textAlign };
  });

  const isSubTable = computed(() => {
    return [FormComponents.SubTable, FormComponents.DynamicTable].includes(props.widget.type);
  });

  const notNeedBgColor = computed(() => {
    return (
      [
        // FormComponents.Switch,
        FormComponents.UploadFile,
        FormComponents.UploadImage,
        FormComponents.SubTable,
        FormComponents.Signature,
      ].includes(props.widget.type) ||
      props.widget?.props?.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN
    );
  });

  // const needBorder = computed(() => {
  //   return (
  //     layout.value.label == 'top' &&
  //     !layout.value.inputBg &&
  //     fieldType.value !== FIELD_TYPE.MASTERSLAVE
  //   );
  // });

  const cardListWidget = computed(() => {
    return getWidgetByScope(FormComponents.CardList);
  });

  onBeforeMount(async () => {
    const { isCustomField, field, modelKey, fieldType } = props.widget.props;
    getFileAttrs({ fieldKey: field, modelKey: modelKey });
    if (props.widget.isField) {
      const fieldInfo = isCustomField
        ? getFormCustomFieldInfo(props.widget, field)
        : await FieldSchema.getConfigByField(modelKey, field);
      if (!fieldInfo || fieldInfo.type !== fieldType) {
        //这边小心误删
        !isCustomField && field && modelKey && emit('remove');
        console.error(`删除字段${props.widget.field}`, props.widget);
        return;
      }
      globFieldInfo.label = fieldInfo.name;
      props.widget.props.fieldRequired = fieldInfo.required;
      if (fieldInfo.required && !props.widget.props.readonly) {
        props.widget.props.required = true;
      }
      if (
        [FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI, FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI].includes(
          props.widget.props.fieldType,
        ) &&
        get(fieldInfo, 'defaultValue.type') === FieldDefaultValueTypeEnum.SYS_VAR
      ) {
        globFieldInfo.defaultMain = get(fieldInfo, 'defaultValue.value');
      } else if (
        [FIELD_TYPE.DATE, FIELD_TYPE.DATE_TIME, FIELD_TYPE.TIME].includes(
          props.widget.props.fieldType,
        ) &&
        get(fieldInfo, 'defaultValue.type') === FieldDefaultValueTypeEnum.SYS_VAR
      ) {
        globFieldInfo.defaultSysDate = get(fieldInfo, 'defaultValue.value');
      } else if (get(fieldInfo, 'defaultValue.type') === FieldDefaultValueTypeEnum.FIXED) {
        globFieldInfo.defaultValue = get(fieldInfo, 'defaultValue.value');
      }
    }
  });

  // 从当前表单scheme中获取自定义字段信息列表
  const getFormCustomFieldInfo = (widget, fieldKey) => {
    if (widget.formItem) {
      const formList = [...allFormWidget.value, ...cardListWidget.value];
      const selectedForm = formList.filter((e) => e.id === widget.preLocation)[0];
      const customFieldList = selectedForm?.props.customFieldList || [];
      return customFieldList.filter((e) => e.key === fieldKey)[0] || {};
    } else {
      return {
        name: widget.props.label,
        ...widget,
      };
    }
  };

  const flexJustify = computed(() => {
    if (contentFont.value?.textAlign) {
      return contentFont.value?.textAlign === 'left'
        ? 'flex-start'
        : contentFont.value?.textAlign === 'center'
        ? 'center'
        : 'flex-end';
    }
    if (layout.value?.inputAlign) {
      return layout.value?.inputAlign === 'left' ? 'flex-start' : 'flex-end';
    }
    return 'flex-start';
  });

  provide('globFieldInfo', globFieldInfo);
</script>

<style lang="less" scoped>
  .van-field {
    --van-cell-font-size: 16px;
    --van-cell-value-font-size: 16px;
    --van-cell-line-height: 1.375;
    --van-cell-vertical-padding: 16px;
    --van-cell-horizontal-padding: 16px;
  }

  :deep(.van-field) {
    .van-field__label {
      justify-content: v-bind('labelFont.textAlign');
      min-width: v-bind("!labelLayout?.hasLabelWidth? '30%': 'auto'");
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-align: v-bind("labelFont.textAlign || 'left'");
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }

    .van-field__label--top {
      margin-bottom: 16px;
    }
  }

  :deep(.van-field:not(.van-field--disabled) .van-field__label) {
    color: v-bind('labelFont.color');

    .label-ellipsis {
      display: inline-block;
      width: v-bind("widget.props.required?'calc(100% - 18px)':'100%'");
      overflow: hidden;
      text-decoration-line: v-bind('labelFont.textDecorationLine');
      text-overflow: ellipsis;
      vertical-align: top;
    }
  }

  :deep(.van-field--disabled) {
    .van-badge__wrapper.van-cell__right-icon {
      opacity: 0.5;
    }
  }

  :deep(.app-design-select.van-field.van-cell) {
    padding: 0;
  }

  :deep(.app-design-input.van-field.van-cell) {
    padding: 0;
  }

  :deep(.app-upload-image.van-uploader .van-uploader__upload) {
    margin: 0;
  }

  :deep(.app-upload-file-btn.van-button.van-button--primary) {
    border-color: #d9d9d9;
  }

  // :deep(.van-cell) {
  //   background-color: inherit;
  // }
  // .border-cell {
  //   border-bottom: 1px solid #e8ebf0;
  // }

  :deep(.mobile-entry-van-field.van-field > .van-field__value > .van-field__body) {
    padding: v-bind("layout.inputBg&& bindCompStyleType !== BindCmpStyleEnum.CMP_TIME?'11px 0':''");
    border-radius: 4px;
    background-color: v-bind(
      "layout.inputBg&& bindCompStyleType !== BindCmpStyleEnum.CMP_TIME?'#F9FAFB':''"
    );

    textarea {
      text-align: v-bind("contentFont.textAlign || 'left'");
      padding-left: v-bind(
        "layout.inputBg&& bindCompStyleType !== BindCmpStyleEnum.CMP_TIME?'12px':''"
      );
    }

    input {
      padding-left: v-bind(
        "layout.inputBg&& bindCompStyleType !== BindCmpStyleEnum.CMP_TIME?'12px':''"
      );
      // min-height: v-bind("layout.inputBg?'44px':''");
      text-align: v-bind(
        "contentFont.textAlign ? contentFont.textAlign : layout.inputAlign||'left'"
      );
    }

    .van-field__control--custom {
      justify-content: v-bind('flexJustify');
      text-align: v-bind(
        "contentFont.textAlign ? contentFont.textAlign : layout.inputAlign||'left'"
      );
      &>div>span {
        padding-left: v-bind(
          "layout.inputBg && bindCompStyleType !== BindCmpStyleEnum.CMP_TIME?'12px':''"
        );
      }
    }

    .time-input__body {
      input {
        width: v-bind("layout.inputBg?'32px':'24px'");
        height: v-bind("layout.inputBg?'32px':'24px'");
        border-width: v-bind("layout.inputBg?'1px':0");
        background-color: v-bind("layout.inputBg?'#f7f7f7':''");
      }

      span {
        line-height: v-bind("layout.inputBg?'32px':'24px'");
      }
    }

    .van-cell__right-icon {
      display: flex;
      align-items: center;
      height: auto;
      margin-left: 0;
      background-color: v-bind("layout.inputBg?'#f7f7f7':''");
    }
  }

  .sub-table-warp.van-cell {
    padding: 0;
  }

  :deep(.van-field__value) {
    display: flex;
    align-items: 'center';
    justify-content: v-bind('flexJustify');
    overflow: hidden;
    text-align: v-bind("contentFont.textAlign ? contentFont.textAlign : layout.inputAlign||'left'");

    & > .van-field__body {
      flex: 1;
      max-width: 100%;
    }

    .tag {
      display: inline-block;
    }
  }

  .file-display {
    :deep(.van-field__value) {
      overflow: visible;
    }

    :deep(.van-field__label--top) {
      margin-bottom: 0;
    }

    :deep(.van-field__control--custom) {
      min-height: auto;
    }
  }

  :deep(.van-cell) {
    &::after {
      border: none;
    }
  }

  .label-ellipsis {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .label-wrap {
    word-break: break-all;
    white-space: wrap;
  }

  .more {
    border-bottom: 1px solid #e0e3eb;
  }

  .cardbox {
    padding: 0 6px;

    img {
      width: 100%;
      overflow: hidden;
      border-radius: 4px;
      background: #fff;
      box-shadow: 0 2px 6px 0 rgb(0 0 0 / 10%);
    }
  }
</style>
