<template>
  <div
    :id="`${widget!.id}`"
    class="widget-wrapper"
    :style="wrapperStyle"
    @click.stop="onSetClick"
    @mouseenter.self="onmouseenter"
    @mouseleave.self="onmouseleave"
    ref="rootRef"
    :design-active-item="!isWidgetSelected && !!widget!.name"
    :design-item-name="$t(widget!.name || '')"
  >
    <div>
      <slot></slot>
    </div>
    <!-- 如果存在children则不能有遮罩层否则会影响拖拽进 -->
    <div class="wrapper-full" v-if="hideMask"></div>
    <div
      class="wrapper-full-border"
      :class="[ns.is('hover', showHoverLine && isHover), ns.is('selected', isWidgetSelected)]"
    ></div>
    <WidgetWrapperActionBar
      :name="widget!.name"
      :is-hover="isHover"
      :is-active="isWidgetSelected"
      :is-info="isHover"
      :types="showActionTypes"
      :index="indexOfParentList"
      :is-container="!!widget!.children"
      @action="onAction"
      :rootRef="rootRef"
      v-if="(isHover || isWidgetSelected) && rootRef"
    />
  </div>
</template>

<script lang="ts" setup>
  import { inject, nextTick, computed, ref } from 'vue';
  import { widgetWrapperProps, useWidget } from '/@page-designer/hooks/useWidget';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useDesigner, useDesignerController } from '/@page-designer/hooks/useDesigner';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { isEmpty } from 'lodash-es';
  import { SCOPE, Platform, PanelEnum, FormComponents } from '/@page-designer/enum';
  import { platform, togglePanel } from '/@page-designer/hooks/usePage';
  import { eachTree } from '/@/utils/helper/treeHelper';
  import { useAsyncOperateField } from '/@page-designer/components/widgets/hooks/useAsyncFields';
  import allWidgetInfo from '../../schema';
  import { MaterialEnum } from '/@/enums/appEnum';
  import { useNamespace } from '@gct/runtime';
  import { WidgetWrapperActionBar } from './widget-wrapper-action-bar';

  const designer = useDesignerController();

  const emit = defineEmits(['select']);

  const ns = useNamespace('widget-wrapper');

  const rootRef = ref();
  const props = defineProps(widgetWrapperProps);
  const { setSelectedWidget, resetSelectedWidget, setFocusFormContainer } = useSelectedWidget();
  const { unBindAsyncStatus } = useAsyncOperateField();

  const { emitCache, pageJson, subTableModalState, subTableModalId, unbindLoByWidgetId } =
    useDesigner();
  const { wrapperStyle }: any = useStyle(props.widget!);
  const { isWidgetSelected, hideMask } = useWidget(props);
  const scope: SCOPE = inject('scope') || SCOPE.PAGE;
  // const widgetInScope = inject('widgetInScope');
  const inFormId = inject('inFormId', undefined);

  const isHover = computed<boolean>(() => {
    return designer.state.hoverEL === rootRef.value && isWidgetSelected.value === false;
  });

  const onmouseenter = () => {
    if (props.widget?.isReadonlyWidget) return;
    designer.pushStack(rootRef.value);
  };

  const onmouseleave = () => {
    if (props.widget?.isReadonlyWidget) return;
    designer.popStack(rootRef.value);
  };

  const showActionTypes = computed<string[]>(
    () => (props.actionTypes ?? ['drag', 'parent', 'delete']) as string[],
  );

  const onAction = (tag: string) => {
    if (props.action && props.action(tag)) {
      return;
    }
    if (tag === 'selectParent') {
      selectParentWidget();
    }
    if (tag === 'deleteWidget') {
      deleteWidget();
    }
  };

  const selectParentWidget = () => {
    if (isEmpty(props.parentWidget)) {
      togglePanel(PanelEnum.PAGE);
      resetSelectedWidget(scope);
    } else {
      setSelectedWidget(props.parentWidget, scope);
    }
  };

  const deleteWidget = () => {
    // if (props.deleteCallback) {
    //   props.deleteCallback();
    //   return;
    // }

    if (props.parentList) {
      var indexOfParentList = props.indexOfParentList;
      let nextSelected: LowCodeWidget.BasicSchema;
      if (props.parentList.length === 1) {
        if (props.parentWidget) {
          nextSelected = props.parentWidget;
        }
      } else if (props.parentList.length === 1 + indexOfParentList) {
        nextSelected = props.parentList[indexOfParentList - 1];
      } else {
        // 找当前节点后的第一个非自读组件，若没有，则找当前节点前的第一个非自读组件，若没有，则选中父节点
        const eIdx = props.parentList.findIndex(
          (e, i) => i > indexOfParentList && !e.isReadonlyWidget,
        );
        if (eIdx > -1) {
          nextSelected = props.parentList[eIdx];
        } else {
          const fIdx = props.parentList.findLastIndex(
            (e, i) => i < indexOfParentList && !e.isReadonlyWidget,
          );
          if (fIdx > -1) nextSelected = props.parentList[fIdx];
          else if (props.parentWidget) nextSelected = props.parentWidget;
        }
      }

      nextTick(() => {
        if (
          subTableModalState.value &&
          props.widget?.isField &&
          props.widget.materialType === MaterialEnum.MaterialSubTableModalField
        ) {
          unBindAsyncStatus(subTableModalId.value);
        }
        // eslint-disable-next-line vue/no-mutating-props
        props.parentList?.splice(indexOfParentList, 1);
        // 当操作按钮是关闭的情况不能选中
        if (
          isEmpty(nextSelected) ||
          (!isEmpty(nextSelected) &&
            nextSelected.type === FormComponents.BottomButtonContainer &&
            !pageJson.pageConfig.hasFooter)
        ) {
          togglePanel(PanelEnum.PAGE);
          resetSelectedWidget(scope);
        } else {
          setSelectedWidget(nextSelected, scope);
        }
        //删除组件的时候 要删除permissions的映射
        if (pageJson.permissions[props.widget!.id]) {
          delete pageJson.permissions[props.widget!.id];
        }
        unbindLoByWidgetId(props.widget!.id);
        eachTree(props.widget!.children! ?? [], (node: LowCodeWidget.BasicSchema) => {
          unbindLoByWidgetId(node.id);
          if (platform.value === Platform.WEB) {
            allWidgetInfo.webWidgetLoopCallback[node.type]?.(node, unbindLoByWidgetId);
          } else {
            allWidgetInfo.mobileWidgetLoopCallback[node.type]?.(node, unbindLoByWidgetId);
          }
        });
        emitCache();
      });
    }
  };

  const onSetClick = () => {
    if (props.widget?.isReadonlyWidget) {
      return;
    }
    emit('select', props.widget);
    setSelectedWidget(props.widget, scope);
    setFocusFormContainer(inFormId);
  };
  defineExpose({
    deleteWidget,
  });
