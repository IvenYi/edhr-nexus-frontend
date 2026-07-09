<template>
  <van-form
    :label-align="widget.props.layout.label"
    :input-align="widget.props.layout.inputAlign"
    :label-width="labelLayout.width"
    class="gct-mobile-form-widget"
    required="auto"
    :class="[(!widget.props.model || !widget.children?.length) && 'is-empty']"
  >
    <drag-widget-group
      v-if="!isNewDesigner"
      :parent-drag-widgets="children"
      :scope="scope"
      :parentWidget="widget"
      :show-placeholder="true"
      :data-placeholder="
        !widget.props.model && !widget.children?.length
          ? t('sys.pageDesigner.selectAssociatedModel')
          : !widget.children?.length
            ? t('sys.pageDesigner.selectCmpFieldTip')
            : ''
      "
    />
    <slot
      v-if="isNewDesigner === true"
      :parentWidget="widget"
      :children="widget.children"
      :config="{ direction: 'horizontal' }"
      :dragPlaceholder="
        !widget.props.model && !widget.children?.length
          ? t('sys.pageDesigner.selectAssociatedModel')
          : !widget.children?.length
            ? t('sys.pageDesigner.selectCmpFieldTip')
            : null
      "
    ></slot>
  </van-form>
</template>

<script setup lang="ts" name="gct-form">
  import { Form } from '/@page-designer/types/mobile';
  import { toRefs, inject, provide, watch, toRef } from 'vue';
  import { SCOPE } from '/@page-designer/enum';
  import DragWidgetGroup from '/@page-designer/designer/stage/drag/drag-widget-group.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModelField } from '/@/components/FieldTransfer/hooks/useModelField';

  const { t } = useI18n();
  const { clearSelectInfo, loadObjInfo } = useModelField();
  const props = defineProps<{ widget: Form; isNewDesigner: boolean }>();
  const { children } = toRefs(props.widget);
  const scope: SCOPE = inject('scope') || SCOPE.PAGE;
  // ! 组件是否在 form表单中
  provide('inFormId', props.widget.id);
  // 表单的输入框背景是否开启需要provide下去
  const layout = toRef(() => props.widget.props.layout || {});

  provide('form-layout', layout);
  const labelLayout = toRef(() => {
    const width =
      layout?.value.label === 'left' && !!props.widget.props.hasLabelWidth
        ? props.widget.props.labelWidth + (props.widget.props.labelType == 'percent' ? '%' : 'px')
        : '';

    return {
      width,
      layout: layout?.value,
      hasLabelWidth: props.widget.props.hasLabelWidth,
      overLabelDisplay: props.widget.props.overLabelDisplay,
    };
  });

  provide('labelLayout', labelLayout);
  const formReadonly = toRef(() => props.widget.props.readonly);

  provide('formReadonly', formReadonly);
  watch(
    () => props.widget.props.refParentModelkey,
    (v) => {
      clearSelectInfo();
      loadObjInfo(props.widget.props.model!, {
        formId: props.widget.id,
        childParentModelKey: v,
      });
    },
  );
  watch(
    () => props.widget.props.model,
    (v) => {
      clearSelectInfo();
      if (v) {
        loadObjInfo(v!, {
          formId: props.widget.id,
          childParentModelKey: props.widget.props.refParentModelkey,
        });
      }
    },
  );
</script>
<style scoped lang="less">
  .gct-mobile-form-widget {
    min-height: 178px;
    // background-color: #fafafa;

    &.is-empty {
      &::before {
        content: attr(data-placeholder);
        display: flex;
        position: absolute;
        top: 0;
        left: 0;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        // background-color: #f9f9f9;
        color: #bfbfbf;
        pointer-events: none;
      }
    }
  }

  // .nochildren {
  //   background-image: url('@/assets/images/import.png');
  //   background-repeat: no-repeat;
  //   background-position: center;
  //   background-size: 200px;
  // }
  :deep(.van-cell) {
    padding: 12px;
    // background: inherit;
    // .van-cell__value .van-field__body .van-cell {
    //   padding: 0;
    // }
  }
</style>
