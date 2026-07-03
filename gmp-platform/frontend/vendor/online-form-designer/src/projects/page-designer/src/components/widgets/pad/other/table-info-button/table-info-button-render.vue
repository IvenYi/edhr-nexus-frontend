<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-table-info-button">
  import vantButton from '../../__components__/vantButton.vue';
  import { inject, ref, toRefs } from 'vue';
  import { Button } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  const Event = getPageEvent();
  const props = defineProps<{ widget: Button; formData?: object }>();
  const tableEvent = inject<any>('tableEvent', {});
  const loading = ref(false);

  async function onclick() {
    try {
      await Event.runEventByName('beforeClick', props.widget.events, props.formData);
      tableEvent.openDetails && (await tableEvent.openDetails(props.formData, props.widget));
      await Event.runEventByName('afterClick', props.widget.events, props.formData);
    } catch (error) {}
  }

  defineExpose({});
</script>
<style scoped lang="less"></style>
