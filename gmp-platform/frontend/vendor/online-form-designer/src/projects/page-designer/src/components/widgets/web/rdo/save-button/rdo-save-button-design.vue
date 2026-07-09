<template>
  <basic-button type="primary" v-bind="basic"> {{ title }}</basic-button>
</template>

<script setup lang="ts" name="gct-rdo-save-button">
  import basicButton from '../../__components__/basic_button.vue';
  import { toRefs } from 'vue';
  import { Button } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Button }>();
  const { title, basic } = toRefs(props.widget.props);
</script>
<style scoped lang="less"></style>
