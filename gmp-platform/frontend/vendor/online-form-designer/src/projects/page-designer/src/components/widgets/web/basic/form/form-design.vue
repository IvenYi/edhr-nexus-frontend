<template>
  <a-form :layout="widget.props.layout" :class="['gct-form-widget', 'relative']" :style="styleAttr">
    <!-- {{ children }} -->
    <!-- 此处为带children的组件的slot内容 -->
    <drag-widget-group
      v-if="!isNewDesigner"
      :parent-drag-widgets="widget.children"
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
  </a-form>
</template>

<script setup lang="ts" name="gct-form">
  import { provide, watch, toRef, toRefs } from 'vue';
  import { Form } from '/@page-designer/types/web';
  import DragWidgetGroup from '/@page-designer/designer/stage/drag/drag-widget-group.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModelField } from '/@/components/FieldTransfer/hooks/useModelField';

  const props = defineProps<{ widget: Form; isNewDesigner: boolean }>();
  const { clearSelectInfo, loadObjInfo } = useModelField();
  const { layout } = toRefs(props.widget.props);
  const formReadonly = toRef(() => props.widget.props.readonly);
  provide('formReadonly', formReadonly);
  // ! 组件是否在 form表单中
  provide('inFormId', props.widget.id);

  const labelLayout = toRef(() => {
    const width =
      layout?.value == 'horizontal' && !!props.widget.props.hasLabelWidth
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

  const { t } = useI18n();
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
  const styleAttr = toRef(() => {
    return {
      height: props.widget.style.height ? props.widget.style.height + 'px' : undefined,
    };
  });
</script>
<style scoped lang="less">
  :deep(.gct-vue3-dnd-item) {
    > .ant-form-item {
      margin-bottom: 0;
    }
  }

  .gct-form-widget {
    min-height: 80px;

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
        font-size: 16px;
        pointer-events: none;
      }
    }
  }
</style>
