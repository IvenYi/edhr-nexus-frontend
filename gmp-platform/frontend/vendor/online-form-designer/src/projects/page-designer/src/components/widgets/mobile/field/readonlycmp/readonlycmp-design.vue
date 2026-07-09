<template>
  <taglabel v-bind="separatorAttr" />
</template>

<script setup lang="ts" name="gct-readonlycmp">
  import { toRefs, computed } from 'vue';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';

  import { widgetProps } from '/@page-designer/hooks/useWidget';

  const props = defineProps(widgetProps);

  const { fieldType } = toRefs(props.widget.props);

  const separatorAttr = computed(() => {
    return {
      isDesign: true,
      type: fieldType.value,
      tagWidgetStyle: props.widget.style,
    };
  });
</script>
<style scoped lang="less"></style>
