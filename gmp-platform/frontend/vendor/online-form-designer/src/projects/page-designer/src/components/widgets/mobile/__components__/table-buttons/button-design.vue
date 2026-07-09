<template>
  <WidgetWrapper
    :parentWidget="parentWidget"
    :widget="widget"
    :actionTypes="['parent', 'delete']"
    :parentList="parentList"
    :indexOfParentList="indexOfParentList"
  >
    <vantButton :widget="widget" v-bind="{ ...widget.props, ...$attrs }" class="bottom-btn" />
  </WidgetWrapper>
</template>

<script name="gct-bottom-container" setup lang="ts">
  import { BaseButton } from '/@page-designer/types/mobile';
  import vantButton from '..//vantButton.vue';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  const props = defineProps<{ widget: BaseButton; parentWidget: any; parentList: any }>();
  const indexOfParentList = props.parentList.findIndex((i) => i.id === props.widget.id);
</script>
<style lang="less" scoped>
  .bottom-btn {
    display: block;
  }
</style>
