<template>
  <a-form-item
    v-if="widget.formItem"
    :id="widget.id"
    :name="widget.props.field"
    :style="wrapperStyle"
    :class="[
      widget.props.disabled ? 'from-item--disabled' : null,
      widget.props.readonly ? 'readonly-field-item' : '',
    ]"
    v-bind="separatorAttr"
  >
    <template #label v-if="widget.props.displayLabelText">
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

    <component
      v-model:modelValue="value"
      :formData="formRowData"
      :is="defComponet"
      :widget="widget"
      :ref="onload"
      :isTooltip="isTooltip"
      :disabled="widget.props.disabled"
    >
      <template v-for="(_value, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}"></slot>
      </template>
    </component>
  </a-form-item>
  <slot v-else :id="widget.id" :style="wrapperStyle"></slot>
</template>

<script lang="ts" setup>
  import { reactive, computed, onBeforeMount, toRef, inject } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { AsyncGctComponents } from '/@page-designer/components/pcModule';
  import { useDependency } from '/@/projects/web-render/src/render/Event/Dependency/useDependency';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const { t } = useI18n();
  const NO_TOOLTIP = [FIELD_TYPE.IMAGE, FIELD_TYPE.ATTACHMENT, FIELD_TYPE.SIGNATURE];
  const props = defineProps<{
    widget: LowCodeWidget.BasicSchema;
    formData: { [key: string]: any } | undefined;
  }>();
  const Event = getPageEvent();
  const labelLayout = inject('labelLayout');
  const defComponet = computed(() => {
    if (props.widget && props.widget._plugin) {
      return AsyncGctComponents.getComponentByPluginTag(props.widget._plugin.key);
    }
    return AsyncGctComponents.getComponentByType(props.widget.type);
  });
  const { value, formRowData } = useDependency(props.widget, props.formData);
  const { isField, id, type } = props.widget;
  const { field, notSubmitInHide } = props.widget.props;
  const { wrapperStyle, labelFont, contentFont } = useStyle(props.widget);
  const { fieldType } = reactive(props.widget.props as LowCodeWidget.FormItemProps);
  const fontAlign = toRef(() => {
    return [FIELD_TYPE.BOOLEAN, FIELD_TYPE.ENUM_MULTI, FIELD_TYPE.ENUM].includes(
      fieldType as FIELD_TYPE,
    )
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

  const isTooltip = computed(() => {
    return (
      props.widget.props.readonly &&
      value.value &&
      !NO_TOOLTIP.includes(props.widget.props.fieldType!)
    );
  });

  const onload = async (el) => {
    //隐藏不提交的字段 notSubmitInHide开启表示隐藏提交
    if (isField && field && notSubmitInHide === false) {
      if (!formRowData.value._NOSUBMIT) {
        formRowData.value._NOSUBMIT = {};
      }
      //开启隐藏不提交的需要再formData提交的时候打上标识，方便提交的时候删除字段
      formRowData.value._NOSUBMIT[id] = !el ? field : undefined;
    }
    if (!!el) {
      Event.initNode(id, { elRef: el, type });
    } else {
      Event.destroyNode(id);
    }
  };

  onBeforeMount(async () => {
    initFieldWidgetRuntime(props.widget).then((fieldInfo) => {
      props.widget.props.label = props.widget.props.label || fieldInfo?.name;
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
</script>

<style lang="less" scoped name="container-search-form-item">
  :deep(.ant-form-item-label) {
    text-align: v-bind('labelFont?.textAlign');
    width: v-bind('labelLayout?.width');

    > label {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }
    &:has(div.label-wrap) {
      white-space: wrap;
      overflow: visible;
      > label {
        margin-top: 5px;
        max-height: none;
        align-items: start;
      }
    }
    .label-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
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
      padding: 12px 0;

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
