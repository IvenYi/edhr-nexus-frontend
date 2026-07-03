<template>
  <a-form
    :layout="widget.props.layout"
    :class="[
      'gct-form-widget',
      'relative',
      (!widget.props.model || !widget.children?.length) && 'is-empty',
      !widget.children?.length && 'minHeight',
      isNewDesigner ? 'new-designer' : '',
    ]"
    :data-placeholder="
      !widget.props.model && !widget.children?.length
        ? t('sys.pageDesigner.selectAssociatedModel')
        : !widget.children?.length
        ? t('sys.pageDesigner.selectModelFields')
        : ''
    "
  >
    <!-- 此处为带children的组件的slot内容 -->
    <desc-drag v-if="!isNewDesigner" :children="widget.children" :widget="widget" />
    <slot
      :parentWidget="widget"
      :children="widget.children"
      :config="{ type: 'descriptions', direction: column > 1 ? 'vertical' : 'horizontal' }"
      :props="{ style: { '--gct-descriptions-layout-count': column } }"
    ></slot>
  </a-form>
</template>

<script setup lang="ts" name="gct-descriptions">
  import { provide, toRef, toRefs, computed } from 'vue';
  import { Descriptions } from '/@page-designer/types/web';
  import DescDrag from './component/desc-drag.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps<{ widget: Descriptions; isNewDesigner: boolean }>();

  // ! 组件是否在 form表单中
  provide('inFormId', props.widget.id);
  const { layout } = toRefs(props.widget.props);
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

  const column = computed(() => {
    return props.widget.props.column || 1;
  });
</script>
<style scoped lang="less">
  .gct-form-widget {
    // 一行显示几个元素
    --gct-descriptions-layout-count: 1;

    :deep(.gct-vue3-dnd-container) {
      display: flex;
      flex-wrap: wrap;
    }

    :deep(.is-expansion) {
      .gct-vue3-dnd-item {
        width: calc(
          100% / var(--gct-descriptions-layout-count) - var(--vue3-dnd-drop-line-width) *
            var(--gct-descriptions-layout-count) - var(--vue3-dnd-drop-line-width)
        );
      }
    }

    :deep(.gct-vue3-dnd-item) {
      width: calc(100% / var(--gct-descriptions-layout-count));
    }

    :deep(.gct-vue3-dnd-drop-line) {
      align-self: stretch;
      min-height: unset;
      height: unset;
    }

    &.minHeight {
      min-height: 80px;
    }

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
        background-color: #fbfbfc;
        color: #5d6474;
        font-size: 14px;
        pointer-events: none;
      }
    }

    &.new-designer {
      height: 100%;
    }
  }

  .gct-form-widget.ant-form-vertical {
    :deep(.gct-vue3-dnd-item) {
      > .ant-row {
        > .ant-col {
          min-height: unset;
        }
      }
    }
  }

  :deep(.ant-form) {
    :deep(.ant-form-item) {
      margin-bottom: 0;
    }
  }
</style>
