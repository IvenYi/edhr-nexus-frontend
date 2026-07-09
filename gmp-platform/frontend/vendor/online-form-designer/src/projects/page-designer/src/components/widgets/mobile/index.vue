<template>
  <component
    :is="defComponet"
    :widget="widget"
    :style="widget.formItem ? {} : wrapperStyle"
    :formData="formData"
  >
    <template v-for="(_value, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </component>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { AsyncGctComponents } from '/@page-designer/components/mobileModule';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { useDependency } from '/@/projects/web-render/src/render/Event/Dependency/useDependency';

  const props = defineProps<{
    widget: LowCodeWidget.BasicSchema;
    formData: object;
  }>();
  const { wrapperStyle } = useStyle(props.widget);

  const defComponet = computed(() => {
    if (props.widget && props.widget._plugin) {
      return AsyncGctComponents.getComponentByPluginTag(props.widget._plugin.key);
    }
    return AsyncGctComponents.getComponentByType(props.widget.type);
  });
  useDependency(props.widget, props.formData, true);
</script>
