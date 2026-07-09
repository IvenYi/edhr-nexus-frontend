<template>
  <div class="dyn-form-value w100%">
    <taglabel v-if="rowReadonly || readonly" v-bind="separatorAttr" />
    <van-field v-else v-model="value" :placeholder="widget.props.placeholder" />
  </div>
</template>

<script name="gct-dynamic-form-value" setup lang="ts">
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
  .dyn-form-value {
    background-color: #f7f8fa;

    :deep(.van-cell) {
      padding: 0 10px !important;
    }
  }
</style>
