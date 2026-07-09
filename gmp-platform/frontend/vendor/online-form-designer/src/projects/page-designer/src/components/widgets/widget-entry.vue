<template>
  <a-form-item
    v-if="widget.formItem"
    :required="!formReadonly && widget.props.required"
    :class="[
      widget.props.disabled ? 'from-item-disabled' : null,
      widget.props.readonly ? 'readonly-field-item' : '',
    ]"
  >
    <template
      #label
      v-if="
        widget.props.displayLabelText &&
        widget.type !== FormComponents.SubTable &&
        widget.type !== FormComponents.DynamicTable
      "
    >
      <span
        :title="widget.props.label || globFieldInfo.label"
        class="pl1px"
        :class="
          !!labelLayout?.hasLabelWidth && labelLayout?.layout == 'horizontal'
            ? labelLayout?.overLabelDisplay == 'ellipsis'
              ? 'label-ellipsis'
              : 'label-wrap'
            : ''
        "
      >
        {{ widget.props.label || globFieldInfo.label }}</span
      >
      <info-circle-outlined class="ml5px explain-icon" v-if="!!widget.props.showExplain" />
    </template>
    <div class="ks-row" v-if="deviceConnectivity">
      <slot :disabled="widget.props.disabled"></slot>
      <div class="max-h32px w22px! text-center ks-row-middle ml4px">
        <span class="gct-iconfont icon-icon_shebeihulian text-14px text-[#A6A6A6]"></span>
      </div>
    </div>
    <slot v-else :disabled="widget.props.disabled"></slot>
  </a-form-item>
  <slot v-else></slot>
</template>

<script setup lang="ts" name="widget-entry">
  import { onBeforeMount, provide, reactive, inject, computed } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { get } from 'lodash-es';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { FormComponents } from '/@page-designer/enum';

  const emit = defineEmits(['remove']);
  const props = defineProps(widgetProps);
  const { labelFont, contentFont }: any = useStyle(props.widget);
  const formReadonly = inject('formReadonly');
  const labelLayout = inject<any>('labelLayout', {});

  const globFieldInfo = reactive<any>({});

  const { allFormWidget } = useDesigner();
  const deviceConnectivity = computed(() => {
    return (
      props.widget.props.deviceConnectivity &&
      props.widget.props.fieldType !== FIELD_TYPE.MASTERSLAVE
    );
  });
  onBeforeMount(async () => {
    const { isCustomField, field, modelKey, fieldType } = props.widget.props;

    if (props.widget.isField) {
      // 删除设计器里已存在的在线表单字段
      if (fieldType === 'online_form') {
        emit('remove');
        return;
      }

      const fieldInfo = isCustomField
        ? getFormCustomFieldInfo(props.widget, field)
        : await FieldSchema.getConfigByField(modelKey, field);

      if (!fieldInfo || fieldInfo.type !== fieldType) {
        //这边小心误删
        !isCustomField && field && modelKey && emit('remove');
        console.error(`删除字段${props.widget.field}`, props.widget);
        return;
      }
      globFieldInfo.label = fieldInfo?.name;
      props.widget.props.fieldRequired = fieldInfo?.required;
      if (fieldInfo.required && !props.widget.props.readonly) {
        // eslint-disable-next-line vue/no-mutating-props
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
    const selectedForm = allFormWidget.value.filter((e) => e.id === widget.preLocation)[0];
    const customFieldList = selectedForm?.props.customFieldList || [];
    return customFieldList.filter((e) => e.key === fieldKey)[0] || {};
  };

  provide('globFieldInfo', globFieldInfo);
</script>

<style lang="less" scoped>
  :deep(.ant-form-item) {
    margin-bottom: 0;
  }

  :deep(.ant-form-item-label) {
    width: v-bind('labelLayout?.width');
    text-align: v-bind('labelFont.textAlign');

    > label {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }

    &:has(span.label-wrap) {
      overflow: visible;
      word-break: break-all;
      white-space: wrap;

      > label {
        align-items: start;
        max-height: none;
        margin-top: 5px;
      }
    }

    .label-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .explain-icon {
      color: var(--ant-primary-color) !important;
    }
  }

  :deep(.ant-form-item-control) {
    text-align: v-bind('contentFont.textAlign');

    .ant-form-item-control-input {
      .ant-form-item-control-input-content {
        .ant-input,
        .ant-picker .ant-picker-input input {
          text-align: v-bind('contentFont.textAlign');
        }
      }
    }
  }
</style>
<style lang="less">
  .from-item-disabled {
    .ant-form-item-label > label {
      color: rgb(0 0 0 / 25%);
    }
  }
</style>
