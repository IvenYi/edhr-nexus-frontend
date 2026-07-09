<template>
  <component
    :formData="formRowData"
    :is="defComponet"
    :widget="widget"
    v-model="value"
    :ref="onload"
    :style="widget.formItem ? {} : wrapperStyle"
    v-bind="$attrs"
  >
    <template v-for="(_value, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </component>
</template>

<script lang="ts" setup>
  defineOptions({
    inheritAttrs: false,
  });
  import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { AsyncGctComponents } from '/@page-designer/components/padModule';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { useDependency } from '../Event/Dependency/useDependency';

  const props = defineProps<{
    widget: LowCodeWidget.BasicSchema;
    formData: { [key: string]: any };
  }>();
  const { wrapperStyle } = useStyle(props.widget);
  const { isField, id, type } = props.widget;
  const { field, modelKey, notSubmitInHide } = props.widget.props;
  const defComponet = computed(() => {
    // if (props.widget && props.widget._plugin) {
    //   return AsyncGctComponents.getComponentByPluginTag(props.widget._plugin.key);
    // }
    return AsyncGctComponents.getComponentByType(props.widget.type);
  });
  const Event = getPageEvent();
  const onload = async (el) => {
    //隐藏不提交的字段 notSubmitInHide开启表示隐藏提交
    if (isField && field && notSubmitInHide === false) {
      if (!formRowData.value._NOSUBMIT) {
        formRowData.value._NOSUBMIT = {};
      }
      //开启隐藏不提交的需要再formData提交的时候打上标识，方便提交的时候删除字段
      formRowData.value._NOSUBMIT[id] = !el ? field : undefined;
    }
    if (el) {
      Event.initNode(id, { elRef: el, type });
    } else {
      Event.destroyNode(id);
    }
  };
  onUnmounted(() => {});

  const { value, formRowData } = useDependency(props.widget, props.formData);
</script>
