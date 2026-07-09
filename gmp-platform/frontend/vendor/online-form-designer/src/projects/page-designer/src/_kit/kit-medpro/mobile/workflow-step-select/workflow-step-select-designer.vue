<template>
  <van-field
    class="app-design-select"
    v-model="value"
    :is-link="!readonly"
    readonly
    :label="label"
    :required="widget.props.required"
    :disabled="widget.props.disabled"
    :placeholder="widget.props.placeholder"
    input-align="right"
  />
</template>
<script name="gct-select" setup lang="ts">
  import { computed, toRefs } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';

  const props = defineProps(widgetProps);
  const { readonly } = toRefs(props.widget.props);

  const label = computed(() => {
    return props.widget.props.label;
  });

  const value = computed(() => {
    return readonly.value ? '设备一' : '';
  });
</script>

<style lang="less" scoped></style>
