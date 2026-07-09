<template>
  <div class="overflow-hidden">
    <div
      :style="{
        'text-align': textAlign,
        marginLeft: -margin / 2 + 'px',
        marginRight: -margin / 2 + 'px',
      }"
    >
      <div v-for="(widget, index) in children" :key="index" v-bind="elAttr">
        <slot :children="[widget]"></slot>
      </div>
    </div>
  </div>
</template>

<script name="gct-layout-container" setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import { LayoutContainer } from '/@page-designer/types/web';

  const props = defineProps<{ widget: LayoutContainer }>();
  const { children } = reactive(props.widget);
  const { margin, textAlign } = reactive(props.widget.props);

  const elAttr = computed(() => {
    return {
      style: {
        marginLeft: margin / 2 + 'px',
        marginRight: margin / 2 + 'px',
      },
    };
  });
</script>

<style lang="less" scoped></style>
