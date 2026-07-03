<template>
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-sub-table-edit-button">
  import baseButton from '../../__components__/base_button.vue';
  import { inject, ref, toRefs } from 'vue';
  import { Button } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  const Event = getPageEvent();
  const props = defineProps<{ widget: Button; formData?: object; rowIndex: Number }>();
  const tableEvent = inject<any>('tableEvent', {});
  const loading = ref(false);

  async function onclick() {
    try {
      await Event.runEventByName('beforeEdit', props.widget.events, props.formData, props.rowIndex);
      tableEvent.edit && (await tableEvent.edit(props.formData, props.widget, props.rowIndex));
      await Event.runEventByName('afterEdit', props.widget.events, props.formData, props.rowIndex);
    } catch (error) {}
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
