<!--
 * @Author: wangming
 * @Date: 2023-07-19 13:58:07
 * @LastEditors: wangming
 * @LastEditTime: 2023-07-19 15:02:19
 * @FilePath: /paas-main-front/src/projects/web-render/src/render/widget-entry.vue
 * @Description:
-->
<template>
  <a-form-item
    :rules="rules"
    :id="widget.id"
    :name="widget.props.field"
    v-if="widget.formItem"
    :style="wrapperStyle"
    style="overflow-y: auto"
    :class="[
      widget.props.disabled ? 'from-item--disabled' : null,
      widget.props.readonly ? 'readonly-field-item' : '',
    ]"
    v-bind="separatorAttr"
  >
    <template
      #label
      v-if="
        widget.props.displayLabelText &&
        widget.type !== FormComponents.SubTable &&
        widget.type !== FormComponents.DynamicTable
      "
    >
      <div
        :title="widget.props.label"
        :class="
          !!labelLayout?.hasLabelWidth && labelLayout?.layout == 'horizontal'
            ? labelLayout?.overLabelDisplay == 'ellipsis'
              ? 'label-ellipsis'
              : 'label-wrap'
            : ''
        "
      >
        {{ widget.props.label }}
        <a-tooltip v-if="!!widget.props.showExplain">
          <template #title> {{ widget.props.explain }}</template>
          <info-circle-outlined class="explain-icon ml5px" />
        </a-tooltip>
      </div>
    </template>
    <div class="ks-row-middle" v-if="deviceConnectivity">
      <slot :disabled="widget.props.disabled"></slot>
      <deviceIcon :widget="widget" @change="changeValue" :formData="formData" class="self-start" />
    </div>
    <slot v-else :disabled="widget.props.disabled"></slot>
  </a-form-item>
  <slot :id="widget.id" :style="wrapperStyle" v-else></slot>
</template>

<script lang="ts" setup>
  import { reactive, onMounted, computed, onBeforeMount, ref, toRef, inject } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { useValidator } from '/@page-designer/hooks/useValidator';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { FormComponents } from '/@page-designer/enum';
  import { transformPropsField } from '@gct/runtime';
  import { deviceIcon } from '/@/components/DeviceIntegration';

  const { t } = useI18n();
  const Event = getPageEvent();
  const subTableCustomValidateRules: Fn | undefined = inject(
    'subTableCustomValidateRules',
    undefined,
  );
  const validateRules: any[] | undefined = inject('validateRules', []);
  const props = defineProps<{
    widget: LowCodeWidget.BasicSchema;
    formData: { [key: string]: any } | undefined;
  }>();
  const labelLayout = inject('labelLayout', undefined);

  onBeforeMount(async () => {
    initFieldWidgetRuntime(props.widget)
      .then((fieldInfo) => {
        props.widget.props.label = props.widget.props.label || fieldInfo?.name;
        Object.assign(props.widget.props, transformPropsField(fieldInfo.type, fieldInfo));
      })
      .catch((err) => {
        /**隐藏已经删除的字段 */
        // props.widget.props.hidden = true;
      });

    /**应用国际化 */
    if (props.widget.i18n) {
      let i18n = props.widget.i18n;
      for (let k in i18n) {
        let i18nKey = i18n[k];
        props.widget.props[k] = t(i18nKey);
      }
    }
  });

  const { wrapperStyle, labelFont, contentFont } = useStyle(props.widget);
  const { rules } = useValidator({
    type: props.widget.type,
    widgetProps: props.widget.props as LowCodeWidget.FormItemProps,
    formData: props.formData,
    subTableCustomValidateRules,
    validateRules,
    Event,
  });
  const { fieldType, field } = reactive(props.widget.props as LowCodeWidget.FormItemProps);
  const fontAlign = toRef(() => {
    return [FIELD_TYPE.BOOLEAN, FIELD_TYPE.ENUM_MULTI, FIELD_TYPE.ENUM].includes(fieldType)
      ? contentFont.value.textAlign
      : 'left';
  });
  const separatorAttr = computed(() => {
    if (props.widget.props.readonly) {
      return {
        htmlFor: null,
      };
    }
    return {};
  });
  const deviceConnectivity = computed(() => {
    return (
      props.widget.props.deviceConnectivity &&
      props.widget.props.fieldType !== FIELD_TYPE.MASTERSLAVE
    );
  });

  function changeValue(v) {
    if (!props.formData) return;
    props.formData[field] = v;
  }
</script>

<style lang="less" scoped>
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

    &:has(div.label-wrap) {
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
    .ant-form-item-control-input {
      .ant-form-item-control-input-content {
        text-align: v-bind('fontAlign');

        .ant-input,
        .ant-select .ant-select-selector,
        .ant-picker .ant-picker-input input {
          text-align: v-bind('contentFont.textAlign');
        }
      }

      // &:has(div.ant-form-item-control-input-content > span.textarea-readonly-warp) {
      //   padding: 5px 0;
      // }
    }
  }
</style>
<style lang="less">
  .from-item--disabled {
    .ant-form-item-label > label {
      color: rgb(0 0 0 / 25%);
    }
  }

  .ant-form {
    .readonly-field-item.ant-form-item {
      padding: 8px 0;

      .ant-form-item-control-input {
        min-height: 32px;
      }
    }

    &.ant-form-vertical {
      .ant-form-item-control-input {
        min-height: 32px;
      }
    }
  }
</style>
