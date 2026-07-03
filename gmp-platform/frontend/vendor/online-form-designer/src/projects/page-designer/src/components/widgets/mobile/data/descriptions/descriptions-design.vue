<template>
  <van-form
    :label-align="widget.props.layout.label"
    :input-align="widget.props.layout.inputAlign"
    :label-width="labelLayout.width"
    class="gct-mobile-form-widget"
  >
    <!-- {{ children }} -->
    <!-- 此处为带children的组件的slot内容 -->
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
          ? t('sys.pageDesigner.selectModelFields')
          : ''
      "
    />
    <slot
      v-if="isNewDesigner"
      :parentWidget="widget"
      :children="widget.children"
      :config="{ type: 'descriptions', direction: 'horizontal' }"
    ></slot>
  </van-form>
</template>

<script setup lang="ts" name="gct-descriptions">
  import { Descriptions } from '/@page-designer/types/mobile';
  import { toRefs, inject, provide, toRef } from 'vue';
  import { WidgetInScopeEnum, SCOPE } from '/@page-designer/enum';
  import DragWidgetGroup from '/@page-designer/designer/stage/drag/drag-widget-group.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{ widget: Descriptions; isNewDesigner: boolean }>();
  const { children } = toRefs(props.widget);
  const scope: SCOPE = inject('scope') || SCOPE.PAGE;
  // ! 组件是否在 form表单中
  provide('inFormId', props.widget.id);
  // 表单的输入框背景是否开启需要provide下去
  const layout = toRef(() => props.widget.props.layout || {});
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
  provide('form-layout', layout);
  const formReadonly = toRef(() => true);

  provide('formReadonly', formReadonly);
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
        background-color: #f9f9f9;
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
    padding: 14px 12px;
  }
</style>