</script>

<style lang="less" scoped>
  .widget-wrapper {
    position: relative;
    overflow: hidden;
    // border: 2px solid transparent;

    :deep(.ant-form-item) {
      margin-bottom: 0;
      padding: 12px 0;
    }

    .wrapper-full {
      position: absolute;
      z-index: 10;
      inset: 0;
    }

    .wrapper-full-border {
      position: absolute;
      z-index: 10;
      margin: 2px;
      inset: 0;
      pointer-events: none;
    }
  }

  .is-selected {
    z-index: 20;
    outline: hsl(from var(--ant-primary-color) h s 35%) solid 2px;
    // border: 2px solid var(--ant-primary-color);
  }

  :deep(.gct-widget-wrapper-action-bar) {
    background-color: hsl(from var(--ant-primary-color) h s 35%);
  }

  .is-hover {
    outline: var(--ant-primary-color) dashed 2px;
    // border: 2px dashed var(--ant-primary-color);
  }

  :deep(.van-checkbox .van-checkbox__icon .van-icon) {
    border-radius: 2px;
  }

  :deep(.app-quick-search.van-search) {
    background: inherit;

    .van-search__content .van-cell {
      padding: 0 8px 0 0;

      .van-field__left-icon {
        border-right: 1px solid #f0f0f0;
        color: var(--ant-primary-color);

        .van-icon {
          margin-right: 4px;
        }
      }
    }
  }
</style>
