<template>
  <template v-if="rowReadonly || readonly">
    <span
      v-if="field === 'parent_id_' && formData?.tree_first_field_type && !formData?.parent_id_"
    ></span>
    <taglabel v-else v-bind="separatorAttr" />
  </template>
  <van-field
    v-else
    class="app-design-select"
    v-model="value"
    is-link
    readonly
    :placeholder="widget.props.placeholder"
  />
</template>
<script name="gct-select" setup lang="ts">
  import { computed, toRefs } from 'vue';
  import { useWidget, widgetProps } from '/@page-designer/hooks/useWidget';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';

  const props = defineProps(widgetProps);
  const { value } = useWidget(props);
  const { fieldType, readonly, field } = toRefs(props.widget.props);

  const separatorAttr = computed(() => {
    return {
      type: props.formData?.tree_first_field_type ?? fieldType.value,
      tagWidgetStyle: props.widget.style,
      isDesign: true,
    };
  });
</script>

<style lang="less" scoped>
  .app-design-select {
    padding: 0 !important;
  }
</style>
