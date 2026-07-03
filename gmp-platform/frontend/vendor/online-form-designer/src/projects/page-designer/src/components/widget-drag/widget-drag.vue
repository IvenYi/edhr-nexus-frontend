<template>
  <draggable
    ghost-class="gct-dragClass"
    forceFallback
    class="widget-drag"
    :list="widgetsList"
    draggable=".widget-item--draggable"
    :animation="300"
    :group="{
      name: group,
      pull: onPull,
      put: onPut,
    }"
    item-key="id"
    @move="moveCallback"
    @add="addCallback"
    @update="updateCallback"
    @start="startCallback"
    @end="endCallback"
  >
    <template #item="{ element, index }">
      <div
        :key="element.id"
        :data-cmpType="element.type"
        :data-cmpName="getCmpName(element)"
        :data-preLocation="element.preLocation"
        :data-hasField="containerHasField(element)"
        :data-inContainer="containerHasFormOrField(element)"
        :class="{
          'inline-block': element.display === DisplayEnums.INLINE_BLOCK,
          'widget-item--draggable': !disableDrag(element.type),
        }"
        :style="styleProp"
      >
        <slot :element="element" :index="index"></slot>
      </div>
    </template>
  </draggable>
</template>

<script lang="ts" setup name="widget-drag">
  import draggable from 'vuedraggable';
  import { DisplayEnums, FormComponents } from '/@page-designer/enum';
  import { LowCodeWidget } from '../../types/widget-basic-types';
  import { findNodeAll } from '/@/utils/helper/treeHelper';
  import { isFormFieldType } from '/@page-designer/schema/utils';
  import { clone, cloneDeep, has } from 'lodash-es';
  import { PropType, computed } from 'vue';
  import { useDesignerController } from '../../hooks/useDesigner';
  import { isDropAllowed } from '../../utils';

  const designer = useDesignerController();

  // display
  const emit = defineEmits(['add', 'update', 'move']);
  const props = defineProps({
    parentWidget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
      required: true,
    },
    widgets: {
      type: Array<LowCodeWidget.BasicSchema>,
      default: [],
    },
    group: {
      type: String,
      default: 'gct',
    },
    styleProp: {
      type: Object,
    },
    // 特殊逻辑是否允许放入，一旦拦截原有逻辑将失效
    isPut: {
      type: Function as PropType<(parent: IData, widget: IData) => boolean | null>,
    },
    isReverse: {
      type: Boolean,
      default: false,
    },
  });

  const widgetsList = computed(() => {
    if (!props.widgets) return [];
    const list = props.isReverse ? [...props.widgets].reverse() : props.widgets;
    return list;
  });

  // 新增回调
  const addCallback = (evt: any) => {
    const _list = props.isReverse ? cloneDeep(widgetsList.value).reverse() : widgetsList.value;
    emit('add', { evt, list: _list });
  };

  // 更新回调
  const updateCallback = (evt: any) => {
    const _list = props.isReverse ? cloneDeep(widgetsList.value).reverse() : widgetsList.value;
    emit('update', { evt, list: _list });
  };

  const moveCallback = (evt: any) => {
    emit('move', evt);
  };

  const startCallback = (evt) => {
    const { oldIndex } = evt;
    const item = clone(props.widgets[oldIndex]);
    designer.setDragData(item);
  };

  const endCallback = () => {
    designer.setDragData(null);
  };

  const getCmpName = (data) => {
    if (isFormFieldType(data)) {
      return 'cmp_field';
    }
    if ([FormComponents.Form, FormComponents.RdoForm, FormComponents.MedProRdoForm].includes(data.type)) {
      return 'cmp_form';
    }
    return 'cmp_other';
  };

  const disableDrag = (type) => {
    const disableDragList = [FormComponents.BottomButtonContainer];
    return disableDragList.includes(type);
  };

  /** 容器内是否有字段组件 */
  const containerHasField = (data) => {
    const fieldList = findNodeAll(data?.children || [], (res) => isFormFieldType(res)).map(
      (item) => item.preLocation,
    );
    return fieldList?.[0];
  };

  // 1. 只有字段 如果拖入的组件内 （只能在当前表单内拖拽）
  // 2. 只包含空表单 （可以随意拖拽，但不能拖入另一个表单中）
  // 3. 有表单并且表单内有拖入的字段 （可以随意拖拽、但不能拖入到另一个表单中）
  const containerHasFormOrField = (data) => {
    const list = findNodeAll(
      data?.children || [],
      (res) =>
        [FormComponents.Form, FormComponents.RdoForm, FormComponents.MedProRdoForm].includes(res.type) || isFormFieldType(res),
    );

    const hasForm = list.some((item) =>
      [FormComponents.Form, FormComponents.RdoForm, FormComponents.MedProRdoForm].includes(item.type),
    );
    const hasField = list.some((item) => isFormFieldType(item));
    if (hasForm) {
      if (hasField) {
        return 'form2field';
      }
      return 'form';
    } else {
      if (hasField) {
        return 'field';
      }
      return undefined;
    }
  };

  const onPull = (_a, _b, source) => {
    // 如果拖拽的是字段
    if (source.dataset.cmpname === 'cmp_field') {
      if (_a && _a.el) {
        if (!has(_a.el.dataset, 'informid')) {
          console.log('字段只能拖入到表单中');
          return false;
        }
        if (source.dataset.prelocation && _a.el.dataset.informid !== source.dataset.prelocation) {
          console.log('字段不能跨表单拖拽');
          return false;
        }
      }
    } else if (source.dataset.cmpname === 'cmp_form') {
      if (has(_a.el.dataset, 'informid')) {
        console.log('cmp_form ==> 表单不能嵌套');
        return false;
      }
    } else if (source.dataset.cmpname === 'cmp_other') {
      if (has(source.dataset, 'incontainer')) {
        // 1. 只有字段 如果拖入的组件内 （只能在当前表单内拖拽）
        if (source.dataset.incontainer === 'field') {
          if (!has(_a.el.dataset, 'informid')) {
            console.log('所拖拽的组件中包含字段，不能拖拽到表单外');
            return false;
          }
          if (_a.el.dataset.informid !== source.dataset.hasfield) {
            console.log('所拖拽的组件中包含字段, 字段不能跨表单拖拽');
            return false;
          }
        } else if (
          source.dataset.incontainer === 'form2field' ||
          source.dataset.incontainer === 'form'
        ) {
          // 2. 只包含空表单 （可以随意拖拽，但不能拖入另一个表单中）
          // 3. 有表单并且表单内有拖入的字段 （可以随意拖拽、但不能拖入到另一个表单中）
          if (has(_a.el.dataset, 'informid')) {
            console.log('cmp_other ==> 表单不能嵌套');
            return false;
          }
        }
      }
    }
    return true;
  };

  const onPut = (e) => {
    const modal = document.querySelector('.design-modal-canvas');

    if (modal && !modal?.contains(e.el)) {
      // 如果存在弹窗，且拖动目标元素不在弹窗内部时，不允许拖入
      return false;
    }

    const data = designer.getDragData();
    if (data) {
      if (props.isPut) {
        return props.isPut(props.parentWidget, data);
      }
      return isDropAllowed(props.parentWidget, data);
    }
    return true;
  };
</script>

<style lang="less" scoped>
  .widget-drag {
    height: 100%;
    min-height: inherit;
    // overflow: auto;
  }

  // .widget-drag__item {
  //   border: 1px solid transparent;
  // }
</style>
