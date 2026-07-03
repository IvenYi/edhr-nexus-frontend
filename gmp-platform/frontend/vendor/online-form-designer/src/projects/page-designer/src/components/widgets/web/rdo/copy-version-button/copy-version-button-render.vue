<template>
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-bind="widget.props" @click="sumbit" />
</template>

<script setup lang="ts" name="gct-copy-version-button">
  import baseButton from '../../__components__/base_button.vue';
  import { ref, toRefs, onBeforeMount, onMounted, watchEffect, inject } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Button } from '/@page-designer/types/web';
  const props = defineProps<{ widget: Button; formData?: object }>();
  const Event = getPageEvent();
  const tableEvent = inject<any>('tableEvent', {});
  async function sumbit() {
    try {
      await Event.runEventByName('beforeCopy', props.widget.events, props.formData);
      tableEvent.copyVersion && (await tableEvent.copyVersion(props.formData, props.widget));
      await Event.runEventByName('afterCopy', props.widget.events, props.formData);
    } catch (error) {}
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
