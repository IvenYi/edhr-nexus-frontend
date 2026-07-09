<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-sub-table-edit-button">
  import { inject, ref, toRefs } from 'vue';
  import { BaseButton } from '/@page-designer/types/mobile';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import vantButton from '../../__components__/vantButton.vue';

  const Event = getPageEvent();
  const props = defineProps<{ widget: BaseButton; formData?: object; index?: number }>();
  const tableEvent = inject<any>('tableEvent', {});
  const loading = ref(false);

  async function onclick() {
    try {
      await Event.runEventByName('beforeEdit', props.widget.events, props.formData, props.index);
      tableEvent.edit && (await tableEvent.edit(props.formData, props.index));
      await Event.runEventByName('afterEdit', props.widget.events, props.formData, props.index);
    } catch (error) {
      console.error(error);
    }
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
