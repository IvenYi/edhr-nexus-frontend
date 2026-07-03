<template>
  <taglabel v-if="rowReadonly || readonly" v-bind="separatorAttr" />
  <van-field v-else v-model="value" :placeholder="widget.props.placeholder" is-link readonly />
</template>

<script setup lang="ts" name="gct-transaction">
  import { computed, toRefs } from 'vue';
  import { useWidget, widgetProps } from '/@page-designer/hooks/useWidget';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';

  const props = defineProps(widgetProps);
  const { value } = useWidget(props);

  const { fieldType, readonly } = toRefs(props.widget.props);

  const separatorAttr = computed(() => {
    return {
      type: fieldType.value,
      tagWidgetStyle: props.widget.style,
      isDesign: true,
    };
  });
</script>

<style lang="less" scoped>
  .van-cell {
    padding: 0;
  }
</style>
