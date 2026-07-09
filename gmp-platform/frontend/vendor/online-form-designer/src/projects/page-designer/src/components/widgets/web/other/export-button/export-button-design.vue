<template>
  <basic-button v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')" v-bind="basic">
    {{ title }}</basic-button
  >
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-else v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-export-button">
  import basicButton from '../../__components__/basic_button.vue';
  import baseButton from '../../__components__/base_button.vue';
  import { toRefs } from 'vue';
  import { ExportButton } from '/@page-designer/types/web';

  const props = defineProps<{ widget: ExportButton }>();
  const { title, basic } = toRefs(props.widget.props);
</script>
<style scoped lang="less"></style>
