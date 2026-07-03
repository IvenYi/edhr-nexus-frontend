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
          ? $t('sys.pageDesigner.selectAssociatedModel')
          : !widget.children?.length
          ? $t('sys.pageDesigner.selectCmpFieldTip')
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
<script setup lang="ts" name="gct-rdo-form">
  import { provide, toRef, watch } from 'vue';
  import DragWidgetGroup from '/@page-designer/designer/stage/drag/drag-widget-group.vue';
  import { ITxnDataCollection } from './schema';
  import { useModelField } from '/@/components/FieldTransfer/hooks/useModelField';

  const { clearSelectInfo, loadObjInfo } = useModelField();
  const props = defineProps<{ widget: ITxnDataCollection; isNewDesigner: boolean }>();
  const formReadonly = toRef(() => props.widget.props.readonly);
  provide('formReadonly', formReadonly);
  // ! 组件是否在 form表单中
  provide('inFormId', props.widget.id);

  const t = window.$t;

  const styleAttr = toRef(() => {
    return {
      height: props.widget.style.height ? props.widget.style.height + 'px' : undefined,
    };
  });

  /**切换模型的时候更新字段 */
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
  .gct-form-widget {
    min-height: 80px;
    // padding: 12px;
    // background-color: #f9f9f9;

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
        font-size: 16px;
        pointer-events: none;
      }
    }
  }

  // .nochildren {
  //   background-image: url('@/assets/images/import.png');
  //   background-repeat: no-repeat;
  //   background-position: center;
  //   background-size: 200px auto;
  // }
</style>
