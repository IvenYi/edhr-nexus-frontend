<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-sub-table-delete-button">
  import { inject, ref, toRefs } from 'vue';
  import { BaseButton } from '/@page-designer/types/mobile';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import vantButton from '../../__components__/vantButton.vue';
  const Event = getPageEvent();
  const props = defineProps<{ widget: BaseButton; formData?: object; index?: number }>();
  const tableEvent = inject<any>('tableEvent', {});
  const loading = ref(false);

  async function onclick() {
    loading.value = true;
    try {
      await Event.runEventByName('beforeDelete', props.widget.events, props.formData, props.index);
      tableEvent.delete && (await tableEvent.delete(props.formData, props.index));
      await Event.runEventByName('afterDelete', props.widget.events, props.formData, props.index);
    } catch (error) {}
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
