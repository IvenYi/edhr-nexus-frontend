<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="link-page-button">
  import { inject, ref } from 'vue';
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
      await Event.runEventByName('beforeJump', props.widget.events, props.formData, props.index);
      tableEvent.linkPage &&
        (await tableEvent.linkPage(props.widget?.props?.linkPage, props.formData, props.index));
      await Event.runEventByName('afterJump', props.widget.events, props.formData, props.index);
    } catch (error) {}
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
