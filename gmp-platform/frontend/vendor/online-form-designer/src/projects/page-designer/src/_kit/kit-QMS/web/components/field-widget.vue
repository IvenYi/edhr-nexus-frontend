<!-- 字段组件映射 -->
<template>
  <div v-if="showComponent">
    <component
      :is="defComponent"
      :widget="fieldWidgetData"
      :ref="onLoad"
      v-model="value"
      :formData="formRowData"
    />
  </div>
</template>

<script setup lang="ts">
  import { toRef, ref, } from 'vue';
  import {
    getRenderComponentByType,
    getDesignComponentByType,
  } from '/@page-designer/components/widgets/web/field/index';
  import { dependencyToShow } from '/@web-render/render/Event/Dependency/useDependencyToShow';
  import {
    useDependency,
    useDependencyByRequired,
  } from '/@web-render/render/Event/Dependency/useDependency';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const props = defineProps<{
    mode?: 'design' | 'render';
    widget: any;
    rowValue: {
      _DICT?: object;
      _STYLE?: object;
      [key: string]: string | number | undefined | object;
    };
    index?: number;
  }>();

  const Event = getPageEvent();

  const defComponent = toRef(() =>
    props.mode === 'design'
      ? getDesignComponentByType(props.widget.type)
      : getRenderComponentByType(
          props.widget.type,
          props.widget.props.fieldType!,
          !!props.widget.props.readonly,
        ),
  );

  const fieldWidgetData = ref({
    ...props.widget,
    props: { ...props.widget.props },
  });

  const onLoad = async (el) => {
    if (!!el) {
      Event?.initNode?.(props.widget.id, { elRef: el, type: props.widget.type });
    } else {
      Event?.destroyNode?.(props.widget.id);
    }
  };

  const { value, formRowData } = useDependency(fieldWidgetData.value, props.rowValue, true);
  const showComponent = dependencyToShow(fieldWidgetData.value, props.rowValue);
  useDependencyByRequired(fieldWidgetData.value);
</script>
<style scoped lang="less"></style>
