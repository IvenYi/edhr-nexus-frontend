<template>
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-table-link-button">
  import baseButton from '../../__components__/base_button.vue';
  import { inject, ref, toRefs } from 'vue';
  import { Button } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  const Event = getPageEvent();
  const props = defineProps<{ widget: Button; formData?: object }>();
  const tableEvent = inject<any>('tableEvent', {});
  const loading = ref(false);

  async function onclick() {
    try {
      await Event.runEventByName('beforeJump', props.widget.events, props.formData);
      tableEvent.linkPage && (await tableEvent.linkPage(props.formData, props.widget));
      await Event.runEventByName('afterJump', props.widget.events, props.formData);
    } catch (error) {}
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
