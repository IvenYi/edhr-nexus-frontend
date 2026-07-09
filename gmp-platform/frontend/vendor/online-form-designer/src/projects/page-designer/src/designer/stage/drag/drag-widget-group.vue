<!-- 该组件为业务组件 只为了多地方重复使用时不过长 -->
<template>
  <div
    ref="widgetGroupRef"
    style="height: 100%; min-height: inherit"
    :data-placeholder="showPlaceholderText"
    :class="[
      'overflow-y-auto',
      'overflow-x-hidden',
      'widget-drag-wrap',
      { 'no-children': showPlaceholder && !parentDragWidgets.length },
    ]"
  >
    <widget-drag
      :widgets="parentDragWidgets"
      :group="widgetInScope"
      :styleProp="styleProp"
      :data-inFormId="inFormId"
      :parentWidget="parentWidget"
      @add="handleAdd"
      @update="emitCache"
      @move="checkWidgetMove"
      :isPut="isPut"
    >
      <template #default="slotProps">
        <!-- widget-wrapper -->
        <widget-wrapper
          ref="dragWidgetGroupWrapperRef"
          v-if="slotProps.element[widgetTypeKey] !== 'bottom-button-container'"
          :key="slotProps.element.id"
          :widget="slotProps.element"
          :parent-list="parentDragWidgets"
          :parent-widget="parentWidget"
          :index-of-parent-list="slotProps.index"
        >
          <!-- widget-entry -->
          <component :is="widgetEntry" :widget="slotProps.element" v-slot="slotData">
            <!-- widget -->
            <component
              :is="getAsyncWidget(slotProps.element[widgetTypeKey])"
              :rowReadonly="formReadonly || parentWidget?.props.readonly"
              :widget="slotProps.element"
              v-bind="slotData || {}"
              @deleteOneself="deleteFunc"
            />
          </component>
        </widget-wrapper>
      </template>
    </widget-drag>
    <slot name="modal"></slot>
  </div>
</template>

<script setup lang="ts" name="drag-widget-group">
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import WidgetDrag from '/@page-designer/components/widget-drag/widget-drag.vue';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useAsyncOperateField } from '/@page-designer/components/widgets/hooks/useAsyncFields';
  import { inject, computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const formReadonly = inject('formReadonly');
  const dragWidgetGroupWrapperRef = ref();
  const { t } = useI18n();
  const emit = defineEmits(['add']);
  const {
    subTableModalId,
    checkWidgetMove,
    emitCache,
    handleAddDrag,
    getAsyncWidget,
    widgetEntry,
  } = useDesigner();

  const { unBindAsyncStatus } = useAsyncOperateField();
  const props = defineProps({
    parentDragWidgets: {
      type: Array<LowCodeWidget.BasicSchema>,
      default: [],
    },
    widgetTypeKey: {
      type: String,
      default: 'type',
    },
    parentWidget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
      default: () => {},
    },
    styleProp: {
      type: Object,
    },
    showPlaceholder: {
      type: Boolean,
      default: false,
    },
    placeholderText: {
      type: String,
      default: '', // 由于目前很多组件都已加了提示文本，故，暂时不加默认值
    },
    // 特殊逻辑是否允许放入，一旦拦截原有逻辑将失效
    isPut: {
      type: Function as PropType<(parent: IData, widget: IData) => boolean | null>,
    },
  });
  const widgetInScope = inject<string>('widgetInScope');
  const scope = inject('scope');
  // ! 组件是否在 form表单中
  const inFormId = inject('inFormId', undefined);

  const widgetGroupRef = ref();

  const showPlaceholderText = computed(() => {
    if (!props.showPlaceholder) return '';
    else {
      return !props.parentDragWidgets.length
        ? props.placeholderText || t('sys.pageDesigner.dragWidgetHere')
        : '';
    }
  });

  const handleAdd = ({ evt, list }) => {
    const { newIndex, from } = evt;
    handleAddDrag(newIndex, props.parentDragWidgets, scope, inFormId);
    emit('add', { evt, list });
    if (from && from.className === 'field-list' && from.dataset.fieldLocation === 'subTable') {
      unBindAsyncStatus(subTableModalId.value);
    }
  };

  const deleteFunc = () => {
    dragWidgetGroupWrapperRef.value?.deleteWidget();
  };
  defineExpose({
    $ref: widgetGroupRef,
  });
</script>

<style lang="less" scoped>
  .widget-drag-wrap {
    position: relative;

    &::before {
      content: attr(data-placeholder);
      display: flex;
      position: absolute;
      top: 0;
      right: 0;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #5d6474;
      font-size: 14px;
      pointer-events: none;
    }
  }
  .van-form,
  .van-col,
  .grid-col {
    .no-children {
      background-color: #e6e9ef;
    }
  }
</style>
